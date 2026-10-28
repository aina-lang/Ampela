import React, { useState } from "react";
import i18n from "@/constants/i18n";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "@/components/ui";
import { downloadToDevice } from "@/utils/downloads";

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const iconFor = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "document-text-outline";
  if (["doc", "docx"].includes(ext)) return "document-outline";
  if (["xls", "xlsx", "csv"].includes(ext)) return "grid-outline";
  return "attach-outline";
};

/** Pièce jointe (document) : icône, nom, taille ; téléchargement au toucher. */
const FileBubble = ({ url, name, size, mine, accentColor }) => {
  const fg = mine ? "#FFFFFF" : "#2B2530";
  const [saving, setSaving] = useState(false);
  const download = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await downloadToDevice(url, name);
    } catch (error) {
      toast.error(error.message || i18n.t("msgDownloadFailed"));
    } finally {
      setSaving(false);
    }
  };
  return (
    <TouchableOpacity onPress={download} activeOpacity={0.8} style={styles.row}>
      <View style={[styles.icon, { backgroundColor: mine ? "rgba(255,255,255,0.25)" : `${accentColor}22` }]}>
        <Ionicons name={iconFor(name)} size={20} color={mine ? "#FFFFFF" : accentColor} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.name, { color: fg }]} numberOfLines={2}>
          {name || i18n.t("msgFile")}
        </Text>
        <Text style={[styles.meta, { color: mine ? "rgba(255,255,255,0.8)" : "#8E8793" }]}>
          {[formatSize(size), i18n.t("msgDownload")].filter(Boolean).join(" · ")}
        </Text>
      </View>
      {saving ? (
        <ActivityIndicator size="small" color={mine ? "#FFFFFF" : accentColor} />
      ) : (
        <Ionicons name="download-outline" size={18} color={mine ? "#FFFFFF" : accentColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 240,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flexShrink: 1,
  },
  name: {
    fontFamily: "SBold",
    fontSize: 13,
  },
  meta: {
    fontFamily: "Regular",
    fontSize: 11,
    marginTop: 2,
  },
});

export default FileBubble;

import React from "react";
import Avatar from "@/components/ui/Avatar";
import i18n from "@/constants/i18n";
import { formatDateFr } from "@/services/reminders";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import { useAuth } from "@/hooks/AuthContext";
import { useDiscoveryTheme } from "@/components/discovery";
import { isDoctor, describeRole } from "@/utils/roles";

/** « 21:04 » aujourd'hui, « hier », « lun. » cette semaine, sinon « 12/10 ». */
const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  if (date.toDateString() === now.toDateString()) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  const diffDays = Math.floor((now - date) / dayMs);
  if (diffDays === 1) return i18n.t("timeYesterday");
  if (diffDays < 7) return formatDateFr(date).split(" ")[0];
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * Ligne d'une conversation. `target` vient de GET /users :
 * `{ id, username, profession, profileImage, lastMessage }`.
 */
/** Aperçu du dernier message : texte, ou icône + libellé pour une pièce jointe. */
const previewOf = (m) => {
  if (!m) return { text: "" };
  if (m.deletedAt) return { text: i18n.t("msgDeletedPlaceholder"), icon: "ban-outline" };
  if (m.attachmentType === "image") return { text: i18n.t("msgPhoto"), icon: "image-outline" };
  if (m.attachmentType === "audio") return { text: i18n.t("msgVoiceMessage"), icon: "mic-outline" };
  if (m.attachmentType === "file") return { text: i18n.t("msgFile"), icon: "document-attach-outline" };
  return { text: m.text };
};

const MessageItem = ({ onPress, onLongPress, target, last = false }) => {
  const { user } = useAuth();
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const lastMessage = target?.lastMessage;
  const fromMe = lastMessage?.userId === user?.id;
  const unread = target?.unreadCount ?? 0;
  const preview = previewOf(lastMessage);

  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowDivider]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarRing, { borderColor: accentContainer }]}>
        <Avatar uri={target?.profileImage} name={target?.username} fill fontSize={19} />
      </View>

      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {target?.username}
          </Text>
          {!!lastMessage && (
            <Text style={styles.time}>{formatTimestamp(lastMessage.createdAt)}</Text>
          )}
        </View>
        {isDoctor(target) && (
          <View style={[styles.jobChip, { backgroundColor: accentContainer }]}>
            <Ionicons name="medkit-outline" size={11} color={accentColor} />
            <Text style={[styles.job, { color: accentColor }]} numberOfLines={1}>
              {describeRole(target)}
            </Text>
          </View>
        )}
        {lastMessage ? (
          <View style={styles.previewRow}>
            {!!preview.icon && (
              <Ionicons name={preview.icon} size={14} color={unread > 0 ? "#2B2530" : "#8E8793"} />
            )}
            <Text style={[styles.preview, unread > 0 && styles.previewUnread]} numberOfLines={1}>
              {fromMe ? `${i18n.t("msgYou")} : ` : ""}
              {preview.text}
            </Text>
          </View>
        ) : (
          <Text style={[styles.preview, styles.previewEmpty]} numberOfLines={1}>
            Commencer la conversation
          </Text>
        )}
      </View>

      {unread > 0 ? (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#C9C3CC" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F4",
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  text: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontFamily: "SBold",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
    flexShrink: 1,
  },
  time: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#A9A4AE",
  },
  jobChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 3,
  },
  job: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 3,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  preview: {
    flexShrink: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#5C5661",
  },
  previewUnread: {
    fontFamily: "SBold",
    color: "#2B2530",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "SBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  previewEmpty: {
    color: "#A9A4AE",
    fontStyle: "italic",
  },
});

export default MessageItem;

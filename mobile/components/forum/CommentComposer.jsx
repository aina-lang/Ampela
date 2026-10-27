import React, { useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import i18n from "@/constants/i18n";
import { useDiscoveryTheme } from "@/components/discovery";

/**
 * Champ de commentaire en pilule avec bouton d'envoi, et bandeau
 * « Réponse à … » quand `replyTo` est défini.
 */
const CommentComposer = ({
  value,
  onChangeText,
  onSend,
  replyTo,
  onCancelReply,
  editing,
  onCancelEdit,
  sending = false,
  style,
}) => {
  const { accentColor, accentColorDisabled } = useDiscoveryTheme();
  const canSend = !!value.trim() && !sending;
  const inputRef = useRef(null);

  // « Répondre » ou « Modifier » : le curseur se place tout de suite dans le champ.
  useEffect(() => {
    if (replyTo || editing) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [replyTo, editing]);

  return (
    <View style={style}>
      {editing && (
        <View style={styles.replyBanner}>
          <Ionicons name="create-outline" size={14} color="#7A737F" />
          <Text style={styles.replyBannerText} numberOfLines={1}>
            Modification de votre commentaire
          </Text>
          <TouchableOpacity onPress={onCancelEdit} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[styles.cancel, { color: accentColor }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
      {replyTo && !editing && (
        <View style={styles.replyBanner}>
          <Ionicons name="return-down-forward-outline" size={14} color="#7A737F" />
          <Text style={styles.replyBannerText} numberOfLines={1}>
            Réponse à {replyTo.author?.username || "Anonyme"}
          </Text>
          <TouchableOpacity onPress={onCancelReply} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[styles.cancel, { color: accentColor }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.composer, { borderColor: accentColorDisabled }]}>
        <TextInput
          ref={inputRef}
          multiline
          placeholder={replyTo ? "Votre réponse…" : i18n.t("ecrireUnCommentaire")}
          placeholderTextColor="#A9A4AE"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          selectionColor={accentColor}
          cursorColor={accentColor}
          editable={!sending}
        />
        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          activeOpacity={0.85}
          accessibilityLabel="Envoyer"
          style={[styles.send, { backgroundColor: canSend ? accentColor : "#E4DEE6" }]}
        >
          <Ionicons name={editing ? "checkmark" : "send"} size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  replyBannerText: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#7A737F",
    flex: 1,
  },
  cancel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
  },
  // Fond blanc + liseré couleur du thème : bien visible sur les cartes et le fond pastel.
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
    maxHeight: 96,
    paddingVertical: 6,
  },
  send: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});

export default CommentComposer;

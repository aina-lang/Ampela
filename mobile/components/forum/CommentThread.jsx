import React from "react";
import i18n from "@/constants/i18n";
import { formatDateFr } from "@/services/reminders";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SIZES } from "@/constants";
import { Skeleton } from "@/components/ui";
import { useDiscoveryTheme } from "@/components/discovery";

/** « il y a 2 h », « hier », « 26 octobre 2026 ». */
export const relativeDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return i18n.t("timeJustNow");
  if (minutes < 60) return i18n.t("timeMinutesAgo", { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return i18n.t("timeHoursAgo", { n: hours });
  const days = Math.round(hours / 24);
  if (days === 1) return i18n.t("timeYesterday");
  if (days < 7) return i18n.t("timeDaysAgo", { n: days });
  return `${formatDateFr(date)} ${date.getFullYear()}`;
};

/** Deux lignes fantômes le temps du chargement. */
export const CommentThreadSkeleton = () => (
  <View style={styles.list}>
    {[0, 1].map((i) => (
      <View key={i} style={styles.row}>
        <Skeleton width={i ? "28%" : "35%"} height={11} />
        <Skeleton width={i ? "70%" : "90%"} height={11} style={{ marginTop: 8 }} />
      </View>
    ))}
  </View>
);

/**
 * Fil de commentaires à un niveau de réponses. `comments` est la liste
 * plate de l'API (parentId pour les réponses). `onReply(comment)` est
 * appelé par le bouton « Répondre » (sur un commentaire comme sur une
 * réponse : la réponse à une réponse se place sous le même commentaire
 * racine, avec une mention @Pseudo) ; absent = pas de bouton.
 * `onEdit` / `onDelete` n'apparaissent que sur ses propres commentaires
 * (`currentUserId`).
 */
const CommentThread = ({ comments, onReply, onEdit, onDelete, currentUserId, emptyText }) => {
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const roots = (comments ?? []).filter((c) => !c.parentId);

  const actions = (comment) => {
    const mine = !!currentUserId && comment.authorId === currentUserId;
    if (!onReply && !mine) return null;
    return (
      <View style={styles.actions}>
        {onReply && (
          <TouchableOpacity onPress={() => onReply(comment)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[styles.action, { color: accentColor }]}>{i18n.t("forumReply")}</Text>
          </TouchableOpacity>
        )}
        {mine && onEdit && (
          <TouchableOpacity onPress={() => onEdit(comment)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.action}>{i18n.t("forumEdit")}</Text>
          </TouchableOpacity>
        )}
        {mine && onDelete && (
          <TouchableOpacity onPress={() => onDelete(comment)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[styles.action, styles.danger]}>{i18n.t("forumDelete")}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (roots.length === 0) {
    return (
      <Text style={styles.empty}>
        {emptyText ?? i18n.t("forumNoCommentsStart")}
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {roots.map((c) => {
        const replies = comments.filter((r) => r.parentId === c.id);
        return (
          <View key={c.id} style={c.pending && styles.pending}>
            <View style={styles.row}>
              <View style={styles.head}>
                <Text style={styles.author} numberOfLines={1}>
                  {c.author?.username || i18n.t("anonymous")}
                </Text>
                <Text style={styles.date}>{relativeDate(c.createdAt)}</Text>
              </View>
              <Text style={styles.text}>{c.content}</Text>
              {actions(c)}
            </View>
            {replies.map((r) => (
              <View
                key={r.id}
                style={[styles.row, styles.replyRow, { borderLeftColor: accentContainer }]}
              >
                <View style={styles.head}>
                  <Text style={styles.author} numberOfLines={1}>
                    {r.author?.username || i18n.t("anonymous")}
                  </Text>
                  <Text style={styles.date}>{relativeDate(r.createdAt)}</Text>
                </View>
                <Text style={styles.text}>{r.content}</Text>
                {actions(r)}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  pending: {
    opacity: 0.55,
  },
  list: {
    gap: 8,
  },
  row: {
    backgroundColor: "#F8F7FA",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  // Chaque réponse est décalée et espacée de la précédente.
  replyRow: {
    marginLeft: 20,
    marginTop: 8,
    backgroundColor: "#FBFAFC",
    borderLeftWidth: 3,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  author: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#433C47",
    flexShrink: 1,
  },
  date: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#A9A4AE",
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 19,
    color: "#5C5661",
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },
  action: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
  },
  danger: {
    color: "#E24C6B",
  },
  empty: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8E8793",
    textAlign: "center",
    paddingVertical: 10,
  },
});

export default CommentThread;

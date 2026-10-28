import React, { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import i18n from "@/constants/i18n";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SIZES } from "@/constants";
import { likePost, unlikePost } from "@/services/forumAPI";
import { getCurrentUser } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "@/components/ui";
import { useDiscoveryTheme } from "@/components/discovery";
import CommentThread, { CommentThreadSkeleton, relativeDate } from "@/components/forum/CommentThread";
import CommentComposer from "@/components/forum/CommentComposer";
import CommentDeleteSheet from "@/components/forum/CommentDeleteSheet";
import { useComments } from "@/hooks/useComments";

const BODY_PREVIEW = 220;

/**
 * Carte d'un post du forum. `post` vient de l'API (likeCount,
 * commentCount, likedByMe) ; `onChange(post)` remonte la version mise à
 * jour au parent après un like ou un commentaire. Un appui sur le titre
 * ou le texte ouvre l'écran de la question.
 */
const ForumItem = ({ post, onChange }) => {
  const router = useRouter();
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const user = getCurrentUser();
  const [isDisabled, setIsDisabled] = useState(false);
  const thread = useComments(post.id, {
    onCountChange: (delta) =>
      onChange?.({ ...post, commentCount: (post.commentCount ?? 0) + delta }),
  });

  const body = post.description || "";
  const isLong = body.length > BODY_PREVIEW;
  const shownBody = isLong ? body.slice(0, BODY_PREVIEW).trimEnd() + "…" : body;
  const open = () => router.push({ pathname: "/(drawer)/(forum)/post", params: { id: post.id } });

  const handleLikeIconPress = async () => {
    if (!user || !post?.id || isDisabled) return;
    setIsDisabled(true);
    // Optimiste : la réaction s'affiche tout de suite, le serveur confirme
    // ensuite (et on revient en arrière s'il refuse).
    const previous = post;
    onChange?.({
      ...post,
      likedByMe: !post.likedByMe,
      likeCount: Math.max(0, (post.likeCount ?? 0) + (post.likedByMe ? -1 : 1)),
    });
    try {
      const updated = previous.likedByMe ? await unlikePost(post.id) : await likePost(post.id);
      onChange?.(updated);
    } catch (error) {
      console.log("Like failed:", error?.message ?? error);
      onChange?.(previous);
      toast.error(i18n.t("forumReactionFailed"));
    } finally {
      setIsDisabled(false);
    }
  };

  const toggleComments = () => {
    if (thread.comments !== null) {
      thread.setComments(null);
      thread.cancelReply();
      return;
    }
    thread.load();
  };

  const commentsOpen = thread.comments !== null;

  return (
    <View style={styles.card}>
      {/* En-tête : avatar cerclé, auteur, profession, date relative */}
      <View style={styles.header}>
        <View style={[styles.avatarRing, { borderColor: accentContainer }]}>
          <Avatar uri={post.authorImage} name={post.authorName} fill fontSize={17} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.authorName} numberOfLines={1}>
            {post.authorName || i18n.t("anonymous")}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[
              post.authorRole === "doctor"
                ? i18n.t("roleDoctor")
                : null,
              relativeDate(post.createdAt),
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
        <TouchableOpacity onPress={open} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="open-outline" size={20} color="#A9A4AE" />
        </TouchableOpacity>
      </View>

      {/* Contenu (appui = écran de la question) */}
      <TouchableOpacity onPress={open} activeOpacity={0.7}>
        <Text style={styles.title}>{post?.title || "Sans titre"}</Text>
        <Text style={styles.body}>{shownBody}</Text>
        {isLong && <Text style={[styles.more, { color: accentColor }]}>Lire la suite</Text>}
        {post.photos ? <Image source={{ uri: post.photos }} style={styles.postPhoto} /> : null}
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleLikeIconPress}
          disabled={isDisabled}
          activeOpacity={0.8}
          style={[styles.actionChip, post.likedByMe && { backgroundColor: accentContainer }]}
        >
          <Ionicons
            name={post.likedByMe ? "heart" : "heart-outline"}
            color={post.likedByMe ? accentColor : "#7A737F"}
            size={18}
          />
          <Text style={[styles.actionText, post.likedByMe && { color: accentColor }]}>
            {post.likeCount ?? 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleComments}
          activeOpacity={0.8}
          style={[styles.actionChip, commentsOpen && { backgroundColor: accentContainer }]}
        >
          <Ionicons
            name={commentsOpen ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
            color={commentsOpen ? accentColor : "#7A737F"}
            size={18}
          />
          <Text style={[styles.actionText, commentsOpen && { color: accentColor }]}>
            {i18n.t("forumCommentCount", { count: post.commentCount ?? 0 })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Commentaires dépliés */}
      {thread.loading && (
        <View style={styles.thread}>
          <CommentThreadSkeleton />
        </View>
      )}
      {commentsOpen && (
        <View style={styles.thread}>
          <CommentThread
            comments={thread.comments}
            currentUserId={user?.id}
            onReply={user ? thread.startReply : undefined}
            onEdit={thread.startEdit}
            onDelete={thread.requestDelete}
          />
        </View>
      )}

      {user && (
        <CommentComposer
          style={styles.composer}
          value={thread.value}
          onChangeText={thread.setValue}
          onSend={thread.send}
          replyTo={thread.replyTo}
          onCancelReply={thread.cancelReply}
          editing={thread.editing}
          onCancelEdit={thread.cancelEdit}
          sending={thread.sending}
        />
      )}
      <CommentDeleteSheet thread={thread} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontFamily: "SBold",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
  },
  meta: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
    marginTop: 2,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    lineHeight: 26,
    color: "#2B2530",
    marginTop: 16,
    marginBottom: 8,
  },
  body: {
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    lineHeight: 22,
    color: "#5C5661",
  },
  more: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    marginTop: 6,
  },
  postPhoto: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F6F5F8",
  },
  actionText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#7A737F",
  },
  thread: {
    marginTop: 14,
  },
  composer: {
    marginTop: 12,
  },
});

export default ForumItem;

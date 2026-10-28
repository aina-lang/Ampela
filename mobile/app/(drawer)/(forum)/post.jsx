import React, { useCallback, useEffect, useState, useRef } from "react";
import { useCache, writeCache } from "@/services/localCache";
import Avatar from "@/components/ui/Avatar";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs, SecondaryButton, Skeleton, toast } from "@/components/ui";
import AuthContent from "@/components/AuthContent";
import { useModal } from "@/hooks/ModalProvider";
import i18n from "@/constants/i18n";
import ConfirmSheet from "@/components/ConfirmSheet";
import CommentThread, { CommentThreadSkeleton, relativeDate } from "@/components/forum/CommentThread";
import CommentComposer from "@/components/forum/CommentComposer";
import CommentDeleteSheet from "@/components/forum/CommentDeleteSheet";
import { useComments } from "@/hooks/useComments";
import { getPost, likePost, unlikePost, deletePost } from "@/services/forumAPI";
import { getCurrentUser } from "@/services/api";
import { subscribeToMessageEvents } from "@/services/messagesAPI";

/**
 * Écran d'une question du forum : publication complète, réactions, fil
 * des commentaires (avec réponses) et zone de saisie fixée en bas.
 */
const PostScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const user = getCurrentUser();
  const { openModal } = useModal();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liking, setLiking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const thread = useComments(id, {
    onCountChange: (delta) =>
      setPost((current) =>
        current ? { ...current, commentCount: (current.commentCount ?? 0) + delta } : current
      ),
  });
  const { load: loadComments } = thread;

  // Local d'abord : version en cache affichée avant le rafraîchissement.
  const cachedPost = useCache(`forum:post:${id}`);
  useEffect(() => {
    if (!cachedPost || post) return undefined;
    const timer = setTimeout(() => {
      setPost(cachedPost);
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedPost]);

  const loadAll = useCallback(async () => {
    try {
      const [fresh] = await Promise.all([getPost(id), loadComments()]);
      setPost(fresh);
      writeCache(`forum:post:${id}`, fresh);
    } catch (error) {
      console.error("Erreur lors du chargement de la question : ", error);
      toast.error(error.message || i18n.t("forumQuestionLoadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, loadComments]);

  useEffect(() => {
    // Chargement différé d'un tick : évite un setState synchrone dans l'effet.
    const timer = setTimeout(loadAll, 0);
    return () => clearTimeout(timer);
  }, [loadAll]);

  // Au retour de l'écran de modification : version à jour.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      const timer = setTimeout(loadAll, 0);
      return () => clearTimeout(timer);
    }, [loadAll])
  );

  // Temps réel : compteurs, commentaires des autres membres, suppression.
  const { applyRemote } = thread;
  useEffect(() => {
    return subscribeToMessageEvents((event, payload) => {
      if (event === "post:updated" && payload.id === id) {
        setPost((current) => {
          if (!current) return current;
          const next = { ...current, likeCount: payload.likeCount ?? current.likeCount, commentCount: payload.commentCount ?? current.commentCount };
          if (payload.title !== undefined) next.title = payload.title;
          if (payload.description !== undefined) next.description = payload.description;
          if (payload.photos !== undefined) next.photos = payload.photos;
          return next;
        });
      } else if (event === "post:deleted" && payload.id === id) {
        toast.info(i18n.t("forumQuestionDeleted"));
        router.back();
      } else if (event.startsWith("comment:") && payload.postId === id) {
        applyRemote(event, payload);
      }
    });
  }, [id, applyRemote, router]);

  const toggleLike = async () => {
    if (!user || !post || liking) return;
    setLiking(true);
    const previous = post;
    setPost({
      ...post,
      likedByMe: !post.likedByMe,
      likeCount: Math.max(0, (post.likeCount ?? 0) + (post.likedByMe ? -1 : 1)),
    });
    try {
      const updated = previous.likedByMe ? await unlikePost(post.id) : await likePost(post.id);
      setPost(updated);
      writeCache(`forum:post:${id}`, updated);
    } catch (_error) {
      setPost(previous);
      toast.error(i18n.t("forumReactionFailed"));
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
      toast.success(i18n.t("forumQuestionDeleted"));
      router.back();
    } catch (error) {
      toast.error(error.message || i18n.t("forumDeleteFailed"));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isMine = !!user && !!post && post.authorId === user.id;
  const commentCount = post?.commentCount ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAll();
              }}
              tintColor={accentColor}
              colors={[accentColor]}
            />
          }
        >
          {loading || !post ? (
            <View style={styles.card}>
              <View style={styles.header}>
                <Skeleton width={48} height={48} radius={24} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="45%" height={12} />
                  <Skeleton width="30%" height={10} style={{ marginTop: 8 }} />
                </View>
              </View>
              <Skeleton width="90%" height={20} style={{ marginTop: 18 }} />
              <Skeleton width="100%" height={12} style={{ marginTop: 14 }} />
              <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
              <Skeleton width="70%" height={12} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={[styles.avatarRing, { borderColor: accentContainer }]}>
                  <Avatar uri={post.authorImage} name={post.authorName} fill fontSize={17} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName} numberOfLines={1}>
                    {post.authorName || i18n.t("anonymous")}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {[
              post.authorRole === "doctor" ? i18n.t("roleDoctor") : null,
              relativeDate(post.createdAt),
            ]
              .filter(Boolean)
              .join(" · ")}
                  </Text>
                </View>
                {isMine && (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(drawer)/(forum)/addpost",
                        params: { id: post.id, title: post.title ?? "", description: post.description ?? "", photos: post.photos ?? "" },
                      })
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={i18n.t("forumEditQuestion")}
                    style={{ marginRight: 14 }}
                  >
                    <Ionicons name="create-outline" size={20} color={accentColor} />
                  </TouchableOpacity>
                )}
                {isMine && (
                  <TouchableOpacity
                    onPress={() => setConfirmDelete(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={i18n.t("forumDeleteQuestion")}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E24C6B" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.body}>{post.description}</Text>
              {post.photos ? <Image source={{ uri: post.photos }} style={styles.photo} /> : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={toggleLike}
                  disabled={liking || !user}
                  activeOpacity={0.8}
                  style={[styles.actionChip, post.likedByMe && { backgroundColor: accentContainer }]}
                >
                  <Ionicons
                    name={post.likedByMe ? "heart" : "heart-outline"}
                    color={post.likedByMe ? accentColor : "#7A737F"}
                    size={18}
                  />
                  <Text style={[styles.actionText, post.likedByMe && { color: accentColor }]}>
                    {i18n.t("forumReactionCount", { count: post.likeCount ?? 0 })}
                  </Text>
                </TouchableOpacity>
                <View style={styles.actionChip}>
                  <Ionicons name="chatbubble-ellipses-outline" color="#7A737F" size={18} />
                  <Text style={styles.actionText}>
                    {i18n.t("forumCommentCount", { count: commentCount })}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Fil des commentaires */}
          <Text style={styles.sectionLabel}>{i18n.t("forumCommentsTitle")}</Text>
          <View style={styles.threadCard}>
            {thread.loading || thread.comments === null ? (
              <CommentThreadSkeleton />
            ) : (
              <CommentThread
                comments={thread.comments}
                currentUserId={user?.id}
                onReply={user ? thread.startReply : undefined}
                onEdit={thread.startEdit}
                onDelete={thread.requestDelete}
                emptyText={i18n.t("forumNoCommentsBeFirst")}
              />
            )}
          </View>
        </ScrollView>

        {/* Saisie fixée en bas (ou invitation à se connecter) */}
        {!user && (
          <View style={[styles.footer, styles.signInBar, { paddingBottom: insets.bottom + 12, backgroundColor: surface }]}>
            <Text style={styles.signInText}>{i18n.t("forumSignInToComment")}</Text>
            <SecondaryButton
              title={i18n.t("forumSignIn")}
              size="sm"
              onPress={() => openModal(<AuthContent />)}
            />
          </View>
        )}
        {user && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: surface }]}>
            <CommentComposer
              value={thread.value}
              onChangeText={thread.setValue}
              onSend={thread.send}
              replyTo={thread.replyTo}
              onCancelReply={thread.cancelReply}
              editing={thread.editing}
              onCancelEdit={thread.cancelEdit}
              sending={thread.sending}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <CommentDeleteSheet thread={thread} />

      <ConfirmSheet
        visible={confirmDelete}
        icon="trash-outline"
        danger
        title={i18n.t("forumDeleteQuestionTitle")}
        message={i18n.t("forumDeleteQuestionMessage")}
        confirmLabel={i18n.t("forumDelete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
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
    fontSize: SIZES.large,
    lineHeight: 30,
    color: "#2B2530",
    marginTop: 16,
    marginBottom: 10,
  },
  body: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    lineHeight: 24,
    color: "#5C5661",
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginTop: 14,
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
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#A9A4AE",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  threadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 12,
  },
  signInBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  signInText: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});

export default PostScreen;

import { useCallback, useState, useEffect } from "react";
import { useCache, writeCache } from "@/services/localCache";
import { getCurrentUser } from "@/services/api";
import i18n from "@/constants/i18n";
import { addComment, listComments, updateComment, deleteComment } from "@/services/forumAPI";
import { toast } from "@/components/ui";

/**
 * État et actions du fil de commentaires d'un post : chargement, envoi,
 * réponse (à un commentaire ou à une réponse → mention @Pseudo),
 * modification et suppression de ses propres commentaires.
 * `onCountChange(delta)` prévient le parent pour le compteur.
 */
export const useComments = (postId, { onCountChange } = {}) => {
  const [comments, setComments] = useState(null); // null = pas chargés
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null); // commentaire en cours de modification
  const [pendingDelete, setPendingDelete] = useState(null);
  const [sending, setSending] = useState(false);

  // Local d'abord : commentaires en cache affichés avant le rafraîchissement.
  const cachedComments = useCache(`forum:comments:${postId}`);
  useEffect(() => {
    if (!cachedComments || comments !== null) return undefined;
    const timer = setTimeout(() => setComments(cachedComments), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedComments]);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const fresh = await listComments(postId);
      setComments(fresh);
      writeCache(`forum:comments:${postId}`, fresh);
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires : ", error);
      toast.error(i18n.t("forumCommentsLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const startReply = useCallback((comment) => {
    setEditing(null);
    setReplyTo(comment);
    // Réponse à une réponse : on cite la personne, le fil reste à un niveau.
    if (comment?.parentId) {
      const mention = `@${comment.author?.username || i18n.t("anonymous")} `;
      setValue((current) => (current.startsWith("@") ? current : mention + current));
    }
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTo(null);
    setValue((current) => current.replace(/^@\S+\s*/, ""));
  }, []);

  const startEdit = useCallback((comment) => {
    setReplyTo(null);
    setEditing(comment);
    setValue(comment.content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setValue("");
  }, []);

  /** Événement temps réel d'un autre appareil : fusion sans doublon. */
  const applyRemote = useCallback(
    (event, payload) => {
      setComments((current) => {
        if (!current) return current;
        if (event === "comment:new") {
          if (current.some((c) => c.id === payload.comment.id)) return current;
          const next = [...current, payload.comment];
          writeCache(`forum:comments:${postId}`, next);
          return next;
        }
        if (event === "comment:updated") {
          const next = current.map((c) => (c.id === payload.comment.id ? payload.comment : c));
          writeCache(`forum:comments:${postId}`, next);
          return next;
        }
        if (event === "comment:deleted") {
          const next = current.filter((c) => c.id !== payload.commentId && c.parentId !== payload.commentId);
          writeCache(`forum:comments:${postId}`, next);
          return next;
        }
        return current;
      });
    },
    [postId]
  );

  const send = useCallback(async () => {
    const content = value.trim();
    if (!content || !postId || sending) return;
    setSending(true);
    const me = getCurrentUser();
    try {
      if (editing) {
        // Optimiste : le texte change tout de suite, retour arrière si refus.
        const before = editing;
        setComments((current) =>
          current ? current.map((c) => (c.id === before.id ? { ...c, content } : c)) : current
        );
        setEditing(null);
        setValue("");
        try {
          const updated = await updateComment(postId, before.id, content);
          setComments((current) =>
            current ? current.map((c) => (c.id === updated.id ? updated : c)) : current
          );
          toast.success(i18n.t("forumCommentEdited"));
        } catch (error) {
          setComments((current) =>
            current ? current.map((c) => (c.id === before.id ? before : c)) : current
          );
          throw error;
        }
      } else {
        // Optimiste : le commentaire apparaît immédiatement (grisé), puis
        // est remplacé par la version du serveur.
        const tempId = `tmp-${Date.now()}`;
        const parentId = replyTo?.id ?? null;
        const temp = {
          id: tempId,
          postId,
          parentId,
          content,
          createdAt: new Date().toISOString(),
          author: me ? { id: me.id, username: me.username, profileImage: me.profileImage } : null,
          authorId: me?.id,
          pending: true,
        };
        setValue("");
        setReplyTo(null);
        setComments((current) => (current ? [...current, temp] : [temp]));
        onCountChange?.(1);
        try {
          const comment = await addComment(postId, content, parentId);
          setComments((current) => {
            if (!current) return current;
            const withoutTemp = current.filter((c) => c.id !== tempId);
            const next = withoutTemp.some((c) => c.id === comment.id) ? withoutTemp : [...withoutTemp, comment];
            writeCache(`forum:comments:${postId}`, next);
            return next;
          });
        } catch (error) {
          setComments((current) => (current ? current.filter((c) => c.id !== tempId) : current));
          onCountChange?.(-1);
          setValue(content);
          throw error;
        }
      }
    } catch (error) {
      console.log("Comment send failed:", error?.message ?? error);
      toast.error(error.message || i18n.t("forumCommentSendFailed"));
    } finally {
      setSending(false);
    }
  }, [value, postId, sending, replyTo, editing, onCountChange]);

  const requestDelete = useCallback((comment) => setPendingDelete(comment), []);
  const cancelDelete = useCallback(() => setPendingDelete(null), []);

  /** Supprime le commentaire en attente (et ses réponses, côté serveur). */
  const confirmDelete = useCallback(async () => {
    const target = pendingDelete;
    if (!target || !postId) return;
    setSending(true);
    try {
      await deleteComment(postId, target.id);
      let removed = 0;
      setComments((current) => {
        if (!current) return current;
        const next = current.filter((c) => c.id !== target.id && c.parentId !== target.id);
        removed = current.length - next.length;
        return next;
      });
      if (editing?.id === target.id) cancelEdit();
      if (replyTo?.id === target.id || replyTo?.parentId === target.id) setReplyTo(null);
      onCountChange?.(-Math.max(removed, 1));
      toast.success(i18n.t("forumCommentDeleted"));
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire : ", error);
      toast.error(error.message || i18n.t("forumDeleteFailed"));
    } finally {
      setPendingDelete(null);
      setSending(false);
    }
  }, [pendingDelete, postId, editing, replyTo, cancelEdit, onCountChange]);

  return {
    comments,
    setComments,
    loading,
    load,
    value,
    setValue,
    replyTo,
    startReply,
    cancelReply,
    sending,
    send,
    editing,
    startEdit,
    cancelEdit,
    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
    applyRemote,
  };
};

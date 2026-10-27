import { useCallback, useState } from "react";
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

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      setComments(await listComments(postId));
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires : ", error);
      toast.error("Impossible de charger les commentaires.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const startReply = useCallback((comment) => {
    setEditing(null);
    setReplyTo(comment);
    // Réponse à une réponse : on cite la personne, le fil reste à un niveau.
    if (comment?.parentId) {
      const mention = `@${comment.author?.username || "Anonyme"} `;
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

  const send = useCallback(async () => {
    const content = value.trim();
    if (!content || !postId || sending) return;
    setSending(true);
    try {
      if (editing) {
        const updated = await updateComment(postId, editing.id, content);
        setComments((current) =>
          current ? current.map((c) => (c.id === updated.id ? updated : c)) : current
        );
        setEditing(null);
        setValue("");
        toast.success("Commentaire modifié.");
      } else {
        const comment = await addComment(postId, content, replyTo?.id ?? null);
        setValue("");
        setReplyTo(null);
        setComments((current) => (current ? [...current, comment] : current));
        onCountChange?.(1);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire : ", error);
      toast.error(error.message || "Impossible d'envoyer le commentaire.");
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
      toast.success("Commentaire supprimé.");
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire : ", error);
      toast.error(error.message || "Suppression impossible.");
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
  };
};

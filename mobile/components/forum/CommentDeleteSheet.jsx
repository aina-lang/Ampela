import React from "react";
import ConfirmSheet from "@/components/ConfirmSheet";

/** Confirmation de suppression d'un commentaire, branchée sur useComments. */
const CommentDeleteSheet = ({ thread }) => {
  const target = thread.pendingDelete;
  const isRoot = !!target && !target.parentId;
  const hasReplies =
    isRoot && (thread.comments ?? []).some((c) => c.parentId === target.id);
  return (
    <ConfirmSheet
      visible={!!target}
      icon="trash-outline"
      danger
      title={isRoot ? "Supprimer ce commentaire ?" : "Supprimer cette réponse ?"}
      message={
        hasReplies
          ? "Le commentaire et toutes ses réponses seront supprimés définitivement."
          : "Cette action est définitive."
      }
      confirmLabel="Supprimer"
      loading={thread.sending}
      onConfirm={thread.confirmDelete}
      onCancel={thread.cancelDelete}
    />
  );
};

export default CommentDeleteSheet;

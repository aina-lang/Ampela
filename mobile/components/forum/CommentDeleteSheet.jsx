import React from "react";
import i18n from "@/constants/i18n";
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
      title={isRoot ? i18n.t("forumDeleteCommentTitle") : i18n.t("forumDeleteReplyTitle")}
      message={
        hasReplies
          ? i18n.t("forumDeleteCommentMessage")
          : i18n.t("forumDeleteReplyMessage")
      }
      confirmLabel={i18n.t("forumDelete")}
      loading={thread.sending}
      onConfirm={thread.confirmDelete}
      onCancel={thread.cancelDelete}
    />
  );
};

export default CommentDeleteSheet;

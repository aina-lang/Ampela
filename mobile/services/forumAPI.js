import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

/** Posts du forum, du plus récent au plus ancien, avec compteurs. */
export const listPosts = () => apiGet("/posts");

export const createPost = ({ title, description, photos }) =>
  apiPost("/posts", { title, description, photos: photos ?? null });

export const deletePost = (postId) => apiDelete(`/posts/${postId}`);

/** Modification par l'auteure ; renvoie le post mis à jour. */
export const updatePost = (postId, { title, description, photos }) =>
  apiPatch(`/posts/${postId}`, { title, description, photos: photos ?? null });

/** Renvoie le post mis à jour (likeCount, likedByMe). */
export const likePost = (postId) => apiPost(`/posts/${postId}/like`);
export const unlikePost = (postId) => apiDelete(`/posts/${postId}/like`);

export const getPost = (postId) => apiGet(`/posts/${postId}`);
export const listComments = (postId) => apiGet(`/posts/${postId}/comments`);
export const addComment = (postId, content, parentId = null) =>
  apiPost(`/posts/${postId}/comments`, parentId ? { content, parentId } : { content });
export const updateComment = (postId, commentId, content) =>
  apiPatch(`/posts/${postId}/comments/${commentId}`, { content });
export const deleteComment = (postId, commentId) =>
  apiDelete(`/posts/${postId}/comments/${commentId}`);

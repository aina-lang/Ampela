import { apiGet, apiPost, apiDelete } from "@/services/api";

export const listNotifications = () => apiGet("/notifications");
export const unreadNotificationsCount = () => apiGet("/notifications/unread-count");
export const markAllNotificationsRead = () => apiPost("/notifications/read");
export const markNotificationRead = (id) => apiPost(`/notifications/${id}/read`);
export const deleteNotification = (id) => apiDelete(`/notifications/${id}`);

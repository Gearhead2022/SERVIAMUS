import api from "./axios";

export const getAllNotificationPerId = async (user_id: number) => {
    const res = await api.get(`/api/notification/${user_id}/getAllNotification`);
    return res.data.data; // already final
};

export const markAsReadById = async (user_id: number) => {
    const res = await api.patch(`/api/notification/${user_id}/markAsRead`);
    return res.data.data;
};
export const markAllAsReadById = async (user_id: number) => {
    const res = await api.patch(`/api/notification/${user_id}/markAllAsRead`);
    return res.data.data;
};

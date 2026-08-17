import api from "./axios";

export const getAllNotificationPerId = async () => {
    const res = await api.get("/api/notification");
    return res.data.data; // already final
};

export const markAsReadById = async (notificationId: number) => {
    const res = await api.patch(`/api/notification/${notificationId}/read`);
    return res.data.data;
};
export const markAllAsReadById = async () => {
    const res = await api.patch("/api/notification/mark-all-read");
    return res.data.data;
};

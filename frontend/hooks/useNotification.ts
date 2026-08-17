import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllNotificationPerId, markAllAsReadById, markAsReadById } from "@/services/notification.services";
import SweetAlert from "@/utils/SweetAlert";
import toast from "react-hot-toast";

export const useNotifications = (user_id: number) => {
    return useQuery({
        queryKey: ["notifications", user_id],
        queryFn: getAllNotificationPerId,
        enabled: !!user_id,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notifId: number) => {
            return markAsReadById(notifId);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications"],
            });
        },

        onError: (error: unknown) => {
            SweetAlert.errorAlert(
                "Update Failed",
                error instanceof Error ? error.message : "Something went wrong"
            );
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllAsReadById,

        onSuccess: () => {
            toast.success("Notifications marked as read");

            queryClient.invalidateQueries({
                queryKey: ["notifications"],
            });
        },

        onError: (error: unknown) => {
            SweetAlert.errorAlert(
                "Update Failed",
                error instanceof Error ? error.message : "Something went wrong"
            );
        },
    });
};

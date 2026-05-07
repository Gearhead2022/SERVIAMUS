import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllNotificationPerId, markAllAsReadById, markAsReadById } from "@/services/notification.services";
import SweetAlert from "@/utils/SweetAlert";
import toast from "react-hot-toast";

export const useNotifications = (user_id: number) => {
    return useQuery({
        queryKey: ["notifications", user_id],
        queryFn: () => getAllNotificationPerId(user_id),
        enabled: !!user_id,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user_id: number) => {
            return markAsReadById(user_id);
        },

        onSuccess: (_, user_id) => {
            toast.success("Notifications marked as read");

            queryClient.invalidateQueries({
                queryKey: ["notifications", user_id],
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
        mutationFn: ({ user_id }: { user_id: number }) => markAllAsReadById(user_id),

        onSuccess: (_, user_id) => {
            toast.success("Notifications all marked as read");

            queryClient.invalidateQueries({
                queryKey: ["notifications", user_id],
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
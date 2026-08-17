import { getAllServices, getAllUsers, getDashboardStats, updateService } from "@/services/admin.services";
import { Role } from "@/types/AuthTypes";
import { PaginationMeta } from "@/types/RequestTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SweetAlert from "@/utils/SweetAlert";

type StatusFilter = "all" | "active" | "inactive";

export type ServiceRecord = {
    service_id: number;
    reference_id: number;
    service_name: string;
    price: number;
    date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: "consultation" | "laboratory" | "certificate" | "other";
};

export interface UpdateServicePayload {
    service_name: string;
    price: number;
    date: string;
    is_active: boolean;
}

export interface UserFilters {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    role?: string;
    status?: StatusFilter;
    category?: string;
}

export interface UsersProps2 {
    user_id: number;
    username: string;
    name: string;
    license_no: string;
    title: string;
    ptr_no: string;
    is_active: boolean;
    created_at: string;
    role: UserRole | null;
}

// Account responses expose one flattened RoleTypes record as `role`.
// Keeping this alias preserves the modal contract without assuming role IDs.
export type UserRole = Role;

export interface TableRequestProps<T> {
    data: T[];
    pagination: PaginationMeta;
}

export const useGetAllUsers = (
    params: UserFilters
) => {
    return useQuery<TableRequestProps<UsersProps2>>({
        queryKey: ["users", "list", params,],
        queryFn: () => getAllUsers(params),
    });
};

export const useGetAllServices = (
    params: UserFilters
) => {
    return useQuery<TableRequestProps<ServiceRecord>>({
        queryKey: ["services", "list", params],
        queryFn: () => getAllServices(params),
    });
};

export const useUpdateService = (closeModal: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            service_id,
            data,
        }: {
            service_id: number;
            data: UpdateServicePayload;
        }) => updateService(service_id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });

            SweetAlert.successAlert(
                "Success",
                "Service updated successfully"
            );
            closeModal();
        },

        onError: (error: unknown) => {
            SweetAlert.errorAlert(
                "Update Failed",
                error instanceof Error ? error.message : "Something went wrong"
            );
        },
    });
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboardStats,
    });
};

import { ServiceProps } from "@/types/AuthTypes";
import api from "./axios";
import { UpdateServicePayload, UserFilters } from "@/hooks/admin/useAdmin";

export const getAllUsers = async (
    params: UserFilters
) => {

    const res = await api.get("/api/request/getUsers",
        { params, }
    );

    return res.data;
};

export const getAllServices = async (
    params: UserFilters
) => {

    const res = await api.get("/api/admin/services",
        { params, }
    );

    return res.data;
};

export const updateService = async (
    service_id: number,
    data: UpdateServicePayload
) => {
    const res = await api.put(`/api/admin/${service_id}/update`, data);
    return res.data.data;
};

export const getDashboardStats = async () => {
    const response = await api.get("/api/admin/dashboard/admin");

    return response.data.data;
};
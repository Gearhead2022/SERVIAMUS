"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSocket } from "@/lib/socket";
import AppToast from "../components/CustomToast";

type EntityType = "request" | "consultation" | "lab" | "billing" | "admin";

type NotificationData = {
    type: "NEW_REQUEST" | "APPROVED" | "REJECTED" | "SYSTEM";
    title: string;
    message: string;
    entity?: EntityType;
    entity_id?: number;
    is_read?: boolean;
};

type NotificationHandler = (data: NotificationData) => void;

const ENTITY_QUERY_MAP: Record<EntityType, ReadonlyArray<readonly string[]>> = {
    request: [ ["lab"], ["billing"], ["dashboard"]], //["queue"],["request"], ["labRequests"]
    consultation: [["consultation"], ["consultation", "list"], ["queue"], ["dashboard"]],
    lab: [["lab"], ["laboratory"], ["billing"], ["request"], ["queue"], ["dashboard"]],
    billing: [["billing"], ["dashboard"]],
    admin: [["users"], ["services"], ["billing"], ["request"], ["queue"], ["dashboard"]],
};

export default function useSocket(onNotification?: NotificationHandler) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = createSocket();

        socket.connect();

        const invalidateKeys = (keys: ReadonlyArray<readonly string[]>) => {
            keys.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        };

        const handleNotification = (data: NotificationData) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            if (data.entity) {
                invalidateKeys(ENTITY_QUERY_MAP[data.entity]);
            }

            if (typeof data.message === "string") {
                AppToast.success(data.message);
            }

            onNotification?.(data);
        };

        const handleRequestUpdated = () => {
            console.log("request:updated RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.request);
        };

        const handleRequestDeleted = () => {
            console.log("request:deleted RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.request);
        };

        const handleConsultationUpdated = () => {
            console.log("consultation:updated RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.consultation);
        };

        const handleConsultationDeleted = () => {
            console.log("consultation:deleted RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.consultation);
        };

        const handleLabUpdated = () => {
            console.log("lab:updated RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.lab);
        };

        const handleLabDeleted = () => {
            console.log("lab:deleted RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.lab);
        };

        const handleBillingUpdated = () => {
            console.log("billing:updated RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.billing);
        };

        const handleBillingDeleted = () => {
            console.log("billing:deleted RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.billing);
        };

        const handleUsersUpdated = () => {
            console.log("admin:updated RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.admin);
        };

        const handleUsersDeleted = () => {
            console.log("admin:deleted RECEIVED");
            invalidateKeys(ENTITY_QUERY_MAP.admin);
        };

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.log("Socket error:", err.message);
        });

        socket.on("notification", handleNotification);
        socket.on("request:updated", handleRequestUpdated);
        socket.on("request:deleted", handleRequestDeleted);
        socket.on("consultation:updated", handleConsultationUpdated);
        socket.on("consultation:deleted", handleConsultationDeleted);
        socket.on("lab:updated", handleLabUpdated);
        socket.on("lab:deleted", handleLabDeleted);
        socket.on("billing:updated", handleBillingUpdated);
        socket.on("billing:deleted", handleBillingDeleted);
        socket.on("admin:updated", handleUsersUpdated);
        socket.on("admin:deleted", handleUsersDeleted);

        return () => {
            socket.off("notification", handleNotification);
            socket.off("request:updated", handleRequestUpdated);
            socket.off("request:deleted", handleRequestDeleted);
            socket.off("consultation:updated", handleConsultationUpdated);
            socket.off("consultation:deleted", handleConsultationDeleted);
            socket.off("lab:updated", handleLabUpdated);
            socket.off("lab:deleted", handleLabDeleted);
            socket.off("billing:updated", handleBillingUpdated);
            socket.off("billing:deleted", handleBillingDeleted);
            socket.off("admin:updated", handleUsersUpdated);
            socket.off("admin:deleted", handleUsersDeleted);

            socket.disconnect();
        };
    }, [queryClient, onNotification]);
}
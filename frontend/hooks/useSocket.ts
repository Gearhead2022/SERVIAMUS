"use client";

import { useEffect } from "react";
import { createSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import AppToast from "../components/CustomToast";

type EntityType = "request" | "consultation" | "lab";

type NotificationData = {
    type: "NEW_REQUEST" | "APPROVED" | "REJECTED";
    title: string;
    message: string;
    entity?: EntityType;
    entity_id?: number;
    is_read?: boolean;
};

type NotificationHandler = (data: NotificationData) => void;

const ENTITY_QUERY_MAP: Record<EntityType, string[]> = {
    request: ["requests"],
    consultation: ["consultation"],
    lab: ["lab"],
};

export default function useSocket(onNotification?: NotificationHandler) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = createSocket();

        const handleNotification = (data: NotificationData) => {
            // 1. Always refresh notification list
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            // 2. Smart invalidation based on entity
            if (data.entity && ENTITY_QUERY_MAP[data.entity]) {
                ENTITY_QUERY_MAP[data.entity].forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: [key] });
                });
            }

            // 3. Toast
            if (typeof data.message === "string") {
                AppToast.success(data.message);
            }

            // 4. External handler (optional)
            onNotification?.(data);
        };

        socket.on("connect", () => {
            console.log("Connected:", socket.id);
        });

        socket.on("request:updated", () => {
            // console.log("🔥 request:updated RECEIVED");
            queryClient.invalidateQueries({ queryKey: ["labRequests"] });
        });

        // Single source of truth event
        socket.on("notification", handleNotification);

        socket.on("connect_error", (err) => {
            console.log("Socket error:", err.message);
        });

        return () => {
            socket.off("request:updated");
            socket.off("notification", handleNotification);
            socket.disconnect();
        };
    }, []);
}
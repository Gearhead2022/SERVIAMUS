"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { createSocket } from "@/lib/socket";
import AppToast from "../components/CustomToast";

type EntityType = "request" | "consultation" | "lab" | "billing";

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
  request: [["request"], ["lab"], ["queue"], ["billing"], ["labRequests"]],
  consultation: [["consultation"]],
  lab: [["lab"]],
  billing: [["billing"], ["lab"]],
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
            // console.log("request:updated RECEIVED");
            queryClient.invalidateQueries({ queryKey: ["labRequests"] });
        });

        socket.on("consultation:updated", () => {
            // console.log("request:updated RECEIVED");
            queryClient.invalidateQueries({ queryKey: ["consultation-print"] });
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

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
  const { isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      return;
    }

    const socket = createSocket();
    const invalidateQueryKeys = (queryKeys: ReadonlyArray<readonly string[]>) => {
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    };

    const handleNotification = (data: NotificationData) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (data.entity && ENTITY_QUERY_MAP[data.entity]) {
        invalidateQueryKeys(ENTITY_QUERY_MAP[data.entity]);
      }

      if (typeof data.message === "string") {
        AppToast.success(data.message);
      }

      onNotification?.(data);
    };

    const handleRequestUpdated = () => {
      invalidateQueryKeys([["request"], ["lab"], ["queue"], ["billing"], ["labRequests"]]);
    };

    const handleLabUpdated = () => {
      invalidateQueryKeys([["lab"], ["queue"]]);
    };

    const handleBillingUpdated = () => {
      invalidateQueryKeys([["billing"], ["lab"]]);
    };

    const handleConsultationCreated = () => {
      invalidateQueryKeys([["consultation"]]);
    };

    const handleConnectError = (err: Error) => {
      console.log("Socket error:", err.message);
    };

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("request:updated", handleRequestUpdated);
    socket.on("lab:updated", handleLabUpdated);
    socket.on("billing:updated", handleBillingUpdated);
    socket.on("consultation:created", handleConsultationCreated);
    socket.on("notification", handleNotification);
    socket.on("connect_error", handleConnectError);
    socket.connect();

    return () => {
      socket.off("request:updated", handleRequestUpdated);
      socket.off("lab:updated", handleLabUpdated);
      socket.off("billing:updated", handleBillingUpdated);
      socket.off("consultation:created", handleConsultationCreated);
      socket.off("notification", handleNotification);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [isAuthenticated, isAuthReady, onNotification, queryClient]);
}

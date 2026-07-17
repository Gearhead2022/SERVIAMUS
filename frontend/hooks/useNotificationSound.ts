"use client";

import { useEffect, useRef } from "react";
import { createSocket } from "@/lib/socket";
import {
  playNotificationSound,
  type SoundNotification,
} from "@/lib/notificationSound";

export default function useNotificationSound() {
  const isAudioEnabled = useRef(false);

  useEffect(() => {
    const enableAudio = () => {
      isAudioEnabled.current = true;
    };

    window.addEventListener("pointerdown", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });

    const socket = createSocket();
    const handleNotification = (notification: SoundNotification) => {
      if (isAudioEnabled.current) {
        playNotificationSound(notification);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      window.removeEventListener("pointerdown", enableAudio);
      window.removeEventListener("keydown", enableAudio);
      socket.off("notification", handleNotification);
    };
  }, []);
}

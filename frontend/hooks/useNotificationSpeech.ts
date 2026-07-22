"use client";

import { useEffect, useRef } from "react";
import { createSocket } from "@/lib/socket";
import {
  speakNotification,
  type SpeechNotification,
} from "@/lib/notificationSpeech";

export default function useNotificationSpeech() {
  const isSpeechEnabled = useRef(false);

  useEffect(() => {
    const enableSpeech = () => {
      isSpeechEnabled.current = true;
    };

    window.addEventListener("pointerdown", enableSpeech, { once: true });
    window.addEventListener("keydown", enableSpeech, { once: true });
    const socket = createSocket();
    const handleNotification = (notification: SpeechNotification) => {
      if (isSpeechEnabled.current) {
        speakNotification(notification);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      window.removeEventListener("pointerdown", enableSpeech);
      window.removeEventListener("keydown", enableSpeech);
      socket.off("notification", handleNotification);
      window.speechSynthesis?.cancel();
    };
  }, []);
}

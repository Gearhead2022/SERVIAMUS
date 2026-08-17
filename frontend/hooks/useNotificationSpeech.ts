"use client";

import { useEffect, useRef } from "react";
import { createSocket } from "@/lib/socket";
import {
  speakNotification,
  type SpeechNotification,
} from "@/lib/notificationSpeech";

export default function useNotificationSpeech() {
  const isSpeechEnabled = useRef(false);
  const queuedNotifications = useRef<SpeechNotification[]>([]);
  const isSpeaking = useRef(false);

  useEffect(() => {
    const speakNext = () => {
      if (!isSpeechEnabled.current || isSpeaking.current) return;

      const notification = queuedNotifications.current.shift();
      if (!notification) return;

      isSpeaking.current = true;
      void speakNotification(notification).finally(() => {
        isSpeaking.current = false;
        speakNext();
      });
    };

    const enableSpeech = () => {
      isSpeechEnabled.current = true;
      speakNext();
    };

    window.addEventListener("pointerdown", enableSpeech, { once: true });
    window.addEventListener("keydown", enableSpeech, { once: true });
    const socket = createSocket();
    const handleNotification = (notification: SpeechNotification) => {
      queuedNotifications.current.push(notification);
      speakNext();
    };

    socket.on("notification", handleNotification);

    return () => {
      window.removeEventListener("pointerdown", enableSpeech);
      window.removeEventListener("keydown", enableSpeech);
      socket.off("notification", handleNotification);
      window.speechSynthesis?.cancel();
      queuedNotifications.current = [];
      isSpeaking.current = false;
    };
  }, []);
}

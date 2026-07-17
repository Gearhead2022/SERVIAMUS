"use client";

import useNotificationSound from "@/hooks/useNotificationSound";

export default function NotificationSoundProvider() {
  useNotificationSound();
  return null;
}

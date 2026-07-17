export type SoundNotification = {
  type: "NEW_REQUEST" | "APPROVED" | "REJECTED" | "SYSTEM";
  entity?: "request" | "consultation" | "lab" | "billing" | "admin";
};

const SOUND_PATHS = {
  newRequest: "/sounds/new_request_notification1.wav",
  queue: "/sounds/queue.mp3",
  general: "/sounds/notf.mp3",
} as const;

const getNotificationSound = ({ type, entity }: SoundNotification) => {
  if (entity === "billing" || entity === "lab") {
    return SOUND_PATHS.queue;
  }

  if (type === "NEW_REQUEST" || entity === "request" || entity === "consultation") {
    return SOUND_PATHS.newRequest;
  }

  return SOUND_PATHS.general;
};

export const playNotificationSound = (notification: SoundNotification) => {
  if (typeof window === "undefined") {
    return;
  }

  const audio = new Audio(getNotificationSound(notification));
  audio.volume = 0.55;

  void audio.play().catch(() => {
    // Browsers can block audio until the user interacts with the application.
  });
};

export type SpeechNotification = {
  type: "NEW_REQUEST" | "APPROVED" | "REJECTED" | "SYSTEM";
  title: string;
  message: string;
  entity?: string;
};

const getSpokenMessage = ({ title, message, entity, type }: SpeechNotification) => {
  if (entity === "billing") {
    return "A new bill is ready for processing.";
  }

  if (entity === "lab-attachment") {
    return "An external laboratory result is ready for doctor review.";
  }

  if (title === "Laboratory Result Ready") {
    return "A laboratory result is ready for doctor review.";
  }

  if (title === "New Request" && type === "NEW_REQUEST") {
    if (message.includes("LABORATORY")) {
      return "A new laboratory request has been received.";
    }

    if (message.includes("CONSULTATION")) {
      return "A new consultation request has been received.";
    }
  }

  if (title === "Laboratory Billing Paid") {
    return "A paid laboratory request is ready for processing.";
  }

  return message || title;
};

export const speakNotification = (notification: SpeechNotification) => {
  return new Promise<void>((resolve) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    resolve();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(getSpokenMessage(notification));
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onend = () => resolve();
  utterance.onerror = () => resolve();

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  });
};

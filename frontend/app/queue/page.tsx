"use client";

import { useState, useMemo } from "react";
import { useGetAllQueues, useMoveToNextQueue } from "@/hooks/Queue/useQueue";
import VideoPreview from "@/components/VideoPreview";

interface QueueItem {
  queue_id: number;
  queue_number: number;
  queue_type: "CONSULTATION" | "LABORATORY";
  status: "WAITING" | "SERVING" | "COMPLETED";
  patient: {
    name: string;
    patient_code: string;
  };
}

interface QueueListProps {
  type: "CONSULTATION" | "LABORATORY";
  queues: QueueItem[];
  serving: QueueItem | null;
  onAnnouncement: (type: "CONSULTATION" | "LABORATORY") => void;
  onNextQueue: (type: "CONSULTATION" | "LABORATORY") => void;
  isPending: boolean;
}

// Component declared outside of render
const QueueList = ({ type, queues, serving,}: QueueListProps) => ( //  onAnnouncement, onNextQueue, isPending are not used in this component, so we can omit them for now
  <div className="flex-1 flex flex-col">
    <div className={`bg-gradient-to-r ${type === "CONSULTATION" ? "from-[#3b82f6] to-[#2563eb]" : "from-[#10b981] to-[#059669]"} px-8 py-6`}>
      <h2 className="font-['DM_Serif_Display'] text-2xl text-white mb-2">{type} QUEUE</h2>
      <p className="text-white/70 text-sm">{queues.length} patients</p>
    </div>

    <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gradient-to-b from-[#1e293b] to-[#334155]">
      {serving && (
        <div className={`rounded-2xl p-8 text-white mb-6 shadow-md bg-gradient-to-br from-[#dc2626] to-[#ef4444]`}>
          <p className="text-sm opacity-90 mb-2">NOW SERVING</p>
          <p className="text-5xl font-bold">{String(serving.queue_number).padStart(2, "0")}</p>
          <p className="text-lg mt-4">{serving.patient.name}</p>
          <p className="text-sm opacity-75 mt-1">{serving.patient.patient_code}</p>
        </div>
      )}

      <div className="space-y-3">
        {queues
          .filter((q) => q.status === "WAITING")
          .map((queue) => (
            <div
              key={queue.queue_id}
              className={`bg-white rounded-xl p-6 border-l-4 ${type === "CONSULTATION" ? "border-[#3b82f6]" : "border-[#10b981]"} shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`${type === "CONSULTATION" ? "text-[#0369a1]" : "text-[#15803d]"} text-sm font-semibold`}>QUEUE NUMBER</p>
                  <p className={`text-4xl font-bold ${type === "CONSULTATION" ? "text-[#0c4a6e]" : "text-[#166534]"} mt-1`}>
                    {String(queue.queue_number).padStart(2, "0")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`${type === "CONSULTATION" ? "text-[#0c4a6e]" : "text-[#166534]"} font-semibold`}>{queue.patient.name}</p>
                  <p className="text-sm text-[#64748b]">{queue.patient.patient_code}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>

    {/* Controls */}
  </div>
);

const QueueDisplay = () => {
  const { data: allQueues = [], refetch } = useGetAllQueues();
  const { mutateAsync: moveToNext, isPending } = useMoveToNextQueue();
  const [announcement, setAnnouncement] = useState("");

  const { servingConsultation, servingLab, consultationQueues, laboratoryQueues } = useMemo(() => {
    const consultation = allQueues.filter((q: QueueItem) => q.queue_type === "CONSULTATION");
    const laboratory = allQueues.filter((q: QueueItem) => q.queue_type === "LABORATORY");

    const consultationServing = consultation.find((q: QueueItem) => q.status === "SERVING");
    const labServing = laboratory.find((q: QueueItem) => q.status === "SERVING");

    return {
      servingConsultation: consultationServing || null,
      servingLab: labServing || null,
      consultationQueues: consultation,
      laboratoryQueues: laboratory,
    };
  }, [allQueues]);

  const handleAnnouncement = (type: "CONSULTATION" | "LABORATORY") => {
    const serving = type === "CONSULTATION" ? servingConsultation : servingLab;
    if (serving) {
      const message = `Patient ${String(serving.queue_number).padStart(2, "0")} please proceed to ${type.toLowerCase()} room`;
      setAnnouncement(message);
      
      // Text-to-speech
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);

      // Clear after 5 seconds
      setTimeout(() => setAnnouncement(""), 5000);
    }
  };

  const handleNextQueue = async (type: "CONSULTATION" | "LABORATORY") => {
    await moveToNext(type);
    refetch();
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-[#10b981] text-white px-8 py-6 text-center text-2xl font-semibold animate-pulse">
          {announcement}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Queues */}
        <div className="flex-1 flex flex-col border-r border-[#e8f0f8]">
          <div className="flex flex-1 overflow-hidden">
            <QueueList 
              type="CONSULTATION" 
              queues={consultationQueues} 
              serving={servingConsultation}
              onAnnouncement={handleAnnouncement}
              onNextQueue={handleNextQueue}
              isPending={isPending}
            />
            <div className="w-px bg-[#e8f0f8]"></div>
            <QueueList 
              type="LABORATORY" 
              queues={laboratoryQueues} 
              serving={servingLab}
              onAnnouncement={handleAnnouncement}
              onNextQueue={handleNextQueue}
              isPending={isPending}
            />
          </div>
        </div>

        {/* Right: Video Preview/Ads */}
        <VideoPreview />
      </div>
    </div>
  );
};

export default QueueDisplay;
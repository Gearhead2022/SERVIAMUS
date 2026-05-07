"use client";

import { useMemo } from "react";
import { useGetAllQueues } from "@/hooks/Queue/useQueue";
import QueueServingPreview from "@/components/QueueServingPreview";

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
  isPending: boolean;
}

// Component declared outside of render
const QueueList = ({ type, queues, }: QueueListProps) => (
  <div className="flex-1 flex flex-col">
    <div className={`bg-gradient-to-r ${type === "CONSULTATION" ? "from-[#3b82f6] to-[#2563eb]" : "from-[#10b981] to-[#059669]"} px-8 py-6`}>
      <h2 className="font-['DM_Serif_Display'] text-2xl text-white mb-2">{type} QUEUE</h2>
      <p className="text-white/70 text-sm">{queues.length} patients</p>
    </div>

    <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-200">
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
                  <p className={`${type === "CONSULTATION" ? "text-[#0369a1]" : "text-[#15803d]"} text-sm font-semibold`}>PATIENT CODE : <strong>{queue.patient.patient_code}</strong></p>
                  {/* <p className={`text-4xl font-bold ${type === "CONSULTATION" ? "text-[#0c4a6e]" : "text-[#166534]"} mt-1`}>
                    {String(queue.queue_number).padStart(2, "0")}
                  </p> */}
                  <p className={`text-2xl font-bold  ${type === "CONSULTATION" ? "text-[#0c4a6e]" : "text-[#166534]"} mt-1`}
                    style={{ fontFamily: "'DM Serif Display', serif" }}>
                    {queue.patient.name.toLocaleUpperCase()}
                  </p>
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
  const { data: allQueues = [], isPending } = useGetAllQueues();

  const { consultationQueues, laboratoryQueues } = useMemo(() => {
    const consultation = allQueues.filter((q: QueueItem) => q.queue_type === "CONSULTATION");
    const laboratory = allQueues.filter((q: QueueItem) => q.queue_type === "LABORATORY");
    return {
      consultationQueues: consultation,
      laboratoryQueues: laboratory,
    };
  }, [allQueues]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden bg-gradient-to-r from-[#047857] to-[#059669] shrink-0">
        <div className="flex-1 flex flex-col border-r border-[#e8f0f8]">
          <div className="flex flex-1 overflow-hidden">
            <QueueList
              type="CONSULTATION"
              queues={consultationQueues}
              isPending={isPending}
            />
            <div className="w-px bg-gradient-to-r from-[#047857] to-[#059669] shrink-0"></div>
            <QueueList
              type="LABORATORY"
              queues={laboratoryQueues}
              isPending={isPending}
            />
          </div>
        </div>

        <QueueServingPreview allQueues={allQueues} />
      </div>
    </div>
  );
};

export default QueueDisplay;
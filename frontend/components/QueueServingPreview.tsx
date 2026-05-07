"use client";

import { useState, useMemo } from "react";

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

interface VideoPreviewProps {
  onVideoChange?: (videoUrl: string) => void;
  allQueues: QueueItem[] | null;
}

const QueueServingPreview = ({ allQueues }: VideoPreviewProps) => {
  const [videoUrl] = useState<string>("/videos/one_piece.mp4");

  const { consultationServing, labServing } = useMemo(() => {
    const all = allQueues ?? [];
    return {
      consultationServing: all.filter(
        (q) => q.queue_type === "CONSULTATION" && q.status === "SERVING"
      ),
      labServing: all.filter(
        (q) => q.queue_type === "LABORATORY" && q.status === "SERVING"
      ),
    };
  }, [allQueues]);

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] overflow-hidden">

      <div className="flex flex-1 max-h-[5vh] justify-center bg-green-900/30">
        <p className="text-[30px] tracking-widest" style={{ fontFamily: "'DM Serif Display', serif" }}>NOW SERVING...</p>
      </div>
      <div className="flex flex-1 min-h-0 divide-x divide-white/8">
        {/* Consultation column */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 py-3 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] shrink-0">
            {/* <p className="text-[10px] tracking-[0.22em] font-bold text-blue-200/70 uppercase">
              Consultation
            </p> */}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-200">
            {consultationServing.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-black tracking-wider">No active patients</p>
              </div>
            ) : (
              consultationServing.map((q) => (
                <div
                  key={q.queue_id}
                  className="rounded-xl p-5 bg-gradient-to-br from-[#1e3a8a]/60 to-[#1d4ff9] border border-blue-500/20"
                >
                  <p className={`text-white text-sm font-semibold`}>PATIENT CODE : <strong>{q.patient.patient_code}</strong></p>
                  <p
                    className="text-3xl font-black text-white leading-none tracking-tight"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {q.patient.name.toUpperCase()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Laboratory column */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 py-3 bg-gradient-to-r from-[#047857] to-[#059669] shrink-0">
            {/* <p className="text-[10px] tracking-[0.22em] font-bold text-emerald-200/70 uppercase">
              Laboratory
            </p> */}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-200">
            {labServing.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-black tracking-wider">No active patients</p>
              </div>
            ) : (
              labServing.map((q) => (
                <div
                  key={q.queue_id}
                  className="rounded-xl p-5 bg-gradient-to-br from-[#064e3b]/100 to-[#059669]/30 border border-emerald-500/20"
                >
                  <p className={`text-white text-sm font-semibold`}>PATIENT CODE : <strong>{q.patient.patient_code}</strong></p>
                  <p
                    className="text-3xl font-black text-white leading-none tracking-tight"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {q.patient.name.toUpperCase()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 shrink-0" />

      {/* Bottom: Video replay */}
      <div className="h-[45%] shrink-0 p-4">
        <div className="w-full h-full rounded-xl overflow-hidden bg-black/40 border border-white/8 flex items-center justify-center">
          {videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="6" width="15" height="12" rx="2" />
                <path d="m17 10 4-2v8l-4-2" />
              </svg>
              <p className="text-[11px] tracking-widest uppercase">Video display</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default QueueServingPreview;
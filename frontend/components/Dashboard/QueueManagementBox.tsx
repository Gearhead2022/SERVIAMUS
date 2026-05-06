"use client";

import { useState } from "react";
import { useAddToQueue, useGetAllQueues } from "@/hooks/Queue/useQueue";
import { useGetAllpatient } from "@/hooks/Patient/usePatientRegistration";
import Button from "@/components/ui/Button";
import { Plus, ChevronDown, Play, RotateCcw } from "lucide-react";
import { QueueProps } from "@/types/QueueTypes";
import { PatientProps } from "@/types/PatientTypes";
import api from "@/services/axios";
import Swal from "sweetalert2";
import SweetAlert from "@/utils/SweetAlert";
import { useMoveToNextQueue } from "@/hooks/Queue/useQueue";


export default function QueueManagementBox() {
  const [expanded, setExpanded] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchPatient, setSearchPatient] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  
  const { mutateAsync: addToQueue, isPending } = useAddToQueue();
  const { data: queues = [], refetch } = useGetAllQueues();
  const { data: patients = [], isLoading: patientsLoading } = useGetAllpatient(searchPatient);


  const consultationCount = queues.filter((q: QueueProps) => q.queue_type === "CONSULTATION").length;
  const laboratoryCount = queues.filter((q: QueueProps) => q.queue_type === "LABORATORY").length;

  const handleAddToQueue = async (queue_type: "CONSULTATION" | "LABORATORY") => {
    if (!selectedPatient) {
      alert("Please select a patient");
      return;
    }

    await addToQueue({
      patient_id: selectedPatient,
      queue_type,
    });

    setSelectedPatient(null);
    setSearchPatient("");
  };

const handleStartQueue = () => {
  const params = new URLSearchParams();
  window.open(`/queue?${params.toString()}`, "QueueDisplay", "width=1920,height=1080,resizable=yes");
};

const { mutateAsync: moveToNext, isPending: movePending } = useMoveToNextQueue();

const handleNextQueue = async (type: "CONSULTATION" | "LABORATORY") => {
  await moveToNext(type);
  refetch();
};

const handleResetQueue = async () => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Reset Queue?",
      text: "Are you sure you want to reset all queues? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reset",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setIsResetting(true);
    try {
      // Call backend to reset all queues
      await api.delete("/api/queue/reset");
      
      Swal.fire({
        title: "Success",
        text: "All queues have been reset",
        icon: "success"
      });
      
      refetch();
    } catch (error: unknown) {
      SweetAlert.errorAlert(
        "Failed",
        error instanceof Error ? error.message : "Failed to reset queues"
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-lg border border-[#dce3ef] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f7f8fc] transition"
        >
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-[#0f2244]" />
            <span className="font-semibold text-[#0f2244]">Queue Control</span>
          </div>
          <ChevronDown
            size={20}
            className={`text-[#6b7da0] transition ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Content */}
        {expanded && (
          <div className="border-t border-[#dce3ef] p-4 space-y-4 w-full bg-[#f7f8fc] max-h-96 overflow-y-auto">
            {/* Start Queue Button */}
            <Button
              variant="primary"
              onClick={handleStartQueue}
              icon={<Play size={18} />}
              className="w-full !bg-[#0e7c7b] hover:!bg-[#0d6b6a] !text-sm"
            >
              Start Queue Display
            </Button>

            {/* Queue Status */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-lg border border-[#dce3ef]">
                <p className="text-xs text-[#6b7da0] font-semibold">Consultation</p>
                <p className="text-xl font-bold text-[#0f2244]">{consultationCount}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#dce3ef]">
                <p className="text-xs text-[#6b7da0] font-semibold">Laboratory</p>
                <p className="text-xl font-bold text-[#0e7c7b]">{laboratoryCount}</p>
              </div>
            </div>

            {/* Patient Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#0f2244] mb-1.5">
                Select Patient
              </label>
              <input
                type="text"
                placeholder="Search patient..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#dce3ef] focus:border-[#0f2244] outline-none bg-white mb-2 text-black"
              />

              {patientsLoading ? (
                <p className="text-xs text-[#6b7da0]">Loading...</p>
              ) : patients.length === 0 ? (
                <p className="text-xs text-[#6b7da0]">No patients</p>
              ) : (
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => setSelectedPatient(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#dce3ef] focus:border-[#0f2244] outline-none bg-white text-black"
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((patient: PatientProps) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.patient_code} - {patient.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Consultation Queue */}
            <div>
              <p className="text-xs font-semibold text-[#6b7da0] uppercase mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0f2244]"></span>
                Consultation
              </p>
              <Button
                variant="primary"
                onClick={() => handleAddToQueue("CONSULTATION")}
                isLoading={isPending}
                className="w-full !text-xs"
              >
                Add Queue
              </Button>
            </div>

            {/* Laboratory Queue */}
            <div>
              <p className="text-xs font-semibold text-[#6b7da0] uppercase mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0e7c7b]"></span>
                Laboratory
              </p>
              <Button
                variant="primary"
                onClick={() => handleAddToQueue("LABORATORY")}
                isLoading={isPending}
                className="w-full !text-xs"
              >
                Add Queue
              </Button>
            </div>
          </div>
        )}
        {/* Control Buttons*/}
        <div className="border-t border-[#dce3ef] p-4 space-y-2 bg-white">
          <Button
            variant="primary"
            onClick={() => handleNextQueue("CONSULTATION")}
            isLoading={movePending}
            className="w-full !text-xs !bg-[#0f2244]"
          >
            Next Consultation
          </Button>
          <Button
            variant="primary"
            onClick={() => handleNextQueue("LABORATORY")}
            isLoading={movePending}
            className="w-full !text-xs !bg-[#0e7c7b]"
          >
            Next Laboratory
          </Button>

          {/* Reset Queue Button */}
          <Button
            variant="danger"
            onClick={handleResetQueue}
            isLoading={isResetting}
            icon={<RotateCcw size={16} />}
            className="w-full !text-xs"
          >
            Reset All Queues
          </Button>
        </div>
      </div>
    </div>
  );
}
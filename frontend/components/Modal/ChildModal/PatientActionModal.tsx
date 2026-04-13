"use client"

import { PatientProps } from "@/types/PatientTypes";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

interface PatientActionModalProps {
  patient: PatientProps;
  onClose: () => void;
  actionTitle: (label: string) => void;
  onRequestAction: (patient: PatientProps) => void;
  onEditPatient: (patient: PatientProps) => void;
  onViewProfile: (patient: PatientProps) => void;
}

const PatientActionModal = ({
  patient,
  onClose,
  actionTitle,
  onRequestAction,
  onEditPatient,
  onViewProfile,
}: PatientActionModalProps) => {

  const actions: ActionItem[] = [
    {
      label: "Patient Request Form",
      description: "Schedule a new consultation session",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "text-[#0f2244] bg-[#eef1f9] hover:bg-[#0f2244] hover:text-white",
      onClick: () => { onRequestAction(patient); },
    },
    {
      label: "View Profile",
      description: "See full patient information",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "text-[#6b7da0] bg-[#f0f3fa] hover:bg-[#6b7da0] hover:text-white",
      onClick: () => { onViewProfile(patient); },
    },
    {
      label: "Edit Patient",
      description: "Update patient details",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "text-[#c8102e] bg-[#fdf0f2] hover:bg-[#c8102e] hover:text-white",
      onClick: () => { onEditPatient(patient); },
    },
  ];

  return (
    <>
      {/* Actions */}
      <div className="p-4 pt-2 space-y-2">
        <div><div className="flex items-center gap-5 pb-2 bg-blue-900/20 p-3 rounded-xl">
          <Image src={'/images/default.png'} alt={patient.name} width={400} height={400}
            className="w-15 h-15 object-cover ring-2 ring-white/20 rounded-[100%] bg-gray-900 p-1" />

          <div>
            <p className="text-gray-900 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
              Patient #{patient.patient_id?.toString().padStart(5, "0") ?? "—"}
            </p>
            <h2 className="text-gray-900 font-['DM_Serif_Display'] font-bold text-2xl leading-tight">
              {patient.name}
            </h2>
            <p className="text-gray-900/70 text-xs font-bold mt-0.5">
              {[patient.age && `${patient.age} yrs`, patient.sex].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] px-2 mb-3">
          Select an action
        </p>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => { action.onClick(); actionTitle(action.label); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-150 group ${action.color}`}
          >
            <div className="flex-shrink-0">{action.icon}</div>
            <div className="text-left">
              <div className="text-sm font-semibold leading-tight">{action.label}</div>
              <div className="text-xs opacity-60 mt-0.5 font-normal">{action.description}</div>
            </div>
            <svg className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex justify-end">
        <Button variant="danger" type="button" onClick={onClose}>Cancel</Button>
      </div>
    </>
  );
};

export default PatientActionModal;
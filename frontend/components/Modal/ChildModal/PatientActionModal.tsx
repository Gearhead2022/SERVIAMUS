"use client"

import { PatientProps } from "@/types/PatientTypes";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { History, Edit3Icon, ViewIcon, FormInputIcon, Trash2Icon } from "lucide-react";

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
  onViewHistory: (patient: PatientProps) => void;
}

const PatientActionModal = ({
  patient,
  onClose,
  actionTitle,
  onRequestAction,
  onEditPatient,
  onViewProfile,
  onViewHistory,
}: PatientActionModalProps) => {

  const actions: ActionItem[] = [
    {
      label: "Patient Request Form",
      description: "Schedule a new consultation session",
      icon: <FormInputIcon className="w-5 h-5" />,
      color: "text-[#0f2244] bg-[#eef1f9] hover:bg-[#0f2244] hover:text-white",
      onClick: () => onRequestAction(patient),
    },
    {
      label: "View Profile",
      description: "See full patient information",
      icon: <ViewIcon className="w-5 h-5" />,
      color: "text-[#6b7da0] bg-[#f0f3fa] hover:bg-[#6b7da0] hover:text-white",
      onClick: () => onViewProfile(patient),
    },
    {
      label: "Edit Patient",
      description: "Update patient details",
      icon: <Edit3Icon className="w-5 h-5" />,
      color: "text-[#1032c8] bg-[#f0f5fd] hover:bg-[#1072c8] hover:text-white",
      onClick: () => onEditPatient(patient),
    },
    {
      label: "View History",
      description: "View patient history",
      icon: <History className="w-5 h-5" />,
      color: "text-[#225e08] bg-[#ddf0d5] hover:bg-[#193d0a] hover:text-white",
      onClick: () => onViewHistory(patient),
    },
    {
      label: "Delete Patient",
      description: "Delete patient on list",
      icon: <Trash2Icon className="w-5 h-5" />,
      color: "text-[#c8102e] bg-[#fdf0f2] hover:bg-[#c8102e] hover:text-white",
      onClick: () => onEditPatient(patient),
    },
  ];

  return (
    <>
      {/* Patient card header */}
      <div className="p-4 pt-4">
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#eef1f9" }}>
          <Image
            src="/images/default.png"
            alt={patient.name}
            width={400}
            height={400}
            className="w-14 h-14 object-cover rounded-full ring-2 bg-gray-100 p-1"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#8a99b8" }}>
              Patient #{patient.patient_id?.toString().padStart(5, "0") ?? "—"}
            </p>
            <h2 className="font-bold text-2xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#0f2244" }}>
              {patient.name}
            </h2>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "#6b7da0" }}>
              {[patient.age && `${patient.age} yrs`, patient.sex].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-2 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: "#8a99b8" }}>
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
            <svg
              className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 flex justify-end">
        <Button variant="danger" type="button" onClick={onClose}>Cancel</Button>
      </div>
    </>
  );
};

export default PatientActionModal;
import { PatientProps } from "@/types/PatientTypes";
import Image from "next/image";

interface PatientCardProps {
  patient: PatientProps;
  onClick: (patient: PatientProps) => void;
}

const PatientCard = ({ patient, onClick }: PatientCardProps) => {
  return (
    <button
      onClick={() => onClick(patient)}
      className="group w-full text-left bg-white rounded-2xl border border-[#dce3ef] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#0f2244] focus:ring-offset-2"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0f2244] to-[#c8102e]" />

      <div className="p-5">
        {/* Avatar + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative bg-gray-900/90 p-1 rounded-[100%]">
            {patient.imageUrl ? (
              <Image
                src={patient.imageUrl}
                alt={patient.name}
                width={100}
                height={100}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <Image
                src="/images/default.png"
                alt=''
                width={100}
                height={100}
                className="w-14 h-14 rounded-xl object-cover"
              />
            )}
          </div>

          {/* Patient ID badge */}
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#6b7da0] bg-[#f0f3fa] px-2 py-1 rounded-md">
            #{patient.patient_code ?? "—"}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-['DM_Serif_Display'] text-[#0f2244] font-bold text-lg leading-tight mb-0.5">
          {patient.name}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-4">
          {patient.age && (
            <span className="text-xs text-[#6b7da0]">{patient.age} yrs</span>
          )}
          {patient.age && patient.sex && (
            <span className="text-[#dce3ef]">·</span>
          )}
          {patient.sex && (
            <span className="text-xs text-[#6b7da0] capitalize">{patient.sex}</span>
          )}
          {(patient.age || patient.sex) && patient.contact_number && (
            <span className="text-[#dce3ef]">·</span>
          )}
          {patient.contact_number && (
            <span className="text-xs text-[#6b7da0] truncate">{patient.contact_number}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f0f3fa]">
          <span className="text-[11px] text-[#6b7da0]">
            {/* {patient.lastVisit ? `Last visit: ${patient.lastVisit}` : "No prior visit"} */}
          </span>
          <span className="text-[11px] font-semibold text-[#c8102e] group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </button>
  );
};

export default PatientCard;

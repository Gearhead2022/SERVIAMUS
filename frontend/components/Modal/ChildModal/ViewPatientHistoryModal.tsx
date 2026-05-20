"use client";

import { type ElementType, useState } from "react";
import {
  Calendar,
  ChevronRight,
  FileCheck,
  FileText,
  PrinterIcon,
  Stethoscope,
  TestTube2,
  TrendingUp,
} from "lucide-react";
import {
  useAllConsultationRecords,
  useAllMedCertRecords,
} from "@/hooks/Consultation/useConsultation";
import { usePatientLabRecords } from "@/hooks/Lab/useLab";
import { ConsultationResultProps, MedicalCertificateProps } from "@/types/ConsultationTypes";
import { LabRequest } from "@/types/LabTypes";
import { PatientProps } from "@/types/PatientTypes";
import LabRecordsList from "@/components/Modal/LabModal/LabRecordsList";
import LabResultPreviewModal from "@/components/Modal/LabModal/LabResultPreviewModal";

const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]";

type TabId = "consultations" | "laboratory" | "certificates";

const TABS: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "consultations", label: "Consultations", icon: Stethoscope },
  { id: "laboratory", label: "Laboratory", icon: TestTube2 },
  { id: "certificates", label: "Certificates", icon: FileCheck },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    completed: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", label: "Completed" },
    cancelled: { bg: "#fdf2f2", text: "#991b1b", dot: "#ef4444", label: "Cancelled" },
    pending: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", label: "Pending" },
    issued: { bg: "#eef1f9", text: "#1e3a6e", dot: "#0f2244", label: "Issued" },
  };
  const meta = map[status] ?? {
    bg: "#f4f6fb",
    text: "#6b7da0",
    dot: "#b0bcd4",
    label: status,
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
      style={{ background: meta.bg, color: meta.text }}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

function VitalChip({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-3 py-2"
      style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}
    >
      <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-bold" style={{ color: "#0f2244" }}>
        {value}
      </p>
      <p className="text-[9px]" style={{ color: "#b0bcd4" }}>
        {unit}
      </p>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "#f0f3fa" }}
      >
        <Icon size={24} style={{ color: "#c0ccd8" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>
        No records found
      </p>
      <p className="mt-1 text-[11px]" style={{ color: "#b0bcd4" }}>
        {message}
      </p>
    </div>
  );
}

function ConsultationCard({
  c,
  onSelectPrescription,
  onSelectConsultation,
}: {
  c: ConsultationResultProps;
  onSelectPrescription: () => void;
  onSelectConsultation: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-2xl transition-all"
      style={{ border: "1.5px solid #dce3ef", background: "white" }}
    >
      <div
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f8f9fc]"
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: "#eef1f9" }}
        >
          <Stethoscope size={16} style={{ color: "#0f2244" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold" style={{ color: "#1a2a45" }}>
              {c.chief_complaint}
            </p>
            <StatusPill status="completed" />
          </div>

          <p className="mt-0.5 text-[11px]" style={{ color: "#8a99b8" }}>
            {c.assessment} <span className="px-1 text-[#c0ccd8]">|</span> DOCTOR{" "}
            <span className="px-1 text-[#c0ccd8]">|</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} />
              {new Date(c.consultation_date).toISOString().split("T")[0]}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all"
          style={{ background: "#f8f8df", color: "#0f2244", border: "1px solid #dce3ef" }}
          onClick={(event) => {
            event.stopPropagation();
            onSelectPrescription();
          }}
        >
          <PrinterIcon size={12} /> View Prescription
        </button>

        <button
          type="button"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all"
          style={{ background: "#dfe6f8", color: "#0f2244", border: "1px solid #dce3ef" }}
          onClick={(event) => {
            event.stopPropagation();
            onSelectConsultation();
          }}
        >
          <PrinterIcon size={12} /> Print Preview
        </button>

        <ChevronRight
          size={15}
          className="flex-shrink-0 transition-transform"
          style={{ color: "#b0bcd4", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          onClick={() => setOpen((value) => !value)}
        />
      </div>

      {open ? (
        <div className="border-t px-5 pb-5" style={{ borderColor: "#f0f3fa" }}>
          <div className="mb-4 mt-4">
            <p className={`${labelCls} mb-2`}>Vital Signs</p>
            <div className="grid grid-cols-6 gap-2">
              <VitalChip label="BP" value={c.bp ?? ""} unit="mmHg" />
              <VitalChip label="Temp" value={c.temp ?? ""} unit="C" />
              <VitalChip label="CR" value={c.cr ?? ""} unit="bpm" />
              <VitalChip label="RR" value={c.rr ?? ""} unit="/min" />
              <VitalChip label="Wt" value={c.wt ?? ""} unit="kg" />
              <VitalChip label="Ht" value={c.ht ?? ""} unit="cm" />
            </div>
          </div>

          {c.assessment ? (
            <div
              className="mb-4 rounded-xl px-4 py-3"
              style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}
            >
              <p className={`${labelCls} mb-1`}>Doctor&apos;s Notes</p>
              <p className="text-[13px]" style={{ color: "#4a5568" }}>
                {c.assessment}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CertCard({ cert }: { cert: MedicalCertificateProps }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-5"
      style={{ border: "1.5px solid #dce3ef", background: "white" }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[13.5px] font-semibold" style={{ color: "#1a2a45" }}>
              {cert.purpose}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: "#8a99b8" }}>
              <span className="inline-flex items-center gap-1">
                <Calendar size={10} /> {cert.result_date}
              </span>
            </p>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[11.5px]" style={{ color: "#6b7da0" }}>
          <FileText size={11} className="flex-shrink-0" />
          Purpose: {cert.purpose}
        </p>
      </div>
    </div>
  );
}

const ViewPatientHistoryModal: React.FC<{
  patient: PatientProps | null;
  onViewPrescription: (consultation_id: number) => void;
  onViewConsultation: (data: ConsultationResultProps) => void;
}> = ({ patient, onViewPrescription, onViewConsultation }) => {
  const [activeTab, setActiveTab] = useState<TabId>("consultations");
  const [activeLabRecord, setActiveLabRecord] = useState<LabRequest | null>(null);

  const { data: consultationList, isLoading: consultLoading } = useAllConsultationRecords({
    patient_id: patient?.patient_id ?? 0,
    search: "",
  });

  const { data: medCertList, isLoading: medCertLoading } = useAllMedCertRecords({
    patient_id: patient?.patient_id ?? 0,
    search: "",
  });

  const {
    data: labRecords = [],
    error: labRecordsError,
    isLoading: labRecordsLoading,
  } = usePatientLabRecords(patient?.patient_id);

  const initials = patient?.name
    ? patient.name
        .split(" ")
        .map((namePart: string) => namePart[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const counts = {
    consultations: consultationList?.length ?? 0,
    laboratory: labRecords.length,
    certificates: medCertList?.length ?? 0,
  };

  return (
    <>
      {activeLabRecord?.resultPayload ? (
        <LabResultPreviewModal
          backLabel="Back to History"
          onClose={() => setActiveLabRecord(null)}
          record={activeLabRecord}
        />
      ) : null}

      <div className="flex min-h-[560px] flex-col bg-white font-['DM_Sans']" style={{ maxHeight: "80vh" }}>
        <div
          className="flex flex-shrink-0 items-center gap-5 px-6 py-5"
          style={{ background: "#f7f8fc", borderBottom: "1.5px solid #dce3ef" }}
        >
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)",
              boxShadow: "0 4px 14px rgba(15,34,68,0.2)",
            }}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-['DM_Serif_Display'] text-xl leading-tight text-[#0f2244]">
              {patient?.name ?? "Patient"}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {patient?.patient_code ? (
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: "#eef1f9", color: "#0f2244" }}
                >
                  {patient.patient_code}
                </span>
              ) : null}
              {patient?.age ? (
                <span className="text-[11px]" style={{ color: "#6b7da0" }}>
                  {patient.age} yrs
                </span>
              ) : null}
              {patient?.sex ? (
                <span className="text-[11px]" style={{ color: "#6b7da0" }}>
                  {patient.sex}
                </span>
              ) : null}
              {patient?.contact_number ? (
                <span className="text-[11px]" style={{ color: "#6b7da0" }}>
                  {patient.contact_number}
                </span>
              ) : null}
            </div>
          </div>

          <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
            {[
              { icon: Stethoscope, count: counts.consultations, label: "Consults", color: "#0f2244", bg: "#eef1f9" },
              { icon: TestTube2, count: counts.laboratory, label: "Lab Tests", color: "#0e7c7b", bg: "#e0f4f4" },
              { icon: FileCheck, count: counts.certificates, label: "Certificates", color: "#7c4dab", bg: "#f3eefb" },
            ].map(({ icon: Icon, count, label, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: bg, border: `1px solid ${bg}` }}
              >
                <Icon size={13} style={{ color }} />
                <div>
                  <p className="text-[14px] font-bold leading-none" style={{ color }}>
                    {count}
                  </p>
                  <p className="text-[9px] font-medium" style={{ color, opacity: 0.7 }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-shrink-0 items-center gap-1 px-6 py-3"
          style={{ borderBottom: "1px solid #eef1f9" }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-all"
              style={
                activeTab === id
                  ? { background: "#0f2244", color: "white" }
                  : { background: "transparent", color: "#6b7da0" }
              }
            >
              <Icon size={13} />
              {label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={
                  activeTab === id
                    ? { background: "rgba(255,255,255,0.2)", color: "white" }
                    : { background: "#eef1f9", color: "#0f2244" }
                }
              >
                {counts[id]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: "#f8f9fc" }}>
          {activeTab === "consultations" ? (
            <div className="space-y-3">
              {consultLoading ? (
                <EmptyState icon={Stethoscope} message="Loading consultation history..." />
              ) : !consultationList?.length ? (
                <EmptyState icon={Stethoscope} message="No consultation records yet" />
              ) : (
                consultationList.map((consultation) => (
                  <ConsultationCard
                    key={consultation.consultation_id}
                    c={consultation}
                    onSelectPrescription={() => onViewPrescription(consultation.consultation_id!)}
                    onSelectConsultation={() => onViewConsultation(consultation)}
                  />
                ))
              )}
            </div>
          ) : null}

          {activeTab === "laboratory" ? (
            <LabRecordsList
              emptyMessage="No laboratory records yet"
              error={labRecordsError}
              isLoading={labRecordsLoading}
              onViewResult={setActiveLabRecord}
              records={labRecords}
            />
          ) : null}

          {activeTab === "certificates" ? (
            <div className="space-y-3">
              {medCertLoading ? (
                <EmptyState icon={FileCheck} message="Loading certificate history..." />
              ) : !medCertList?.length ? (
                <EmptyState icon={FileCheck} message="No certificates issued yet" />
              ) : (
                medCertList.map((certificate) => (
                  <CertCard key={certificate.mcr_id} cert={certificate} />
                ))
              )}
            </div>
          ) : null}
        </div>

        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-3"
          style={{ borderTop: "1px solid #eef1f9", background: "#f7f8fc" }}
        >
          <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
            Showing{" "}
            {activeTab === "consultations"
              ? counts.consultations
              : activeTab === "laboratory"
                ? counts.laboratory
                : counts.certificates}{" "}
            record(s)
          </p>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} style={{ color: "#b0bcd4" }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPatientHistoryModal;

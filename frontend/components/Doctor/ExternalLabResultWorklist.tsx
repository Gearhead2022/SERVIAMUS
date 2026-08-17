"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  FileText,
  Files,
  Inbox,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useExternalLabAttachmentWorklist } from "@/hooks/Lab/useLab";
import { ExternalLabAttachmentWorklistItem } from "@/types/LabTypes";
import ExternalLabAttachments from "@/components/Modal/LabModal/ExternalLabAttachments";

const formatLatestAttachment = (timestamp: string) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Recently attached";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const patientDetails = (patient: ExternalLabAttachmentWorklistItem) =>
  [
    patient.patient_code || "No patient code",
    patient.age == null ? null : `${patient.age}y`,
    patient.sex || null,
  ]
    .filter(Boolean)
    .join(" · ");

const attachmentType = (mimeType: string) => {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";

  return "File";
};

const WorklistLoading = () => (
  <div className="space-y-2 p-3" aria-label="Loading external laboratory results">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="animate-pulse rounded-xl border border-slate-100 bg-white p-3">
        <div className="h-4 w-3/5 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-2/5 rounded bg-slate-100" />
        <div className="mt-4 h-3 w-4/5 rounded bg-slate-100" />
      </div>
    ))}
  </div>
);

export default function ExternalLabResultWorklist() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const { data: patients = [], error, isLoading, refetch } = useExternalLabAttachmentWorklist();

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.patient_id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const worklistGroups = useMemo(() => {
    const today = new Date().toDateString();
    const groups = new Map<string, ExternalLabAttachmentWorklistItem[]>([
      ["Today", []],
      ["Earlier uploads", []],
    ]);

    patients.forEach((patient) => {
      const uploadedAt = new Date(patient.latest_attachment_at);
      const group = uploadedAt.toDateString() === today ? "Today" : "Earlier uploads";
      groups.get(group)?.push(patient);
    });

    return [...groups.entries()]
      .filter(([, groupPatients]) => groupPatients.length > 0)
      .map(([label, groupPatients]) => ({ label, patients: groupPatients }));
  }, [patients]);

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <header className="overflow-hidden rounded-2xl border border-[#12344f] bg-[#0f2244] shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#83d5cb]">
              Doctor clinical inbox
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              External laboratory results
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Incoming patient references are arranged by their latest attachment so you can review each result in order.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#285465] bg-[#143a35] px-3 py-2 text-xs font-semibold text-[#d7f4ed]">
            <Clock3 size={14} aria-hidden="true" />
            {isLoading ? "Loading worklist" : `${patients.length} patient${patients.length === 1 ? "" : "s"} with results`}
          </div>
        </div>
        <div className="h-1 bg-[#0e7c7b]" />
      </header>

      <div className="grid min-h-[34rem] overflow-hidden rounded-2xl border border-[#cfe0dd] bg-white shadow-sm lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.5fr)]">
        <aside className="border-b border-[#d7e7e3] bg-[#f4faf9] lg:border-b-0 lg:border-r" aria-label="Patients with external laboratory results">
          <div className="flex items-center justify-between border-b border-[#d7e7e3] bg-[#e9f4f2] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#143a35]">Patient worklist</h2>
              <p className="mt-0.5 text-xs text-[#5d7f79]">Grouped by latest upload</p>
            </div>
            <Clock3 size={18} className="text-[#0e7c7b]" aria-hidden="true" />
          </div>

          {isLoading ? <WorklistLoading /> : null}

          {!isLoading && error ? (
            <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-semibold">The external-result inbox could not be loaded.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          ) : null}

          {!isLoading && !error && patients.length === 0 ? (
            <div className="m-4 rounded-xl border border-dashed border-[#b8d8d1] bg-white px-4 py-8 text-center">
              <Inbox className="mx-auto text-[#5f8a83]" size={28} aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#143a35]">No incoming external results</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Patients appear here when laboratory staff attach a reference file.</p>
            </div>
          ) : null}

          {!isLoading && !error && patients.length > 0 ? (
            <div className="max-h-[34rem] space-y-3 overflow-y-auto p-2 lg:max-h-none">
              {worklistGroups.map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <div className="flex items-center gap-2 px-2 pb-1.5 pt-1">
                    <span className="h-px flex-1 bg-[#cde4df]" aria-hidden="true" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#52766f]">{group.label}</h3>
                    <span className="h-px flex-1 bg-[#cde4df]" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    {group.patients.map((patient) => {
                      const isSelected = patient.patient_id === selectedPatientId;
                      const latestAttachmentMetadata = [
                        patient.latest_attachment.source_laboratory || "External laboratory",
                        attachmentType(patient.latest_attachment.mime_type),
                      ].join(" · ");

                      return (
                        <button
                          key={patient.patient_id}
                          type="button"
                          onClick={() => setSelectedPatientId(patient.patient_id)}
                          aria-pressed={isSelected}
                          className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#68bbb5] ${
                            isSelected
                              ? "border-[#0e7c7b] bg-[#dff3ef] shadow-sm"
                              : "border-transparent bg-transparent hover:border-[#c4ded9] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="flex min-w-0 items-start gap-2.5">
                              <span className={`mt-0.5 rounded-lg p-2 ${isSelected ? "bg-[#0e7c7b] text-white" : "bg-white text-[#0e7c7b]"}`}>
                                <UserRound size={16} aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-[#143a35]">{patient.name}</span>
                                <span className="mt-0.5 block truncate text-xs text-slate-600">{patientDetails(patient)}</span>
                              </span>
                            </span>
                            <span className="shrink-0 rounded-md bg-white/80 px-1.5 py-1 text-[11px] font-semibold text-[#0e7c7b]">
                              {patient.attachment_count} {patient.attachment_count === 1 ? "file" : "files"}
                            </span>
                          </div>
                          <span className="mt-3 block border-t border-[#cde4df] pt-2 text-[11px] font-medium text-[#416962]">
                            Uploaded · {formatLatestAttachment(patient.latest_attachment_at)}
                          </span>
                          <span className="mt-1 block truncate text-[11px] font-medium text-slate-600">
                            {patient.latest_attachment.file_name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                            {latestAttachmentMetadata}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </aside>

        <div className="bg-[#fbfdfd] p-4 sm:p-5">
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 border-b border-[#d7e7e3] pb-4">
                <span className="rounded-lg bg-[#e0f4f4] p-2.5 text-[#0e7c7b]"><Files size={20} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7c7b]">Selected patient</p>
                  <h2 className="mt-1 truncate font-serif text-xl font-semibold text-[#143a35]">{selectedPatient.name}</h2>
                  <p className="mt-1 text-xs text-slate-600">{patientDetails(selectedPatient)}</p>
                </div>
              </div>
              <ExternalLabAttachments
                patientCode={selectedPatient.patient_code ?? undefined}
                patientId={selectedPatient.patient_id}
                patientName={selectedPatient.name}
              />
            </div>
          ) : (
            <div className="flex min-h-[27rem] flex-col items-center justify-center rounded-xl border border-dashed border-[#b8d8d1] bg-white px-6 text-center">
              <span className="rounded-xl bg-[#e0f4f4] p-4 text-[#0e7c7b]"><FileText size={30} aria-hidden="true" /></span>
              <h2 className="mt-4 font-serif text-xl font-semibold text-[#143a35]">Choose a patient to review</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Select a patient from the incoming list to open their external laboratory documents.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

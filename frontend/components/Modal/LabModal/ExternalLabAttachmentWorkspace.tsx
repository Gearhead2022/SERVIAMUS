"use client";

import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { useLabPatientDirectory } from "@/hooks/Lab/useLab";
import { PatientRecord } from "@/types/LabTypes";
import ExternalLabAttachments from "./ExternalLabAttachments";

type Props = {
  canUpload?: boolean;
  title?: string;
  description?: string;
};

const patientLabel = (patient: PatientRecord) =>
  `${patient.name} · ${patient.patient_code}`;

export default function ExternalLabAttachmentWorkspace({
  canUpload = false,
  title = "External laboratory references",
  description = "Search for a patient to review laboratory files received from another provider.",
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const normalizedSearch = search.trim();
  const { data: patients = [], isFetching } = useLabPatientDirectory(
    normalizedSearch,
    normalizedSearch.length >= 2
  );

  const matches = useMemo(() => {
    if (search.trim().length < 2) return [];
    return patients.slice(0, 8);
  }, [patients, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (selectedPatient && !patientLabel(selectedPatient).toLowerCase().includes(value.toLowerCase())) {
      setSelectedPatient(null);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-2xl border border-[#d7e7e3] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0e7c7b]">
              Laboratory workspace
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#143a35]">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
          </div>
          <span className="rounded-full bg-[#eff6f4] px-3 py-1.5 text-xs font-semibold text-[#0e7c7b]">
            {canUpload ? "Laboratory staff" : "Doctor reference view"}
          </span>
        </div>

        <label className="relative mt-5 block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#63867f]">
            Find patient
          </span>
          <Search className="pointer-events-none absolute bottom-3 left-3 text-[#5f8a83]" size={17} />
          <input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by patient name or patient code"
            className="w-full rounded-xl border border-[#d7e7e3] bg-[#f7fbfa] py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#0e7c7b] focus:bg-white focus:ring-2 focus:ring-[#d5efea]"
          />
        </label>

        {search.trim().length > 0 && search.trim().length < 2 ? (
          <p className="mt-3 text-xs text-slate-500">Enter at least two characters to find a patient.</p>
        ) : null}

        {search.trim().length >= 2 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {isFetching ? <p className="text-sm text-slate-500">Searching patients…</p> : null}
            {!isFetching && matches.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">No matching patient was found.</p>
            ) : null}
            {matches.map((patient) => {
              const isSelected = selectedPatient?.patient_id === patient.patient_id;
              return (
                <button
                  key={patient.patient_id}
                  type="button"
                  onClick={() => setSelectedPatient(patient)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-[#0e7c7b] bg-[#eff9f7]"
                      : "border-slate-200 bg-white hover:border-[#b8d8d1] hover:bg-[#f9fcfb]"
                  }`}
                >
                  <span className="rounded-lg bg-[#e0f4f4] p-2 text-[#0e7c7b]"><UserRound size={16} /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{patient.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{patient.patient_code} · {patient.age}y · {patient.sex}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selectedPatient ? (
        <ExternalLabAttachments
          canUpload={canUpload}
          patientCode={selectedPatient.patient_code}
          patientId={selectedPatient.patient_id}
          patientName={selectedPatient.name}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#b8d8d1] bg-[#f7fbfa] px-5 py-10 text-center text-sm text-[#63867f]">
          Select a patient to {canUpload ? "attach an external laboratory result" : "view external laboratory references"}.
        </div>
      )}
    </section>
  );
}

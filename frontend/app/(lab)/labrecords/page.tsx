"use client";

import { useState } from "react";
import { FileSearch, Printer, Search, Users } from "lucide-react";
import { useDebounce } from "use-debounce";
import PatientCard from "@/components/PatientCard";
import PatientLabRecordsModal from "@/components/Modal/LabModal/PatientLabRecordsModal";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import ModalHeader from "@/components/Modal/ModalHeader";
import RoleGuard from "@/guards/RoleGuard";
import { useLabPatientDirectory } from "@/hooks/Lab/useLab";
import { LabRequest, PatientRecord } from "@/types/LabTypes";
import { openLabPrintPage } from "@/utils/lab-print";

export default function LabRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [activeRecord, setActiveRecord] = useState<LabRequest | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { data: patients = [], error, isLoading } = useLabPatientDirectory(debouncedSearch);
  const hasSearch = debouncedSearch.trim().length > 0;

  const closeRecordsModal = () => {
    setActiveRecord(null);
    setSelectedPatient(null);
  };

  const closePreviewModal = () => {
    setActiveRecord(null);
  };

  return (
    <RoleGuard allowedRoles={["LAB", "LABORATORY"]}>
      {selectedPatient ? (
        <ModalHeader
          showModal={true}
          title={`Laboratory Records - ${selectedPatient.name}`}
          subtitle="Review encoded laboratory results by category, date, and patient request."
          meta={selectedPatient.patient_code}
          sizeModal="2xlarge"
          onClose={closeRecordsModal}
        >
          <PatientLabRecordsModal
            patient={selectedPatient}
            onViewResult={setActiveRecord}
          />
        </ModalHeader>
      ) : null}

      {activeRecord?.resultPayload ? (
        <ModalHeader
          showModal={true}
          title={`Laboratory Result Preview - ${activeRecord.patientName}`}
          subtitle={activeRecord.testType}
          meta={`${activeRecord.id} - ${activeRecord.patientId}`}
          sizeModal="2xlarge"
          onClose={closePreviewModal}
        >
          <LabResultPreview
            request={activeRecord}
            form={activeRecord.resultPayload}
            backLabel="Back to Records"
            showPassToDoctor={false}
            onBack={closePreviewModal}
            onDownloadPdf={() =>
              openLabPrintPage(activeRecord.labId, {
                autoDownload: true,
              })
            }
            onOpenPrintPage={() =>
              openLabPrintPage(activeRecord.labId, {
                autoPrint: true,
              })
            }
          />
        </ModalHeader>
      ) : null}

      <div
        className="min-h-screen font-['DM_Sans']"
        // style={{
        //   background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e3d5c 100%)",
        // }}
      >

        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-white rounded-3xl border border-black/75 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black">
                Patient Directory Search
              </p>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="relative max-w-xl flex-1">
                  <svg
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search patients by name, address, or patient ID"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-teal/80 bg-white/100 py-2.5 pl-10 pr-4 text-sm text-black placeholder-white/30 outline-none transition focus:border-black/100 focus:bg-white/65"
                  />
                </div>

                {/* <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/75">
                  {hasSearch
                    ? `Showing matches for "${debouncedSearch}"`
                    : "Showing the full laboratory patient directory"}
                </div> */}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/100 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-black">Visible Patients</p>
                  <Users size={17} className="text-white/60" />
                </div>
                <p className="mt-3 text-3xl font-bold text-black">
                  {isLoading ? "..." : patients.length}
                </p>
              </div>
                    
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-8 pb-12">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Patient cards</h2>
              
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-2xl bg-white/10"
                  style={{ animationDelay: `${index * 60}ms` }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-12 text-center text-sm text-white/70 backdrop-blur-sm">
              Unable to load the patient laboratory directory right now.
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/10 px-6 py-16 text-center backdrop-blur-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <FileSearch className="h-8 w-8 text-white/35" />
              </div>
              <p className="text-sm font-semibold text-white/70">No patients found</p>
              <p className="mt-1 text-xs text-white/35">
                {search
                  ? "Try a different search term to locate a patient record."
                  : "Laboratory patient records will appear here once requests exist."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.patient_id}
                  patient={{
                    age: patient.age ?? undefined,
                    address: patient.address,
                    birth_date: patient.birth_date ?? undefined,
                    contact_number: patient.contact_number ?? undefined,
                    name: patient.name,
                    patient_code: patient.patient_code,
                    patient_id: patient.patient_id,
                    religion: patient.religion ?? undefined,
                    sex: patient.sex ?? undefined,
                  }}
                  onClick={() => setSelectedPatient(patient)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

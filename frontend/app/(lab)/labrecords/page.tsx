"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import { useDebounce } from "use-debounce";
import PatientCard from "@/components/PatientCard";
import LabResultEditor from "@/components/Modal/LabModal/LabResultEditor";
import PatientLabRecordsModal from "@/components/Modal/LabModal/PatientLabRecordsModal";
import ModalHeader from "@/components/Modal/ModalHeader";
import RoleGuard from "@/guards/RoleGuard";
import { useLabPatientDirectory, useSaveLabResult } from "@/hooks/Lab/useLab";
import { LabRequest, LabResultPayload, PatientRecord } from "@/types/LabTypes";
import { getLabTemplateLabel, resolveLabTemplate } from "@/utils/lab-templates";
import { openLabPrintPage } from "@/utils/lab-print";
import SweetAlert from "@/utils/SweetAlert";

export default function LabRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [activeRecord, setActiveRecord] = useState<LabRequest | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { data: patients = [], error, isLoading } = useLabPatientDirectory(debouncedSearch);
  const { mutateAsync: persistLabResult, isPending: isSavingRecord } = useSaveLabResult();
  const activeTemplate = activeRecord ? resolveLabTemplate(activeRecord) : null;

  const closeRecordsModal = () => {
    setActiveRecord(null);
    setSelectedPatient(null);
  };

  const closeEditModal = () => {
    setActiveRecord(null);
  };

  const handleSaveRecord = async (form: LabResultPayload) => {
    if (!activeRecord || !activeTemplate) {
      return;
    }

    try {
      await persistLabResult({
        labId: activeRecord.labId,
        category: activeTemplate.apiCategory,
        form,
      });

      await SweetAlert.successAlert(
        "Result Updated",
        "The laboratory record was updated successfully."
      );
      closeEditModal();
    } catch {
      // Alerts are handled in the mutation hook.
    }
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
            onEditRecord={setActiveRecord}
            onReprintRecord={(labId) => openLabPrintPage(labId, true)}
          />
        </ModalHeader>
      ) : null}

      {activeRecord ? (
        <ModalHeader
          showModal={true}
          title={`Edit Result - ${getLabTemplateLabel(activeRecord)}`}
          subtitle={`${activeRecord.patientName} - ${activeRecord.testType}`}
          meta={`${activeRecord.id} - ${activeRecord.patientId}`}
          sizeModal="2xlarge"
          onClose={closeEditModal}
        >
          <div className="border-b border-[#d2ebe6] bg-[#f5fbfa] px-5 py-3">
            <p className="text-xs font-medium text-[#2f5e57]">
              Requested by {activeRecord.requestedBy}
            </p>
            <p className="mt-1 text-xs font-medium text-[#2f5e57]">
              Use this editor to revise the saved laboratory result and keep the record updated.
            </p>
            {isSavingRecord ? (
              <p className="mt-2 text-xs font-medium text-[#2f5e57]">
                Saving updated laboratory result...
              </p>
            ) : null}
          </div>

          <LabResultEditor
            request={activeRecord}
            onSubmit={handleSaveRecord}
            onCancel={closeEditModal}
          />
        </ModalHeader>
      ) : null}

      <div
        className="min-h-screen font-['DM_Sans']"
        style={{
          background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e3d5c 100%)",
        }}
      >
        <div className="border-b border-white/10 px-8 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-['DM_Serif_Display'] text-2xl text-white tracking-wide">
                Laboratory Records
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/55">
                Select a patient card to review encoded laboratory records, edit saved results,
                and reprint official result forms from a dedicated print page.
              </p>
              <p className="mt-1 text-xs text-white/40">
                {isLoading
                  ? "Loading patient directory..."
                  : `${patients.length} patient${patients.length === 1 ? "" : "s"} available for laboratory record review`}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/75 backdrop-blur-sm">
              Use the filters inside each patient record modal to narrow results by date and test
              category.
            </div>
          </div>
        </div>

        <div className="px-8 py-5">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30"
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
              className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/30 focus:bg-white/15"
            />
          </div>
        </div>

        <div className="px-8 pb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 rounded-2xl bg-white/10 animate-pulse"
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

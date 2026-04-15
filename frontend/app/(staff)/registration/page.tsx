"use client";

import { useState } from "react";
import PatientCard from "@/components/PatientCard";
import PatientActionModal from "@/components/Modal/ChildModal/PatientActionModal";
import ModalHeader from "@/components/Modal/ModalHeader";
import AddPatientForm from "@/components/Modal/ChildModal/AddPatientForm";
import { useGetAllpatient, useGetPrevVitalSigns } from "@/hooks/Patient/usePatientRegistration";
import { PatientProps } from "@/types/PatientTypes";
import RoleGuard from "@/guards/RoleGuard";
import AddRequestForm from "@/components/Modal/NestedModal/AddRequestForm";
import { useDebounce } from "use-debounce";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

const RegistrationPage = () => {

  const [selectedPatient, setSelectedPatient] = useState<PatientProps | null>(null);
  const [activeAction, setActiveAction] = useState<
    "consultation" | "laboratory" | "profile" | "edit" | "action" | null
  >(null);

  const [ addPatientOpen, setAddPatientOpen ] = useState<boolean>(false);
  const [ modalTitle, setModalTitle ] = useState<string>('')

  const patientId =
    selectedPatient && typeof selectedPatient.patient_id === "number"
      ? selectedPatient.patient_id
      : undefined;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: patientList, isLoading: patientListLoading } = useGetAllpatient(debouncedSearch);
  const { data: prevVitalSigns, isLoading: vitalsLoading } = useGetPrevVitalSigns(patientId);

  const closeAll = () => {
    setSelectedPatient(null);
    setActiveAction(null);
  };

  const closeNested = () => {
    setActiveAction(null);
  };

  return (
    <>
    <RoleGuard allowedRoles={['STAFF']}>
      {/* ── Add Patient Modal ── */}
      {addPatientOpen && (
        <ModalHeader showModal={true} title="Register New Patient" subtitle="Fill in the details below to register a patient" sizeModal="medium" onClose={() => setAddPatientOpen(false)}>
          <AddPatientForm patient={null} onClose={() => setAddPatientOpen(false)}/>
        </ModalHeader>
      )}

      {selectedPatient && activeAction === 'consultation' && (
        <ModalHeader showModal={true} title={modalTitle} subtitle="Fill in details below to create request" sizeModal="2xlarge" onClose={closeNested}>
          <AddRequestForm patient={selectedPatient} vitals={prevVitalSigns ?? undefined} onClose={closeAll}/>
        </ModalHeader>
      )}

      {/* ── Patient Action Modal ── */}
      {selectedPatient && activeAction === 'action' && !vitalsLoading && (
         <ModalHeader showModal={true} title={"Patient Action manager"} subtitle="Select an action below to a patient" sizeModal="small" onClose={closeNested}>
          <PatientActionModal
            patient={selectedPatient}
            onClose={closeAll}
            actionTitle={setModalTitle}
            onRequestAction={() => { setActiveAction("consultation");}}
            onViewProfile={() => { setActiveAction("profile");}}
            onEditPatient={() => { setActiveAction("edit");}}
          />
        </ModalHeader>
      )}

      {/* ── Page ── */}
      <div
        className="min-h-screen font-['DM_Sans']"
        style={{
          background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e3d5c 100%)",
        }}
      >
        {/* Top bar */}
        <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-['DM_Serif_Display'] text-2xl text-white tracking-wide">
              Patient Registry
            </h1>
            <p className="text-white/40 text-xs mt-0.5">
              {patientListLoading
                ? "Loading patients…"
                : `${patientList?.length} patient${patientList?.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <Button icon={<Plus/>} iconPosition="left" variant="addPatient" type="button" onClick={() => setAddPatientOpen(true)}>Add Patient</Button>
        </div>

        {/* Search bar */}
        <div className="px-8 py-5">
          <div className="relative max-w-sm">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:bg-white/15 focus:border-white/30 transition"
            />
          </div>
        </div>

        {/* Patient grid */}
        <div className="px-8 pb-12">
          {patientListLoading ? (
            /* Skeleton */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/10 rounded-2xl h-48 animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          ) : patientList?.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-white/50 font-semibold text-sm">No patients found</p>
              <p className="text-white/25 text-xs mt-1">
                {search ? "Try a different search term." : "Add a patient to get started."}
              </p>
              {!search && (
                <button
                  onClick={() => setAddPatientOpen(true)}
                  className="mt-4 text-sm font-semibold text-[#c8102e] hover:underline"
                >
                  + Add First Patient
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {patientList && patientList?.map((patient: PatientProps) => (
                <PatientCard
                  key={patient.patient_id}
                  patient={patient}
                  onClick={() => {
                    setSelectedPatient(patient); setActiveAction('action');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </RoleGuard>
    </>
  );
};

export default RegistrationPage;

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PatientCard from "@/components/PatientCard";
import PatientActionModal from "@/components/Modal/ChildModal/PatientActionModal";
import ModalHeader from "@/components/Modal/ModalHeader";
import AddPatientForm from "@/components/Modal/ChildModal/AddPatientForm";
import { useDeletePatient, useGetAllpatient, useGetPrevVitalSigns } from "@/hooks/Patient/usePatientRegistration";
import { PatientProps } from "@/types/PatientTypes";
import RoleGuard from "@/guards/RoleGuard";
import AddRequestForm from "@/components/Modal/NestedModal/AddRequestForm";
import { useDebounce } from "use-debounce";
import Button from "@/components/ui/Button";
import { Plus, Search } from "lucide-react";
import ViewPatientHistoryModal from "@/components/Modal/ChildModal/ViewPatientHistoryModal";
import EditPatientForm from "@/components/Modal/ChildModal/EditPatientForm";
import { getApiErrorMessage } from "@/utils/api-error";
import ViewPatientProfile from "@/components/Modal/ChildModal/ViewPatientProfile";
import { canAddPatient } from "@/utils/permissions";
import { MedCertFormValues, PrescriptionValues, RegisterConsultationFormValues } from "@/schemas/consultation.schema";
import ConsultResultPreview from "@/components/Modal/ChildModal/ConsultationPreview";
import { useRequestData } from "@/hooks/Consultation/useConsultation";
import { LabRequest } from "@/types/LabTypes";
import { openLabPrintPage } from "@/utils/lab-print";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import { openConsultPrintPage } from "@/utils/consultation/consultPrint";
import SweetAlert from "@/utils/SweetAlert";

const RegistrationPage = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<PatientProps | null>(null);
  const [activeAction, setActiveAction] = useState<
    "request" | "consultation" | "laboratory" | "profile" | "edit" | "history" | "action" | "prescription" | "view_consultation" | "certificate" | null
  >(null);

  const [addPatientOpen, setAddPatientOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");

  const patientId =
    selectedPatient && typeof selectedPatient.patient_id === "number"
      ? selectedPatient.patient_id
      : undefined;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const {
    data: patientList,
    error: patientListError,
    isLoading: patientListLoading,
  } = useGetAllpatient(debouncedSearch);
  const { data: prevVitalSigns, isLoading: vitalsLoading } = useGetPrevVitalSigns(patientId);
  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);

  const { data: currentRequest } = useRequestData(currentRequestId!); //feed current request info

  const doctorId =
    currentRequest?.consult?.physician ??
    currentRequest?.cert?.physician ??
    0;

  const [selectedConsultationRecord, setSelectedConsultationRecord] = useState<RegisterConsultationFormValues | null>(null);
  const [selectedMedCertRecord, setSelectedMedCertRecord] = useState<MedCertFormValues | null>(null);
  const [selectedPrescriptionRecord, setSelectedPrescriptionRecord] = useState<PrescriptionValues | null>(null);
  const patientCount = patientList?.length ?? 0;

  const [activeRecord, setActiveRecord] = useState<LabRequest | null>(null);

  const [consultationResultPreview, setConsultationResultPreview] = useState<boolean>(false);
  const [medCertPreview, setMedCertPreview] = useState<boolean>(false);
  const [prescriptionPreview, setPrescriptionPreview] = useState<boolean>(false);

  const closeAll = () => {
    setSelectedPatient(null);
  };
  const { mutateAsync: deletePatientMutation } = useDeletePatient(closeAll);

  const handleDeletePatient = async (patient: PatientProps) => {
    if (!patient.patient_id) return;

    const confirmed = await SweetAlert.confirmationAlert2(
      "Delete patient?",
      `If ${patient.name} has no records, deletion is immediate. Otherwise, this sends an approval request to an administrator.`,
    );

    if (!confirmed) return;

    await deletePatientMutation(patient.patient_id);
  };

  const closeNested = () => {
    setActiveAction('action');
  };

  const closePreviewModal = () => {
    setConsultationResultPreview(false);
    setPrescriptionPreview(false);
    setMedCertPreview(false);
    setActiveRecord(null);

    // Return to History
    setActiveAction("history");
  };

  const handleViewConsultation = async (
    requestId: number,
    form: RegisterConsultationFormValues,
  ) => {
    setCurrentRequestId(requestId);
    setSelectedConsultationRecord(form);
    setConsultationResultPreview(true);
  };

  const handleViewMedicalCertificate = async (
    requestId: number,
    form: MedCertFormValues,
  ) => {
    setCurrentRequestId(requestId);
    setSelectedMedCertRecord(form);
    setMedCertPreview(true);
  };

  const handleViewPrescription = async (
    requestId: number,
    form: PrescriptionValues,
  ) => {
    setCurrentRequestId(requestId);
    setSelectedPrescriptionRecord(form);
    setPrescriptionPreview(true);
  };

  return (
    <>
      <RoleGuard allowedRoles={["STAFF", "DOCTOR", "ADMIN"]}>
        {/* â”€â”€ Add Patient Modal â”€â”€ */}
        {addPatientOpen && (
          <ModalHeader showModal={true} title="Register New Patient" subtitle="Fill in the details below to register a patient" sizeModal="medium" onClose={() => setAddPatientOpen(false)}>
            <AddPatientForm patient={null} onClose={() => setAddPatientOpen(false)} />
          </ModalHeader>
        )}

        {selectedPatient && activeAction === "request" && (
          <ModalHeader showModal={true} title={modalTitle} subtitle="Fill in details below to create request" sizeModal="2xlarge" onClose={closeNested}>
            <AddRequestForm patient={selectedPatient} vitals={prevVitalSigns ?? undefined} onClose={closeNested} />
          </ModalHeader>
        )}

        {selectedPatient && activeAction == "history" && (
          <ModalHeader showModal={true} title={"History Records"} subtitle="View previous consultations, laboratory records, and medical certificates." sizeModal="2xlarge" onClose={closeNested}>
            <ViewPatientHistoryModal patient={selectedPatient}
              onViewPrescription={(requestId, form) => {
                setActiveAction("prescription");
                handleViewPrescription(requestId, form);
              }}
              onViewConsultation={(requestId, form) => {
                setActiveAction("view_consultation");
                handleViewConsultation(requestId, form);
              }}
              onViewMedicalCertificate={(requestId, form) => {
                setActiveAction("certificate");
                handleViewMedicalCertificate(requestId, form)
              }}
              onViewLaboratoryTest={(record) => {
                setActiveRecord(record);
              }}
            />
          </ModalHeader>
        )}

        {/* â”€â”€ Patient Action Modal â”€â”€ */}
        {selectedPatient && activeAction === "action" && !vitalsLoading && (
          <ModalHeader showModal={true} title={"Patient Action Manager"} subtitle="Select an action below to a patient" sizeModal="medium" onClose={closeAll}>
            <PatientActionModal
              patient={selectedPatient}
              onClose={closeAll}
              actionTitle={setModalTitle}
              onRequestAction={() => { setActiveAction("request"); }}
              onDeletePatient={handleDeletePatient}
              onViewProfile={() => { setActiveAction("profile"); }}
              onEditPatient={() => { setActiveAction("edit"); }}
              onViewHistory={() => { setActiveAction("history"); }}
            />
          </ModalHeader>
        )}

        {/* â”€â”€ Page â”€â”€ */}
        {selectedPatient && activeAction == 'profile' && (
          <ModalHeader showModal={true} title={`${modalTitle}  — ${selectedPatient?.name}`} subtitle="" sizeModal="large" onClose={closeNested}>
            <ViewPatientProfile patient={selectedPatient} onClose={closeNested}></ViewPatientProfile>
          </ModalHeader >
        )}

        {/* â”€â”€ Edit Patient Modal â”€â”€ */}
        {selectedPatient && activeAction === "edit" && (
          <ModalHeader
            showModal={true}
            title="Edit Patient"
            subtitle="Update patient information"
            sizeModal="medium"
            onClose={closeNested}
          >
            <EditPatientForm patient={selectedPatient} onClose={closeAll} />
          </ModalHeader>
        )}

        {currentRequest && consultationResultPreview && selectedConsultationRecord && (
          <ModalHeader
            showModal={true}
            title={`Consultation Result Preview — ${selectedPatient?.name}`}
            subtitle=""
            meta={`${currentRequest.req_id} - ${selectedPatient?.patient_id}`}
            sizeModal="2xlarge"
            onClose={closePreviewModal}
          >
            <ConsultResultPreview
              request={currentRequest}
              form={selectedConsultationRecord}
              backLabel="Back to Records"
              onBack={closePreviewModal}
              onDownloadPdf={() => {
                openConsultPrintPage(currentRequest.req_id, {
                  autoDownload: true,
                  type: 'consult-result',
                  patientName: selectedPatient?.name
                })
              }}
              onOpenPrintPage={() => {
                openConsultPrintPage(currentRequest.req_id, {
                  autoPrint: true,
                  type: 'consult-result',
                  patientName: selectedPatient?.name
                })
              }}
              type="consult-result"
              doctorId={doctorId}
              showDoneButton={false}
              onSubmitSuccess={true}
            />
          </ModalHeader>
        )}

        {currentRequest && medCertPreview && selectedMedCertRecord && (
          <ModalHeader
            showModal={true}
            title={`Medical Certificate Preview — ${selectedPatient?.name}`}
            subtitle=""
            meta={`${currentRequest.req_id} - ${selectedPatient?.patient_id}`}
            sizeModal="2xlarge"
            onClose={closePreviewModal}
          >
            <ConsultResultPreview
              request={currentRequest}
              form={selectedMedCertRecord}
              backLabel="Back to Records"
              onBack={closePreviewModal}
              onDownloadPdf={() => {
                openConsultPrintPage(currentRequest.req_id, {
                  autoDownload: true,
                  doctorId,
                  type: 'med-cert',
                  patientName: selectedPatient?.name,
                })
              }}
              onOpenPrintPage={() => {
                openConsultPrintPage(currentRequest.req_id, {
                  autoPrint: true,
                  doctorId,
                  type: 'med-cert',
                  patientName: selectedPatient?.name
                })
              }}
              type="med-cert"
              doctorId={doctorId}
              showDoneButton={false}
              onSubmitSuccess={true}
            />
          </ModalHeader>
        )}

        {currentRequest && prescriptionPreview && selectedPrescriptionRecord && (
          <ModalHeader
            showModal={true}
            title={`Prescription Preview — ${selectedPatient?.name}`}
            subtitle=""
            meta={`${currentRequest.req_id} - ${selectedPatient?.patient_id}`}
            sizeModal="2xlarge"
            onClose={closePreviewModal}
          >
            <ConsultResultPreview
              request={currentRequest}
              form={selectedPrescriptionRecord}
              backLabel="Back to Records"
              onBack={closePreviewModal}
              onDownloadPdf={() => {
                openConsultPrintPage(currentRequest.req_id, {
                  autoDownload: true,
                  doctorId,
                  type: 'prescription',
                  patientName: selectedPatient?.name
                })
              }}
              onOpenPrintPage={() => {
                openConsultPrintPage(currentRequest.req_id, {
                  autoPrint: true,
                  doctorId,
                  type: 'prescription',
                  patientName: selectedPatient?.name
                })
              }}
              type="prescription"
              doctorId={doctorId}
              showDoneButton={false}
              onSubmitSuccess={true}
            />
          </ModalHeader>
        )}

        {activeRecord?.resultPayload ? (
          <ModalHeader
            showModal={true}
            title={`Laboratory Result Preview — ${activeRecord.patientName}`}
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

        {/* ── Page ── */}
        <div
          className="min-h-screen font-['DM_Sans']"
          style={{
            background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)",
          }}
        >
          {/* Top bar */}
          <div className="border-b border-white/10 px-8 py-5 flex items-center">
            <div>
              <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide mb-1">
                Patient Registry
              </h1>
              <p className="text-black/40 text-sm">
                {patientListLoading
                  ? "Loading patientsâ€¦"
                  : patientListError
                    ? getApiErrorMessage(patientListError, "Unable to load patients.")
                    : `${patientCount} patient${patientCount !== 1 ? "s" : ""} found`}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-8 pb-5 flex justify-between items-center">
            <div className="relative max-w-sm">
              <Search className="text-black/40 absolute mt-2 ml-2" />
              <input
                type="text"
                placeholder="Search patients"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/10 border border-black/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black placeholder-black/30 outline-none focus:bg-black/15 focus:border-black/30 transition"
              />
            </div>
            <div className="relative max-w-sm">
              {canAddPatient(user?.roles) && (
                <Button icon={<Plus />} iconPosition="left" variant="addPatient" type="button" onClick={() => setAddPatientOpen(true)}>Add Patient</Button>
              )}
            </div>
          </div>

          {/* Patient grid */}
          <div className="px-8 pb-12">
            {patientListLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 rounded-2xl h-48 animate-pulse"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
            ) : patientListError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#c8102e]/10 flex items-center justify-center mb-4 text-[#c8102e]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 16.5h.008v.008H12V16.5z" />
                  </svg>
                </div>
                <p className="text-[#0f2244] font-semibold text-sm">Unable to load patients</p>
                <p className="text-[#0f2244]/60 text-xs mt-1 max-w-md">
                  {getApiErrorMessage(
                    patientListError,
                    "The patient registry could not be loaded right now."
                  )}
                </p>
              </div>
            ) : patientCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-black/100" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-black/70 font-semibold text-sm">No patients found</p>
                <p className="text-black/55 text-xs mt-1">
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
                {patientList?.map((patient: PatientProps) => (
                  <PatientCard
                    key={patient.patient_id}
                    patient={patient}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setActiveAction("action");
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

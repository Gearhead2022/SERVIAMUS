"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FlaskConical,
  Microscope,
  UserRound,
} from "lucide-react";
import ModalHeader from "@/components/Modal/ModalHeader";
import ClinicalChemistryModal from "@/components/Modal/LabModal/ClinicalChemistryModal";
import ChemistryResultModal from "@/components/Modal/LabModal/chemresultModal";
import GeneralResultModal from "@/components/Modal/LabModal/GeneralResultModal";
import HbAIcResultModal from "@/components/Modal/LabModal/HbAIcResultModal";
import HematologyModal from "@/components/Modal/LabModal/HematologyModal";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import OGTTResultModal from "@/components/Modal/LabModal/OGTTResultModal";
import ParasitologyModal from "@/components/Modal/LabModal/ParasitologyModal";
import SerologyResultModal from "@/components/Modal/LabModal/SerologyResultModal";
import UrinalysisModal from "@/components/Modal/LabModal/UrinalysisModal";
import Button from "@/components/ui/Button";
import {
  fetchLabRequests,
  saveLabResult,
  updateLabRequestStatus,
  type LabCategory,
  type LabRequest,
  type RequestStatus,
} from "@/services/lab.service";
import SweetAlert from "@/utils/SweetAlert";

type RequestPreviewCard = {
  requestId: number;
  id: string;
  patientName: string;
  patientId: string;
  requestedBy: string;
  requestedAt: string;
  requestedDate: string;
  requestStatus: RequestStatus;
  tests: string[];
  completedTests: string[];
  pendingTests: string[];
  completedCount: number;
  totalTests: number;
};

type DashboardLabType =
  | LabCategory
  | "serology"
  | "hba1c"
  | "chemistry"
  | "ogtt";

const categoryLabels: Record<DashboardLabType, string> = {
  "clinical-chemistry": "Clinical Chemistry",
  hematology: "Hematology",
  parasitology: "Parasitology",
  urinalysis: "Urinalysis",
  serology: "Serology",
  hba1c: "HbA1c",
  chemistry: "Chemistry",
  ogtt: "OGTT",
  other: "General Result",
};

function resolveCategory(request: LabRequest): DashboardLabType {
  switch (request.schemaKey) {
    case "hematology":
      return "hematology";
    case "parasitology":
      return "parasitology";
    case "urinalysis":
      return "urinalysis";
    case "clinical_chemistry":
      return "clinical-chemistry";
    case "serology":
      return "serology";
    case "hba1c":
      return "hba1c";
    case "chemistry":
      return "chemistry";
    case "ogtt":
      return "ogtt";
    default:
      break;
  }

  if (request.category && request.category !== "other") {
    return request.category;
  }

  const value = request.testType.toLowerCase();
  if (value.includes("hba1c") || value.includes("hb a1c")) return "hba1c";
  if (value.includes("ogtt") || value.includes("glucose load")) return "ogtt";
  if (value.includes("serology") || value.includes("dengue") || value.includes("widal")) {
    return "serology";
  }
  if (
    value.includes("sodium") ||
    value.includes("potassium") ||
    value.includes("chloride") ||
    value.includes("ionized calcium")
  ) {
    return "chemistry";
  }
  if (value.includes("urinalysis")) return "urinalysis";
  if (
    value.includes("blood count") ||
    value.includes("cbc") ||
    value.includes("hematology") ||
    value.includes("blood typing")
  ) {
    return "hematology";
  }
  if (value.includes("fecal") || value.includes("stool") || value.includes("parasit")) {
    return "parasitology";
  }
  if (value.includes("blood chemistry")) {
    return "clinical-chemistry";
  }
  return "other";
}

function toApiCategory(category: DashboardLabType): LabCategory {
  if (category === "serology") return "other";
  if (category === "hba1c" || category === "chemistry" || category === "ogtt") {
    return "clinical-chemistry";
  }

  return category;
}

function getStatusBadgeClasses(status: RequestStatus) {
  if (status === "done") {
    return "bg-[#e3f6ea] text-[#237a4e]";
  }

  if (status === "pending") {
    return "bg-[#eef4ff] text-[#305c9b]";
  }

  return "bg-[#f4efe0] text-[#8a6a18]";
}

function formatList(items: string[]) {
  if (!items.length) {
    return "None yet";
  }

  return items.join(", ");
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeRequest, setActiveRequest] = useState<LabRequest | null>(null);
  const [previewPayload, setPreviewPayload] = useState<{
    request: LabRequest;
    category: DashboardLabType;
    form: Record<string, string>;
  } | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [savingResults, setSavingResults] = useState(false);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await fetchLabRequests();
      setRequests(data);
    } catch {
      SweetAlert.errorAlert("Load Failed", "Unable to load laboratory requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const queued = useMemo(
    () => requests.filter((item) => item.status === "queued"),
    [requests]
  );
  const pending = useMemo(
    () => requests.filter((item) => item.status === "pending"),
    [requests]
  );
  const done = useMemo(() => requests.filter((item) => item.status === "done"), [requests]);

  const requestPreviews = useMemo<RequestPreviewCard[]>(() => {
    const groupedRequests = new Map<number, RequestPreviewCard>();

    requests.forEach((item) => {
      if (groupedRequests.has(item.requestId)) {
        return;
      }

      groupedRequests.set(item.requestId, {
        requestId: item.requestId,
        id: item.id,
        patientName: item.patientName,
        patientId: item.patientId,
        requestedBy: item.requestedBy,
        requestedAt: item.requestedAt,
        requestedDate: item.requestedDate,
        requestStatus: item.requestStatus,
        tests: item.tests,
        completedTests: item.completedTests,
        pendingTests: item.pendingTests,
        completedCount: item.completedCount,
        totalTests: item.totalTests,
      });
    });

    return Array.from(groupedRequests.values()).sort(
      (left, right) =>
        new Date(right.requestedDate).getTime() - new Date(left.requestedDate).getTime()
    );
  }, [requests]);

  const activeCategory = activeRequest ? resolveCategory(activeRequest) : null;

  const inProgressRequests = useMemo(
    () => requestPreviews.filter((item) => item.requestStatus === "pending").length,
    [requestPreviews]
  );
  const completedRequestCount = useMemo(
    () => requestPreviews.filter((item) => item.requestStatus === "done").length,
    [requestPreviews]
  );
  const acceptanceRate = useMemo(() => {
    const accepted = pending.length + done.length;
    if (!requests.length) return 0;
    return Math.round((accepted / requests.length) * 100);
  }, [done.length, pending.length, requests.length]);
  const completionRate = useMemo(() => {
    if (!requests.length) return 0;
    return Math.round((done.length / requests.length) * 100);
  }, [done.length, requests.length]);

  const replaceRequest = (updated: LabRequest) => {
    setRequests((current) =>
      current.map((item) => {
        if (item.requestId !== updated.requestId) {
          return item;
        }

        if (item.labId === updated.labId) {
          return updated;
        }

        return {
          ...item,
          requestStatus: updated.requestStatus,
          tests: updated.tests,
          completedTests: updated.completedTests,
          pendingTests: updated.pendingTests,
          totalTests: updated.totalTests,
          completedCount: updated.completedCount,
        };
      })
    );

    if (activeRequest?.labId === updated.labId) {
      setActiveRequest(updated);
    }

    if (previewPayload?.request.labId === updated.labId) {
      setPreviewPayload((current) =>
        current ? { ...current, request: updated } : current
      );
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      setBusyRequestId(requestId);
      const updated = await updateLabRequestStatus(requestId, "pending");
      replaceRequest(updated);
    } catch {
      SweetAlert.errorAlert("Update Failed", "Unable to accept the laboratory request.");
    } finally {
      setBusyRequestId(null);
    }
  };

  const openModal = (request: LabRequest) => {
    setActiveRequest(request);
    setPreviewPayload(null);
  };

  const closeModal = () => {
    setActiveRequest(null);
    setPreviewPayload(null);
    setSavingResults(false);
  };

  const handleSaveResults = async (form: Record<string, string>) => {
    if (!activeRequest || !activeCategory) return;

    try {
      setSavingResults(true);
      const updated = await saveLabResult({
        labId: activeRequest.labId,
        category: toApiCategory(activeCategory),
        form,
      });

      replaceRequest(updated);
      setPreviewPayload({ request: updated, category: activeCategory, form });
    } catch {
      SweetAlert.errorAlert("Save Failed", "Unable to save laboratory results.");
    } finally {
      setSavingResults(false);
    }
  };

  const completeRequest = async () => {
    if (!previewPayload) return;

    try {
      setBusyRequestId(previewPayload.request.labId);
      const updated = await updateLabRequestStatus(previewPayload.request.labId, "done");
      replaceRequest(updated);
      closeModal();
    } catch {
      SweetAlert.errorAlert("Completion Failed", "Unable to update the request status.");
    } finally {
      setBusyRequestId(null);
    }
  };

  const renderSelectedModal = () => {
    if (!activeRequest || !activeCategory) return null;

    if (activeCategory === "hematology") {
      return <HematologyModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "parasitology") {
      return <ParasitologyModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "urinalysis") {
      return <UrinalysisModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "clinical-chemistry") {
      return <ClinicalChemistryModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "serology") {
      return <SerologyResultModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "hba1c") {
      return <HbAIcResultModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "chemistry") {
      return <ChemistryResultModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    if (activeCategory === "ogtt") {
      return <OGTTResultModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }

    return (
      <GeneralResultModal
        testName={activeRequest.testType}
        initialValues={activeRequest.resultPayload}
        onSubmit={handleSaveResults}
        onCancel={closeModal}
      />
    );
  };

  return (
    <>
      {activeRequest && !previewPayload ? (
        <ModalHeader
          showModal={!!activeRequest}
          title={`Laboratory Request - ${categoryLabels[activeCategory ?? "other"]}`}
          subtitle={`${activeRequest.patientName} • ${activeRequest.testType}`}
          meta={`${activeRequest.id} • ${activeRequest.patientId}`}
          onClose={closeModal}
        >
          <div className="border-b border-[#d2ebe6] bg-[#f5fbfa] px-5 py-3">
            <p className="text-xs font-medium text-[#2f5e57]">
              Requested by {activeRequest.requestedBy}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#133d37]">
              {activeRequest.completedCount} of {activeRequest.totalTests} test
              {activeRequest.totalTests === 1 ? "" : "s"} completed for this patient request
            </p>
            {savingResults ? (
              <p className="mt-2 text-xs font-medium text-[#2f5e57]">Saving encoded results...</p>
            ) : null}
          </div>
          {renderSelectedModal()}
        </ModalHeader>
      ) : null}

      {previewPayload ? (
        <ModalHeader
          showModal={!!previewPayload}
          title={`Result Preview - ${previewPayload.request.patientName}`}
          subtitle={previewPayload.request.testType}
          meta={`${previewPayload.request.id} • ${previewPayload.request.patientId}`}
          onClose={closeModal}
        >
          <LabResultPreview
            request={previewPayload.request}
            category={previewPayload.category}
            form={previewPayload.form}
            onBack={() => setPreviewPayload(null)}
            onPrint={completeRequest}
            onPassToDoctor={completeRequest}
          />
        </ModalHeader>
      ) : null}

      <div className="min-h-full p-6 md:p-7">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* <div className="relative overflow-hidden rounded-2xl border border-[#84c7bb]/50 bg-gradient-to-r from-[#182955] via-[#2e4274] to-[#374b7e] p-5 text-white shadow-[0_18px_40px_rgba(8,31,28,0.25)] md:p-6"> */}
            <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-[#7bd9c3]/20 blur-3xl" />
            <div className="absolute -bottom-10 left-14 h-32 w-32 rounded-full bg-[#ffffff]/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Laboratory Operations</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                  Laboratory Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">
                  Each requested test now appears as its own laboratory entry, while the patient
                  request only moves to completed when every requested test is finished.
                </p>
              </div> */}
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <BellRing size={16} className="text-[#c8ffe8]" />
                  <span>
                    {queued.length} queued test {queued.length === 1 ? "entry" : "entries"}
                  </span>
                </div>
              {/* </div> */}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Queued Test Entries</p>
                <Clock3 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{queued.length}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Waiting for laboratory acceptance</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Pending Tests</p>
                <FlaskConical size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{pending.length}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Accepted and currently processing</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Completed Tests</p>
                <CheckCircle2 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{done.length}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Individual tests already finished</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Completed Patient Requests</p>
                <Activity size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{completedRequestCount}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Only elevated once all tests are done</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#133d37]">Request Notifications Queue</h2>
                <div className="rounded-full bg-[#e3f6f2] px-3 py-1 text-xs font-medium text-[#2e6e64]">
                  {queued.length} queued
                </div>
              </div>

              <div className="space-y-3">
                {loadingRequests ? (
                  <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84]">
                    Loading laboratory requests...
                  </div>
                ) : queued.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84]">
                    No queued requests at the moment.
                  </div>
                ) : (
                  queued.map((item) => (
                    <div
                      key={item.labId}
                      className="rounded-xl border border-[#d5ebe6] bg-[#fbfefe] p-4 transition hover:border-[#9fd3c9]"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[#e6f7f3] px-2 py-1 text-xs font-semibold text-[#2e7a6e]">
                              {item.id}
                            </span>
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                item.requestStatus
                              )}`}
                            >
                              Patient Request: {item.requestStatus}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#173f39]">{item.patientName}</p>
                          <p className="text-xs text-[#577d76]">
                            {item.patientId} • Current Test: {item.testType}
                          </p>
                          <p className="text-xs text-[#6f948d]">
                            Completed: {formatList(item.completedTests)}
                          </p>
                          <p className="text-xs text-[#6f948d]">
                            Remaining: {formatList(item.pendingTests)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => acceptRequest(item.labId)}
                          disabled={busyRequestId === item.labId}
                          className="min-w-[148px]"
                        >
                          {busyRequestId === item.labId ? "Accepting..." : "Accept Request"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#133d37]">Pending Test Entries</h2>
                  <Microscope size={17} className="text-[#2f9f90]" />
                </div>

                <div className="space-y-3">
                  {loadingRequests ? (
                    <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-5 text-center text-sm text-[#5c8b84]">
                      Loading pending requests...
                    </div>
                  ) : pending.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-5 text-center text-sm text-[#5c8b84]">
                      No pending requests.
                    </div>
                  ) : (
                    pending.map((item) => (
                      <div key={item.labId} className="rounded-xl border border-[#d5ebe6] bg-[#fbfefe] p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-[#173f39]">{item.patientName}</p>
                            <p className="text-xs text-[#63867f]">
                              {item.testType} • {categoryLabels[resolveCategory(item)]}
                            </p>
                            <p className="text-xs text-[#6f948d]">
                              Done: {item.completedCount} / {item.totalTests}
                            </p>
                          </div>
                          <span className="rounded-md bg-[#ecf6f4] px-2 py-1 text-[11px] font-medium text-[#396f66]">
                            {item.id}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={() => openModal(item)}
                            className="min-w-[150px]"
                          >
                            {resolveCategory(item) === "other" ? "Update Result" : "Encode Result"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#133d37]">Performance Snapshot</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#476d67]">
                      <span>Acceptance rate</span>
                      <span>{acceptanceRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                      <div className="h-full rounded-full bg-[#152859]" style={{ width: `${acceptanceRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#476d67]">
                      <span>Completion rate</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                      <div className="h-full rounded-full bg-[#152859]" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-[#f4faf8] p-3">
                      <div className="flex items-center gap-2 text-[#326a61]">
                        <UserRound size={14} />
                        <span className="text-xs font-medium">Patient Requests</span>
                      </div>
                      <p className="mt-2 text-xl font-bold text-[#143a35]">{requestPreviews.length}</p>
                    </div>
                    <div className="rounded-lg bg-[#f4faf8] p-3">
                      <div className="flex items-center gap-2 text-[#326a61]">
                        <ClipboardList size={14} />
                        <span className="text-xs font-medium">In Progress</span>
                      </div>
                      <p className="mt-2 text-xl font-bold text-[#143a35]">{inProgressRequests}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#133d37]">Patient Request Preview</h2>
                <p className="mt-1 text-sm text-[#5f8a83]">
                  Review the overall progress of every patient request before it is elevated to done.
                </p>
              </div>
              <span className="rounded-full bg-[#e3f6f2] px-3 py-1 text-xs font-medium text-[#2e6e64]">
                {requestPreviews.length} patient request{requestPreviews.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {loadingRequests ? (
                <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84] lg:col-span-2">
                  Loading patient previews...
                </div>
              ) : requestPreviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84] lg:col-span-2">
                  No patient request previews available.
                </div>
              ) : (
                requestPreviews.map((request) => (
                  <div key={request.requestId} className="rounded-2xl border border-[#d5ebe6] bg-[#fbfefe] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[#e6f7f3] px-2 py-1 text-xs font-semibold text-[#2e7a6e]">
                            {request.id}
                          </span>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                              request.requestStatus
                            )}`}
                          >
                            {request.requestStatus === "done" ? "All Tests Done" : request.requestStatus}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-[#173f39]">{request.patientName}</p>
                        <p className="text-xs text-[#63867f]">
                          {request.patientId} • Requested by {request.requestedBy}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f4faf8] px-3 py-2 text-right">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#63867f]">
                          Progress
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#143a35]">
                          {request.completedCount}/{request.totalTests}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#63867f]">
                          Completed Tests
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {request.completedTests.length ? (
                            request.completedTests.map((test) => (
                              <span
                                key={`${request.requestId}-${test}-done`}
                                className="rounded-full bg-[#e3f6ea] px-3 py-1 text-xs font-medium text-[#237a4e]"
                              >
                                {test}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#6f948d]">No completed tests yet.</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#63867f]">
                          Remaining Tests
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {request.pendingTests.length ? (
                            request.pendingTests.map((test) => (
                              <span
                                key={`${request.requestId}-${test}-pending`}
                                className="rounded-full bg-[#f4efe0] px-3 py-1 text-xs font-medium text-[#8a6a18]"
                              >
                                {test}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#237a4e]">
                              All requested tests are already complete.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

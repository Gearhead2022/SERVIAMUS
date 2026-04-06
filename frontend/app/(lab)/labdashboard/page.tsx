"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Beaker,
  BellRing,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Microscope,
  UserRound,
} from "lucide-react";
import ModalHeader from "@/components/Modal/ModalHeader";
import ClinicalChemistryModal from "@/components/Modal/LabModal/ClinicalChemistryModal";
import HematologyModal from "@/components/Modal/LabModal/HematologyModal";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import ParasitologyModal from "@/components/Modal/LabModal/ParasitologyModal";
import UrinalysisModal from "@/components/Modal/LabModal/UrinalysisModal";
import select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import input from "@/components/ui/Input";
import label from "@/components/ui/label";
import textarea from "@/components/ui/Textarea";




import {
  fetchLabRequests,
  saveLabResult,
  updateLabRequestStatus,
  type LabCategory,
  type LabRequest,
} from "@/services/lab.service";
import SweetAlert from "@/utils/SweetAlert";

const categoryLabels: Record<LabCategory, string> = {
  "clinical-chemistry": "Clinical Chemistry",
  hematology: "Hematology",
  parasitology: "Parasitology",
  urinalysis: "Urinalysis",
};

function getCategory(testType: string): LabCategory {
  const value = testType.toLowerCase();
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
  return "clinical-chemistry";
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeRequest, setActiveRequest] = useState<LabRequest | null>(null);
  const [previewPayload, setPreviewPayload] = useState<{
    request: LabRequest;
    category: LabCategory;
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

  const queued = useMemo(() => requests.filter((item) => item.status === "queued"), [requests]);
  const pending = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
  const done = useMemo(() => requests.filter((item) => item.status === "done"), [requests]);
  const urgentCount = useMemo(() => requests.filter((item) => item.priority === "Urgent").length, [requests]);

  const acceptanceRate = useMemo(() => {
    const accepted = pending.length + done.length;
    if (!requests.length) return 0;
    return Math.round((accepted / requests.length) * 100);
  }, [requests.length, pending.length, done.length]);

  const completionRate = useMemo(() => {
    if (!requests.length) return 0;
    return Math.round((done.length / requests.length) * 100);
  }, [requests.length, done.length]);

  const activeCategory = activeRequest ? getCategory(activeRequest.testType) : null;

  const replaceRequest = (updated: LabRequest) => {
    setRequests((prev) => prev.map((item) => (item.labId === updated.labId ? updated : item)));
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
      await saveLabResult({
        labId: activeRequest.labId,
        category: activeCategory,
        form,
      });

      setPreviewPayload({ request: activeRequest, category: activeCategory, form });
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
    if (!activeCategory) return null;
    if (activeCategory === "hematology") {
      return <HematologyModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }
    if (activeCategory === "parasitology") {
      return <ParasitologyModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }
    if (activeCategory === "urinalysis") {
      return <UrinalysisModal onSubmit={handleSaveResults} onCancel={closeModal} />;
    }
    return <ClinicalChemistryModal onSubmit={handleSaveResults} onCancel={closeModal} />;
  };

  return (
    <>
      {activeRequest && !previewPayload ? (
        <ModalHeader
          showModal={!!activeRequest}
          title={`Laboratory Request - ${categoryLabels[activeCategory ?? "clinical-chemistry"]}`}
          onClose={closeModal}
        >
          <div className="border-b border-[#d2ebe6] bg-[#f5fbfa] px-5 py-3">
            <p className="text-xs font-medium text-[#2f5e57]">
              {activeRequest.id} • {activeRequest.patientId}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#133d37]">
              {activeRequest.patientName} • {activeRequest.testType}
            </p>
            {savingResults ? (
              <p className="mt-2 text-xs font-medium text-[#2f5e57]">Saving encoded results...</p>
            ) : null}
          </div>
          {renderSelectedModal()}
        </ModalHeader>
      ) : null}

      {previewPayload ? (
        <ModalHeader showModal={true} title={`Result Preview - ${previewPayload.request.patientName}`} onClose={closeModal}>
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
          <div className="relative overflow-hidden rounded-2xl border border-[#84c7bb]/50 bg-gradient-to-r from-[#182955] via-[#2e4274] to-[#374b7e] p-5 text-white shadow-[0_18px_40px_rgba(8,31,28,0.25)] md:p-6">
            <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-[#7bd9c3]/20 blur-3xl" />
            <div className="absolute -bottom-10 left-14 h-32 w-32 rounded-full bg-[#ffffff]/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Laboratory Operations</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Laboratory Dashboard</h1>
              </div>
              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <BellRing size={16} className="text-[#c8ffe8]" />
                  <span>{queued.length} new request{queued.length === 1 ? "" : "s"} in queue</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Queued Requests</p>
                <Clock3 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{queued.length}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Awaiting laboratory acceptance</p>
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
                <p className="text-sm font-medium text-[#2f5e57]">Completed</p>
                <CheckCircle2 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{done.length}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Done and confirmed by personnel</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Urgent Cases</p>
                <Activity size={18} className="text-[#dc6f4f]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{urgentCount}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Needs faster turnaround</p>
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
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[#e6f7f3] px-2 py-1 text-xs font-semibold text-[#2e7a6e]">
                              {item.id}
                            </span>
                            <span className="rounded-md bg-[#eef5f4] px-2 py-1 text-xs font-semibold text-[#4d7a73]">
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-[#173f39]">{item.patientName}</p>
                          <p className="mt-1 text-xs text-[#577d76]">
                            {item.patientId} • {item.testType}
                          </p>
                          <p className="mt-1 text-xs text-[#6f948d]">Requested at {item.requestedAt}</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => acceptRequest(item.labId)}
                          disabled={busyRequestId === item.labId}
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
                  <h2 className="text-lg font-semibold text-[#133d37]">Pending Requests</h2>
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
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[#173f39]">{item.patientName}</p>
                            <p className="text-xs text-[#63867f]">{item.testType}</p>
                          </div>
                          <span className="rounded-md bg-[#ecf6f4] px-2 py-1 text-[11px] font-medium text-[#396f66]">
                            {item.id}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => openModal(item)}
                        >
                          Confirm Done
                        </Button>
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
                        <span className="text-xs font-medium">Patients today</span>
                      </div>
                      <p className="mt-2 text-xl font-bold text-[#143a35]">{requests.length}</p>
                    </div>
                    <div className="rounded-lg bg-[#f4faf8] p-3">
                      <div className="flex items-center gap-2 text-[#326a61]">
                        <Beaker size={14} />
                        <span className="text-xs font-medium">Results encoded</span>
                      </div>
                      <p className="mt-2 text-xl font-bold text-[#143a35]">{done.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

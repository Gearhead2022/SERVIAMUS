"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FlaskConical,
  Filter,
  Microscope,
  UserRound,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ModalHeader from "@/components/Modal/ModalHeader";
import LabResultEditor from "@/components/Modal/LabModal/LabResultEditor";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import {
  useLabRequests,
  useSaveLabResult,
  useUpdateLabRequestStatus,
} from "@/hooks/Lab/useLab";
import Button from "@/components/ui/Button";
import { LabRecordGroup, LabRequest, LabResultPayload, RequestStatus } from "@/types/LabTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import { openLabPrintPage } from "@/utils/lab-print";
import {
  getLabRecordGroupLabel,
  resolveLabTemplate,
} from "@/utils/lab-templates";
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
  completedTests: string[];
  pendingTests: string[];
  completedCount: number;
  totalTests: number;
  recordGroups: LabRecordGroup[];
};

const requestPreviewGroupOrder: LabRecordGroup[] = [
  "hematology",
  "serology",
  "clinical-chemistry",
  "clinical-microscopy",
  "other",
];

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

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

function formatCurrency(value: number) {
  return pesoFormatter.format(value);
}

function matchesRequestDateFilter(requestedDate: string, dateFilter: string) {
  if (!dateFilter) {
    return true;
  }

  return requestedDate.slice(0, 10) === dateFilter;
}

function formatRequestPreviewCategories(recordGroups: LabRecordGroup[]) {
  return requestPreviewGroupOrder
    .filter((group) => recordGroups.includes(group))
    .map((group) => getLabRecordGroupLabel(group))
    .join(", ");
}

function formatProgressLabel(completedCount: number, totalTests: number) {
  return `${completedCount}/${totalTests} completed`;
}

function getProgressPercent(completedCount: number, totalTests: number) {
  if (!totalTests) {
    return 0;
  }

  return Math.min(100, Math.round((completedCount / totalTests) * 100));
}

function jumpToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function DashboardPage() {
  const [activeRequest, setActiveRequest] = useState<LabRequest | null>(null);
  const [previewPayload, setPreviewPayload] = useState<{
    request: LabRequest;
    form: LabResultPayload;
  } | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [requestPreviewDate, setRequestPreviewDate] = useState("");
  const [requestPreviewCategory, setRequestPreviewCategory] = useState<
    LabRecordGroup | "all"
  >("all");
  const [requestPreviewStatusTab, setRequestPreviewStatusTab] = useState<
    "pending" | "done"
  >("pending");
  const [showAllRequestPreviews, setShowAllRequestPreviews] = useState(false);
  const {
    data: requests = [],
    error: labRequestsError,
    isLoading: loadingRequests,
  } = useLabRequests();
  const { mutateAsync: updateRequestStatus } = useUpdateLabRequestStatus();
  const { mutateAsync: persistLabResult, isPending: savingResults } = useSaveLabResult();

  useEffect(() => {
    if (!activeRequest) {
      return;
    }

    const latestRequest = requests.find((item) => item.labId === activeRequest.labId);

    if (latestRequest) {
      setActiveRequest(latestRequest);
    }
  }, [activeRequest, requests]);

  useEffect(() => {
    if (!previewPayload) {
      return;
    }

    const latestRequest = requests.find(
      (item) => item.labId === previewPayload.request.labId
    );

    if (latestRequest) {
      setPreviewPayload((current) =>
        current ? { ...current, request: latestRequest } : current
      );
    }
  }, [previewPayload, requests]);

  useEffect(() => {
    if (!labRequestsError) {
      return;
    }

    SweetAlert.errorAlert(
      "Load Failed",
      getApiErrorMessage(labRequestsError, "Unable to load laboratory requests.")
    );
  }, [labRequestsError]);

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
      const currentPreview = groupedRequests.get(item.requestId);

      if (currentPreview) {
        if (!currentPreview.recordGroups.includes(item.recordGroup)) {
          currentPreview.recordGroups.push(item.recordGroup);
        }

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
        completedTests: item.completedTests,
        pendingTests: item.pendingTests,
        completedCount: item.completedCount,
        totalTests: item.totalTests,
        recordGroups: [item.recordGroup],
      });
    });

    return Array.from(groupedRequests.values()).sort(
      (left, right) =>
        new Date(right.requestedDate).getTime() - new Date(left.requestedDate).getTime()
    );
  }, [requests]);

  const filteredRequestPreviews = useMemo(() => {
    return requestPreviews.filter((item) => {
      const matchesDate = matchesRequestDateFilter(item.requestedDate, requestPreviewDate);
      const matchesCategory =
        requestPreviewCategory === "all" ||
        item.recordGroups.includes(requestPreviewCategory);
      const matchesStatus =
        requestPreviewStatusTab === "done"
          ? item.requestStatus === "done"
          : item.requestStatus !== "done";

      return matchesDate && matchesCategory && matchesStatus;
    });
  }, [requestPreviews, requestPreviewCategory, requestPreviewDate, requestPreviewStatusTab]);

  const visibleRequestPreviews = useMemo(
    () =>
      showAllRequestPreviews
        ? filteredRequestPreviews
        : filteredRequestPreviews.slice(0, 4),
    [filteredRequestPreviews, showAllRequestPreviews]
  );

  const hiddenPreviewCount = Math.max(
    filteredRequestPreviews.length - visibleRequestPreviews.length,
    0
  );
  const requestPreviewFilterSummary = useMemo(() => {
    const summaryParts: string[] = [
      requestPreviewStatusTab === "done" ? "Done requests" : "Pending requests",
    ];

    if (requestPreviewCategory !== "all") {
      summaryParts.push(getLabRecordGroupLabel(requestPreviewCategory));
    }

    if (requestPreviewDate) {
      summaryParts.push(new Date(requestPreviewDate).toLocaleDateString());
    }

    return summaryParts.join(" | ");
  }, [requestPreviewCategory, requestPreviewDate, requestPreviewStatusTab]);
  const activeTemplate = activeRequest ? resolveLabTemplate(activeRequest) : null;
  const pendingRequestPreviewCount = useMemo(
    () => requestPreviews.filter((item) => item.requestStatus !== "done").length,
    [requestPreviews]
  );
  const doneRequestPreviewCount = useMemo(
    () => requestPreviews.filter((item) => item.requestStatus === "done").length,
    [requestPreviews]
  );
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

  const syncSelectedRequest = (updated: LabRequest) => {
    if (activeRequest?.labId === updated.labId) {
      setActiveRequest(updated);
    }

    if (previewPayload?.request.labId === updated.labId) {
      setPreviewPayload((current) =>
        current ? { ...current, request: updated } : current
      );
    }
  };

  const acceptRequest = async (request: LabRequest) => {
    if (!request.isPaid) {
      SweetAlert.errorAlert(
        "Payment Required",
        "This laboratory request is locked until the cashier marks the bill as paid."
      );
      return;
    }

    try {
      setBusyRequestId(request.labId);
      const updated = await updateRequestStatus({
        labId: request.labId,
        status: "pending",
      });
      syncSelectedRequest(updated);
    } catch {
      // Alerts are handled in the lab hook.
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
  };

  const handleSaveResults = async (form: LabResultPayload) => {
    if (!activeRequest || !activeTemplate) {
      return;
    }

    try {
      const updated = await persistLabResult({
        labId: activeRequest.labId,
        category: activeTemplate.apiCategory,
        form,
      });

      syncSelectedRequest(updated);
      setPreviewPayload({ request: updated, form });
    } catch {
      // Alerts are handled in the lab hook.
    }
  };

  const completeRequest = async () => {
    if (!previewPayload) {
      return;
    }

    try {
      setBusyRequestId(previewPayload.request.labId);
      const updated = await updateRequestStatus({
        labId: previewPayload.request.labId,
        status: "done",
      });
      syncSelectedRequest(updated);
      closeModal();
    } catch {
      // Alerts are handled in the lab hook.
    } finally {
      setBusyRequestId(null);
    }
  };

  return (
    <>
      {activeRequest && !previewPayload ? (
        <ModalHeader
          showModal={true}
          title={`Laboratory Request - ${activeTemplate?.label ?? "General Result"}`}
          subtitle={`${activeRequest.patientName} - ${activeRequest.testType}`}
          meta={`${activeRequest.id} - ${activeRequest.patientId}`}
          onClose={closeModal}
        >
          <div className="border-b border-[#d2ebe6] bg-[#f5fbfa] px-5 py-3">
            <p className="text-xs font-medium text-[#2f5e57]">
              Requested by {activeRequest.requestedBy}
            </p>
            <p className="mt-1 text-xs font-medium text-[#2f5e57]">
              {activeRequest.billingCode ?? "Billing not assigned"} -{" "}
              {activeRequest.isPaid
                ? `Paid (${formatCurrency(activeRequest.billingTotal)})`
                : `Unpaid (${formatCurrency(activeRequest.billingTotal)})`}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#133d37]">
              {activeRequest.completedCount} of {activeRequest.totalTests} test
              {activeRequest.totalTests === 1 ? "" : "s"} completed for this patient request
            </p>
            {savingResults ? (
              <p className="mt-2 text-xs font-medium text-[#2f5e57]">
                Saving encoded results...
              </p>
            ) : null}
          </div>

          <LabResultEditor
            request={activeRequest}
            onSubmit={handleSaveResults}
            onCancel={closeModal}
          />
        </ModalHeader>
      ) : null}

      {previewPayload ? (
        <ModalHeader
          showModal={true}
          title={`Result Preview - ${previewPayload.request.patientName}`}
          subtitle={previewPayload.request.testType}
          meta={`${previewPayload.request.id} - ${previewPayload.request.patientId}`}
          onClose={closeModal}
        >
          <LabResultPreview
            request={previewPayload.request}
            form={previewPayload.form}
            onBack={() => setPreviewPayload(null)}
            onDownloadPdf={() =>
              openLabPrintPage(previewPayload.request.labId, {
                autoDownload: true,
              })
            }
            onDone={completeRequest}
            onOpenPrintPage={() =>
              openLabPrintPage(previewPayload.request.labId, {
                autoPrint: true,
              })
            }
            onPassToDoctor={completeRequest}
            showDoneButton
          />
        </ModalHeader>
      ) : null}

      <div className="min-h-full p-6 md:p-7">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* <section className="overflow-hidden rounded-[28px] border border-[#cfe7e1] bg-[linear-gradient(135deg,#f7fcfb_0%,#eef8f5_52%,#f6fbff_100%)] shadow-sm"> */}
            {/* <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-7"> */}
              {/* <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#5b7c76]">
                    Laboratory Workspace
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-[#133d37]">
                    Laboratory operations dashboard
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f8a83]">
                    Use this page in order: accept paid requests, encode pending results, then
                    review patient-level progress before printing or forwarding results.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => jumpToSection("queue-section")}>
                    Open Queue
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => jumpToSection("pending-section")}
                  >
                    Encode Pending Results
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => jumpToSection("preview-section")}
                  >
                    Review Patient Progress
                  </Button>
                </div> */}

                {/* <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[#295f56]">
                      <Clock3 size={16} />
                      <p className="text-sm font-semibold">Step 1</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#143a35]">
                      Accept queued requests
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#5f8a83]">
                      Only paid requests can move into the active laboratory work queue.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[#295f56]">
                      <FlaskConical size={16} />
                      <p className="text-sm font-semibold">Step 2</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#143a35]">
                      Encode and preview results
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#5f8a83]">
                      Save results, confirm the preview, then print or finish the request.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[#295f56]">
                      <ClipboardList size={16} />
                      <p className="text-sm font-semibold">Step 3</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#143a35]">
                      Review patient request progress
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#5f8a83]">
                      Filter patient-level previews by date or category to keep the list short.
                    </p>
                  </div>
                </div>
              </div> */}
{/* 
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-[#133d37] p-5 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                    Live workload
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-bold">{queued.length}</p>
                      <p className="mt-1 text-xs text-white/65">Queued tests</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{pending.length}</p>
                      <p className="mt-1 text-xs text-white/65">Pending tests</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{requestPreviews.length}</p>
                      <p className="mt-1 text-xs text-white/65">Patient requests</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{completionRate}%</p>
                      <p className="mt-1 text-xs text-white/65">Completion rate</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d9ede8] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f8a83]">
                        Current focus
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#143a35]">
                        {queued.length > 0
                          ? "Review paid queued requests first"
                          : pending.length > 0
                            ? "Finish pending encodings"
                            : "Queue is clear"}
                      </p>
                    </div>
                    <ArrowRight size={18} className="mt-1 text-[#2f9f90]" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5f8a83]">
                    {queued.length > 0
                      ? "Check billing status, accept the paid requests, and move them into result encoding."
                      : pending.length > 0
                        ? "Open each pending request, encode the result, and use the preview to complete the request."
                        : "Use the patient request preview below to review finished work and remaining patient-level activity."}
                  </p>
                </div>
              </div>
            </div>
          </section> */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Queued Test Entries</p>
                <Clock3 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{queued.length}</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Pending Tests</p>
                <FlaskConical size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{pending.length}</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Completed Tests</p>
                <CheckCircle2 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{done.length}</p>
            </div>
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Completed Patient Requests</p>
                <Activity size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{completedRequestCount}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <section
              id="queue-section"
              className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#133d37]">
                    Request Notifications Queue
                  </h2>
                  <p className="mt-1 text-sm text-[#5f8a83]">
                    Review each laboratory entry before accepting it into the active work queue.
                  </p>
                </div>
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
                  queued.map((item) => {
                    const template = resolveLabTemplate(item);

                    return (
                      <div
                        key={item.labId}
                        className="rounded-xl border border-[#d5ebe6] bg-[#fbfefe] p-4 transition hover:border-[#9fd3c9]"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-3">
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
                              <span
                                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                  item.isPaid
                                    ? "bg-[#e8f7ee] text-[#2f7d4b]"
                                    : "bg-[#fff4df] text-[#9a6a18]"
                                }`}
                              >
                                Billing: {item.isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#173f39]">
                                {item.patientName}
                              </p>
                              <p className="mt-1 text-xs text-[#577d76]">
                                {item.patientId} - Current Test: {item.testType}
                              </p>
                            </div>
                            <div className="grid gap-2 text-xs text-[#5f8a83] sm:grid-cols-2">
                              <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
                                <p className="font-semibold uppercase tracking-[0.16em] text-[#63867f]">
                                  Template
                                </p>
                                <p className="mt-1 text-[#476d67]">{template.label}</p>
                              </div>
                              <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
                                <p className="font-semibold uppercase tracking-[0.16em] text-[#63867f]">
                                  Billing
                                </p>
                                <p className="mt-1 text-[#476d67]">
                                  {item.billingCode ?? "Billing not assigned"} -{" "}
                                  {formatCurrency(item.billingTotal)}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-[#577d76]">
                              Completed: {formatList(item.completedTests)}
                            </p>
                            <p className="text-xs text-[#6f948d]">
                              Remaining: {formatList(item.pendingTests)}
                            </p>
                            <div>
                              <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[#5b7c76]">
                                <span>Patient request progress</span>
                                <span>{formatProgressLabel(item.completedCount, item.totalTests)}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                                <div
                                  className="h-full rounded-full bg-[#152859]"
                                  style={{
                                    width: `${getProgressPercent(
                                      item.completedCount,
                                      item.totalTests
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            {!item.isPaid ? (
                              <p className="text-xs font-medium text-[#9a6a18]">
                                Locked until cashier posts payment.
                              </p>
                            ) : null}
                          </div>
                          <Button
                            type="button"
                            onClick={() => acceptRequest(item)}
                            disabled={busyRequestId === item.labId || !item.isPaid}
                            className="min-w-[148px]"
                          >
                            {busyRequestId === item.labId
                              ? "Accepting..."
                              : item.isPaid
                                ? "Accept Request"
                                : "Awaiting Payment"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div
                id="pending-section"
                className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#133d37]">Pending Test Entries</h2>
                    <p className="mt-1 text-sm text-[#5f8a83]">
                      Open a request here to encode results and continue to the preview step.
                    </p>
                  </div>
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
                    pending.map((item) => {
                      const template = resolveLabTemplate(item);

                      return (
                        <div
                          key={item.labId}
                          className="rounded-xl border border-[#d5ebe6] bg-[#fbfefe] p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-[#ecf6f4] px-2 py-1 text-[11px] font-medium text-[#396f66]">
                                  {item.id}
                                </span>
                                <span className="rounded-md bg-[#eef4ff] px-2 py-1 text-[11px] font-medium text-[#305c9b]">
                                  {getLabRecordGroupLabel(item.recordGroup)}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-[#173f39]">
                                {item.patientName}
                              </p>
                              <p className="text-xs text-[#63867f]">
                                {item.testType} - {template.label}
                              </p>
                              <div>
                                <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[#5b7c76]">
                                  <span>Progress</span>
                                  <span>
                                    {formatProgressLabel(item.completedCount, item.totalTests)}
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                                  <div
                                    className="h-full rounded-full bg-[#152859]"
                                    style={{
                                      width: `${getProgressPercent(
                                        item.completedCount,
                                        item.totalTests
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-[#6f948d]">
                                Requested by {item.requestedBy}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={() => openModal(item)}
                              className="min-w-[150px]"
                            >
                              {template.key === "general" ? "Update Result" : "Encode Result"}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#133d37]">Performance Snapshot</h2>
                    <p className="mt-1 text-sm text-[#5f8a83]">
                      Quick indicators for workload movement across requests and finished work.
                    </p>
                  </div>
                  <Activity size={18} className="text-[#2f9f90]" />
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#476d67]">
                      <span>Acceptance rate</span>
                      <span>{acceptanceRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                      <div
                        className="h-full rounded-full bg-[#152859]"
                        style={{ width: `${acceptanceRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#476d67]">
                      <span>Completion rate</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                      <div
                        className="h-full rounded-full bg-[#152859]"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-[#f4faf8] p-3">
                      <div className="flex items-center gap-2 text-[#326a61]">
                        <UserRound size={14} />
                        <span className="text-xs font-medium">Patient Requests</span>
                      </div>
                      <p className="mt-2 text-xl font-bold text-[#143a35]">
                        {requestPreviews.length}
                      </p>
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

          <section
            id="preview-section"
            className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#133d37]">Patient Request Preview</h2>
                <p className="mt-1 text-sm text-[#5f8a83]">
                  Patient-level request progress, split into pending and done groups, with date and
                  laboratory category filters.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Request Date"
                  type="date"
                  value={requestPreviewDate}
                  onChange={(event) => {
                    setRequestPreviewDate(event.target.value);
                    setShowAllRequestPreviews(false);
                  }}
                />
                <Select
                  label="Laboratory Category"
                  value={requestPreviewCategory}
                  onChange={(event) => {
                    setRequestPreviewCategory(
                      event.target.value as LabRecordGroup | "all"
                    );
                    setShowAllRequestPreviews(false);
                  }}
                >
                  <option value="all">All Categories</option>
                  {requestPreviewGroupOrder.map((group) => (
                    <option key={group} value={group}>
                      {getLabRecordGroupLabel(group)}
                    </option>
                  ))}
                </Select>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setRequestPreviewDate("");
                      setRequestPreviewCategory("all");
                      setShowAllRequestPreviews(false);
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestPreviewStatusTab("pending");
                    setShowAllRequestPreviews(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    requestPreviewStatusTab === "pending"
                      ? "bg-[#152859] text-white"
                      : "bg-[#eef4f3] text-[#456c65]"
                  }`}
                >
                  Pending Requests ({pendingRequestPreviewCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestPreviewStatusTab("done");
                    setShowAllRequestPreviews(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    requestPreviewStatusTab === "done"
                      ? "bg-[#152859] text-white"
                      : "bg-[#eef4f3] text-[#456c65]"
                  }`}
                >
                  Done Requests ({doneRequestPreviewCount})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5f8a83]">
                <span className="rounded-full bg-[#eef4f3] px-3 py-1 text-[#456c65]">
                  <Filter size={12} className="mr-1 inline-flex" />
                  {requestPreviewFilterSummary}
                </span>
                <span>
                  Showing {visibleRequestPreviews.length} of {filteredRequestPreviews.length}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {loadingRequests ? (
                <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84] lg:col-span-2">
                  Loading patient previews...
                </div>
              ) : filteredRequestPreviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84] lg:col-span-2">
                  No patient request previews matched the selected filters.
                </div>
              ) : (
                visibleRequestPreviews.map((request) => (
                  <div
                    key={request.requestId}
                    className="rounded-2xl border border-[#d5ebe6] bg-[#fbfefe] p-4"
                  >
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
                            {request.requestStatus === "done"
                              ? "All Tests Done"
                              : request.requestStatus}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-[#173f39]">{request.patientName}</p>
                        <p className="text-xs text-[#63867f]">
                          {request.patientId} - Requested by {request.requestedBy}
                        </p>
                        <p className="text-xs text-[#63867f]">
                          Categories: {formatRequestPreviewCategories(request.recordGroups)}
                        </p>
                        <p className="text-xs text-[#6f948d]">
                          Request date: {new Date(request.requestedDate).toLocaleDateString()} at{" "}
                          {request.requestedAt}
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

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3f3ef]">
                      <div
                        className="h-full rounded-full bg-[#152859]"
                        style={{
                          width: `${getProgressPercent(
                            request.completedCount,
                            request.totalTests
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 text-xs text-[#5f8a83] sm:grid-cols-2">
                      <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
                        <p className="font-semibold uppercase tracking-[0.18em] text-[#63867f]">
                          Completed Tests
                        </p>
                        <p className="mt-2 leading-5 text-[#476d67]">
                          {request.completedTests.length
                            ? formatList(request.completedTests)
                            : "No completed tests yet."}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
                        <p className="font-semibold uppercase tracking-[0.18em] text-[#63867f]">
                          Remaining Tests
                        </p>
                        <p className="mt-2 leading-5 text-[#476d67]">
                          {request.pendingTests.length
                            ? formatList(request.pendingTests)
                            : "All requested tests are already complete."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {hiddenPreviewCount > 0 ? (
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAllRequestPreviews(true)}
                >
                  See More ({hiddenPreviewCount})
                </Button>
              </div>
            ) : showAllRequestPreviews && filteredRequestPreviews.length > 4 ? (
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAllRequestPreviews(false)}
                >
                  Show Less
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

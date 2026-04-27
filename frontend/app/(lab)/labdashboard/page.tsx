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
    return "status-badge status-done";
  }
  if (status === "pending") {
    return "status-badge status-pending";
  }
  return "status-badge status-queued";
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

    return summaryParts.join(" · ");
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        .lab-dashboard {
          font-family: 'DM Sans', sans-serif;
          background: #f0f4f8;
          min-height: 100%;
        }

        /* ── Stat Cards ── */
        .stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px 22px;
          border: 1px solid #e2eaf2;
          box-shadow: 0 1px 3px rgba(15,30,60,0.06), 0 4px 16px rgba(15,30,60,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent-line, linear-gradient(90deg, #1e4d8c, #2a9d8f));
          border-radius: 16px 16px 0 0;
        }
        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(15,30,60,0.10), 0 8px 32px rgba(15,30,60,0.06);
          transform: translateY(-2px);
        }
        .stat-label {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6b7d90;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #0f1e3c;
          line-height: 1;
          margin-top: 12px;
          font-variant-numeric: tabular-nums;
        }
        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef4fb;
          color: #2563a8;
          flex-shrink: 0;
        }

        /* ── Section Cards ── */
        .section-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2eaf2;
          box-shadow: 0 1px 3px rgba(15,30,60,0.05), 0 4px 20px rgba(15,30,60,0.04);
          padding: 24px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #0f1e3c;
          letter-spacing: -0.01em;
        }
        .section-subtitle {
          font-size: 13px;
          color: #7a8fa8;
          margin-top: 3px;
        }
        .section-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: #eef4fb;
          color: #2563a8;
          letter-spacing: 0.03em;
        }

        /* ── Queue / Request Items ── */
        .request-item {
          border: 1px solid #e8eef6;
          border-radius: 14px;
          padding: 16px;
          background: #fafcff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .request-item:hover {
          border-color: #b8ccec;
          box-shadow: 0 2px 12px rgba(30,77,140,0.08);
        }
        .pending-item {
          border: 1px solid #e8eef6;
          border-radius: 12px;
          padding: 14px 16px;
          background: #fafcff;
          transition: border-color 0.15s ease;
        }
        .pending-item:hover {
          border-color: #b8ccec;
        }

        /* ── Status Badges ── */
        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.03em;
        }
        .status-done {
          background: #e6f6ee;
          color: #1a7a4a;
        }
        .status-pending {
          background: #e8f0fc;
          color: #2255a4;
        }
        .status-queued {
          background: #fef5e4;
          color: #8a6010;
        }
        .billing-paid {
          background: #e6f6ee;
          color: #1a7a4a;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .billing-unpaid {
          background: #fef5e4;
          color: #8a6010;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .id-chip {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 6px;
          background: #eef4fb;
          color: #2563a8;
          letter-spacing: 0.04em;
        }
        .category-chip {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 6px;
          background: #f0eeff;
          color: #5040a8;
        }

        /* ── Progress Bar ── */
        .progress-track {
          height: 6px;
          background: #e8eef6;
          border-radius: 99px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #1e4d8c, #2a9d8f);
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Info Tiles ── */
        .info-tile {
          background: #f5f8fc;
          border-radius: 10px;
          padding: 10px 12px;
        }
        .info-tile-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7a8fa8;
        }
        .info-tile-value {
          font-size: 12.5px;
          color: #2e4060;
          margin-top: 4px;
          line-height: 1.45;
        }

        /* ── Performance Snapshot ── */
        .perf-bar-label {
          font-size: 11.5px;
          font-weight: 500;
          color: #4a607a;
        }
        .perf-bar-value {
          font-size: 11.5px;
          font-weight: 700;
          color: #0f1e3c;
        }
        .perf-tile {
          background: #f5f8fc;
          border-radius: 12px;
          padding: 14px;
        }
        .perf-tile-label {
          font-size: 11px;
          font-weight: 600;
          color: #5a7090;
        }
        .perf-tile-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f1e3c;
          margin-top: 6px;
        }

        /* ── Filter Tabs ── */
        .filter-tab {
          font-size: 12px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
          letter-spacing: 0.01em;
        }
        .filter-tab-active {
          background: #0f1e3c;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(15,30,60,0.25);
        }
        .filter-tab-inactive {
          background: #eef2f8;
          color: #4a607a;
        }
        .filter-tab-inactive:hover {
          background: #e0e8f4;
        }

        /* ── Filter Summary Pill ── */
        .filter-summary-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          background: #f0f4f8;
          color: #4a607a;
          border: 1px solid #dde6f0;
        }

        /* ── Preview Cards ── */
        .preview-card {
          border: 1px solid #e2eaf2;
          border-radius: 16px;
          padding: 18px;
          background: #ffffff;
          transition: box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .preview-card:hover {
          border-color: #aec8e8;
          box-shadow: 0 4px 20px rgba(30,77,140,0.08);
        }
        .progress-count-badge {
          background: #eef4fb;
          border-radius: 10px;
          padding: 10px 14px;
          text-align: right;
        }
        .progress-count-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7a8fa8;
        }
        .progress-count-value {
          font-family: 'DM Mono', monospace;
          font-size: 20px;
          font-weight: 700;
          color: #0f1e3c;
          margin-top: 4px;
        }

        /* ── Empty States ── */
        .empty-state {
          border: 1.5px dashed #c8d8e8;
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          font-size: 13px;
          color: #7a8fa8;
          background: #f8fafc;
        }

        /* ── Locked Note ── */
        .locked-note {
          font-size: 11.5px;
          font-weight: 500;
          color: #8a6010;
          background: #fef5e4;
          padding: 6px 10px;
          border-radius: 8px;
          border-left: 3px solid #f0a500;
        }

        /* ── Saving indicator ── */
        .saving-indicator {
          font-size: 12px;
          font-weight: 500;
          color: #2563a8;
          background: #e8f0fc;
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        .saving-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563a8;
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {activeRequest && !previewPayload ? (
        <ModalHeader
          showModal={true}
          title={`Laboratory Request - ${activeTemplate?.label ?? "General Result"}`}
          subtitle={`${activeRequest.patientName} - ${activeRequest.testType}`}
          meta={`${activeRequest.id} - ${activeRequest.patientId}`}
          onClose={closeModal}
        >
          <div className="border-b border-[#e2eaf2] bg-[#f5f8fc] px-6 py-4">
            <p className="text-xs font-medium text-[#4a607a]">
              Requested by {activeRequest.requestedBy}
            </p>
            <p className="mt-1 text-xs font-medium text-[#4a607a]">
              {activeRequest.billingCode ?? "Billing not assigned"} —{" "}
              {activeRequest.isPaid
                ? `Paid (${formatCurrency(activeRequest.billingTotal)})`
                : `Unpaid (${formatCurrency(activeRequest.billingTotal)})`}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-[#0f1e3c]">
              {activeRequest.completedCount} of {activeRequest.totalTests} test
              {activeRequest.totalTests === 1 ? "" : "s"} completed for this patient request
            </p>
            {savingResults ? (
              <span className="saving-indicator">
                <span className="saving-dot" />
                Saving encoded results…
              </span>
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
          title={`Result Preview — ${previewPayload.request.patientName}`}
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

      <div className="lab-dashboard min-h-full p-5 md:p-7">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ── Stat Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card" style={{ "--accent-line": "linear-gradient(90deg, #e08c00, #f5b932)" } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <p className="stat-label">Queued Entries</p>
                <div className="stat-icon" style={{ background: "#fef5e4", color: "#c07800" }}>
                  <Clock3 size={16} />
                </div>
              </div>
              <p className="stat-value">{queued.length}</p>
            </div>
            <div className="stat-card" style={{ "--accent-line": "linear-gradient(90deg, #1e4d8c, #3b82d4)" } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <p className="stat-label">Pending Tests</p>
                <div className="stat-icon">
                  <FlaskConical size={16} />
                </div>
              </div>
              <p className="stat-value">{pending.length}</p>
            </div>
            <div className="stat-card" style={{ "--accent-line": "linear-gradient(90deg, #1a7a4a, #2fb870)" } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <p className="stat-label">Completed Tests</p>
                <div className="stat-icon" style={{ background: "#e6f6ee", color: "#1a7a4a" }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="stat-value">{done.length}</p>
            </div>
            <div className="stat-card" style={{ "--accent-line": "linear-gradient(90deg, #5040a8, #8b7fe8)" } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <p className="stat-label">Completed Requests</p>
                <div className="stat-icon" style={{ background: "#f0eeff", color: "#5040a8" }}>
                  <Activity size={16} />
                </div>
              </div>
              <p className="stat-value">{completedRequestCount}</p>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">

            {/* ── Queue Section ── */}
            <section id="queue-section" className="section-card">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="section-title">Request Notifications Queue</h2>
                </div>
                <span className="section-badge">{queued.length} queued</span>
              </div>

              <div className="space-y-3">
                {loadingRequests ? (
                  <div className="empty-state">Loading laboratory requests…</div>
                ) : queued.length === 0 ? (
                  <div className="empty-state">No queued requests at the moment.</div>
                ) : (
                  queued.map((item) => {
                    const template = resolveLabTemplate(item);
                    return (
                      <div key={item.labId} className="request-item">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-3 flex-1 min-w-0">

                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="id-chip">{item.id}</span>
                              <span className={getStatusBadgeClasses(item.requestStatus)}>
                                Patient: {item.requestStatus}
                              </span>
                              <span className={item.isPaid ? "billing-paid" : "billing-unpaid"}>
                                {item.isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-[#0f1e3c]">{item.patientName}</p>
                              <p className="mt-0.5 text-xs text-[#6b7d90]">
                                {item.patientId} · {item.testType}
                              </p>
                            </div>

                            <div className="grid gap-2 text-xs sm:grid-cols-2">
                              <div className="info-tile">
                                <p className="info-tile-label">Template</p>
                                <p className="info-tile-value">{template.label}</p>
                              </div>
                              <div className="info-tile">
                                <p className="info-tile-label">Billing</p>
                                <p className="info-tile-value">
                                  {item.billingCode ?? "Not assigned"} · {formatCurrency(item.billingTotal)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <p className="text-xs text-[#4a607a]">
                                <span className="font-medium">Completed:</span> {formatList(item.completedTests)}
                              </p>
                              <p className="text-xs text-[#7a8fa8]">
                                <span className="font-medium">Remaining:</span> {formatList(item.pendingTests)}
                              </p>
                            </div>

                            <div>
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-[#6b7d90]">Patient request progress</span>
                                <span className="text-[11px] font-semibold text-[#0f1e3c]">
                                  {formatProgressLabel(item.completedCount, item.totalTests)}
                                </span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${getProgressPercent(item.completedCount, item.totalTests)}%` }}
                                />
                              </div>
                            </div>

                            {!item.isPaid ? (
                              <p className="locked-note">🔒 Locked until cashier posts payment.</p>
                            ) : null}
                          </div>

                          <Button
                            type="button"
                            onClick={() => acceptRequest(item)}
                            disabled={busyRequestId === item.labId || !item.isPaid}
                            className="min-w-[148px] shrink-0"
                          >
                            {busyRequestId === item.labId
                              ? "Accepting…"
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

            {/* ── Right Column ── */}
            <section className="space-y-6">

              {/* Pending Test Entries */}
              <div id="pending-section" className="section-card">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="section-title">Pending Test Entries</h2>
                  <div className="stat-icon">
                    <Microscope size={16} />
                  </div>
                </div>

                <div className="space-y-3">
                  {loadingRequests ? (
                    <div className="empty-state">Loading pending requests…</div>
                  ) : pending.length === 0 ? (
                    <div className="empty-state">No pending requests.</div>
                  ) : (
                    pending.map((item) => {
                      const template = resolveLabTemplate(item);
                      return (
                        <div key={item.labId} className="pending-item">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="id-chip">{item.id}</span>
                                <span className="category-chip">
                                  {getLabRecordGroupLabel(item.recordGroup)}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-[#0f1e3c]">{item.patientName}</p>
                              <p className="text-xs text-[#6b7d90]">
                                {item.testType} · {template.label}
                              </p>
                              <p className="text-xs text-[#7a8fa8]">
                                Requested by {item.requestedBy}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
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

              {/* Performance Snapshot */}
              <div className="section-card">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <h2 className="section-title">Performance Snapshot</h2>
                    <p className="section-subtitle">Workload indicators across requests and completed work.</p>
                  </div>
                  <div className="stat-icon" style={{ background: "#f0eeff", color: "#5040a8" }}>
                    <Activity size={16} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="perf-bar-label">Acceptance rate</span>
                      <span className="perf-bar-value">{acceptanceRate}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${acceptanceRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="perf-bar-label">Completion rate</span>
                      <span className="perf-bar-value">{completionRate}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="perf-tile">
                      <div className="flex items-center gap-2">
                        <UserRound size={13} className="text-[#5a7090]" />
                        <span className="perf-tile-label">Patient Requests</span>
                      </div>
                      <p className="perf-tile-value">{requestPreviews.length}</p>
                    </div>
                    <div className="perf-tile">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={13} className="text-[#5a7090]" />
                        <span className="perf-tile-label">In Progress</span>
                      </div>
                      <p className="perf-tile-value">{inProgressRequests}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── Patient Request Preview ── */}
          <section id="preview-section" className="section-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="section-title">Patient Request Preview</h2>
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
                    setRequestPreviewCategory(event.target.value as LabRecordGroup | "all");
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

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestPreviewStatusTab("pending");
                    setShowAllRequestPreviews(false);
                  }}
                  className={`filter-tab ${
                    requestPreviewStatusTab === "pending" ? "filter-tab-active" : "filter-tab-inactive"
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
                  className={`filter-tab ${
                    requestPreviewStatusTab === "done" ? "filter-tab-active" : "filter-tab-inactive"
                  }`}
                >
                  Done Requests ({doneRequestPreviewCount})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="filter-summary-pill">
                  <Filter size={11} />
                  {requestPreviewFilterSummary}
                </span>
                <span className="text-xs text-[#7a8fa8]">
                  Showing {visibleRequestPreviews.length} of {filteredRequestPreviews.length}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {loadingRequests ? (
                <div className="empty-state lg:col-span-2">Loading patient previews…</div>
              ) : filteredRequestPreviews.length === 0 ? (
                <div className="empty-state lg:col-span-2">
                  No patient request previews matched the selected filters.
                </div>
              ) : (
                visibleRequestPreviews.map((request) => (
                  <div key={request.requestId} className="preview-card">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="id-chip">{request.id}</span>
                          <span className={getStatusBadgeClasses(request.requestStatus)}>
                            {request.requestStatus === "done" ? "All Tests Done" : request.requestStatus}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-[#0f1e3c]">{request.patientName}</p>
                        <p className="text-xs text-[#6b7d90]">
                          {request.patientId} · Requested by {request.requestedBy}
                        </p>
                        <p className="text-xs text-[#7a8fa8]">
                          {formatRequestPreviewCategories(request.recordGroups)}
                        </p>
                        <p className="text-xs text-[#7a8fa8]">
                          {new Date(request.requestedDate).toLocaleDateString()} at {request.requestedAt}
                        </p>
                      </div>

                      <div className="progress-count-badge shrink-0">
                        <p className="progress-count-label">Progress</p>
                        <p className="progress-count-value">
                          {request.completedCount}/{request.totalTests}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercent(request.completedCount, request.totalTests)}%` }}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="info-tile">
                        <p className="info-tile-label">Completed Tests</p>
                        <p className="info-tile-value">
                          {request.completedTests.length
                            ? formatList(request.completedTests)
                            : "No completed tests yet."}
                        </p>
                      </div>
                      <div className="info-tile">
                        <p className="info-tile-label">Remaining Tests</p>
                        <p className="info-tile-value">
                          {request.pendingTests.length
                            ? formatList(request.pendingTests)
                            : "All requested tests are complete."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {hiddenPreviewCount > 0 ? (
              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAllRequestPreviews(true)}
                >
                  See More ({hiddenPreviewCount})
                </Button>
              </div>
            ) : showAllRequestPreviews && filteredRequestPreviews.length > 4 ? (
              <div className="mt-5 flex justify-end">
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
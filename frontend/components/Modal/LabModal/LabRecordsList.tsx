"use client";

import { AlertCircle, Calendar, Eye, Hourglass, TestTube2, type LucideIcon } from "lucide-react";
import { LabRequest } from "@/types/LabTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  formatLabRecordDate,
  getLabRecordRemarks,
  getLabResultSummary,
  getPendingLabRecordsCount,
} from "@/utils/lab-records";

type Props = {
  emptyMessage?: string;
  error?: unknown;
  isLoading?: boolean;
  onViewResult: (record: LabRequest) => void;
  records: LabRequest[];
};

const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]";

const statusMap: Record<
  LabRequest["status"],
  {
    bg: string;
    dot: string;
    iconBg: string;
    iconColor: string;
    label: string;
    text: string;
  }
> = {
  done: {
    bg: "#e0f4f4",
    dot: "#0e7c7b",
    iconBg: "#e0f4f4",
    iconColor: "#0e7c7b",
    label: "Released",
    text: "#065050",
  },
  pending: {
    bg: "#fffbeb",
    dot: "#f59e0b",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    label: "Pending",
    text: "#92400e",
  },
  queued: {
    bg: "#eef1f9",
    dot: "#0f2244",
    iconBg: "#eef1f9",
    iconColor: "#0f2244",
    label: "Queued",
    text: "#1e3a6e",
  },
};

function StatusPill({ status }: { status: LabRequest["status"] }) {
  const meta = statusMap[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
      style={{ background: meta.bg, color: meta.text }}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  message,
  title,
}: {
  icon: LucideIcon;
  message: string;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "#f0f3fa" }}
      >
        <Icon size={24} style={{ color: "#c0ccd8" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>
        {title}
      </p>
      <p className="mt-1 text-[11px]" style={{ color: "#b0bcd4" }}>
        {message}
      </p>
    </div>
  );
}

export default function LabRecordsList({
  emptyMessage = "No laboratory records yet",
  error,
  isLoading = false,
  onViewResult,
  records,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "#f0f3fa" }}
        >
          <Hourglass size={24} style={{ color: "#c0ccd8" }} />
        </div>
        <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>
          Loading laboratory records
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "#b0bcd4" }}>
          Pulling the released and pending laboratory history for this patient.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load records"
        message={getApiErrorMessage(error, "The laboratory history is unavailable right now.")}
      />
    );
  }

  if (!records.length) {
    return (
      <EmptyState
        icon={TestTube2}
        title="No records found"
        message={emptyMessage}
      />
    );
  }

  const pendingCount = getPendingLabRecordsCount(records);

  return (
    <div className="space-y-3">
      {pendingCount > 0 ? (
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 py-3"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <Hourglass size={13} style={{ color: "#d97706" }} />
          <p className="text-[11.5px] font-medium" style={{ color: "#92400e" }}>
            {pendingCount} lab result(s) still pending release.
          </p>
        </div>
      ) : null}

      {records.map((record) => {
        const statusMeta = statusMap[record.status];
        const hasResultForm = Boolean(record.resultPayload);

        return (
          <div
            key={record.labId}
            className="flex items-start gap-4 rounded-2xl p-5"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: statusMeta.iconBg }}
            >
              <TestTube2 size={16} style={{ color: statusMeta.iconColor }} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: "#1a2a45" }}>
                    {record.testType}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: "#8a99b8" }}>
                    Requested by {record.requestedBy}{" "}
                    <span className="px-1 text-[#c0ccd8]">|</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={10} /> {formatLabRecordDate(record.requestedDate)}
                    </span>
                  </p>
                </div>
                <StatusPill status={record.status} />
              </div>

              {hasResultForm ? (
                <>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div
                      className="rounded-xl px-3 py-2.5"
                      style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}
                    >
                      <p className={`${labelCls} mb-0.5`}>Result</p>
                      <p className="text-[12px]" style={{ color: "#1a2a45" }}>
                        {getLabResultSummary(record.resultPayload)}
                      </p>
                    </div>
                    <div
                      className="rounded-xl px-3 py-2.5"
                      style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}
                    >
                      <p className={`${labelCls} mb-0.5`}>Remarks</p>
                      <p className="text-[12px]" style={{ color: "#6b7da0" }}>
                        {getLabRecordRemarks(record.resultPayload)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all"
                      style={{
                        background: "#eef1f9",
                        border: "1px solid #dce3ef",
                        color: "#0f2244",
                      }}
                      onClick={() => onViewResult(record)}
                    >
                      <Eye size={12} />
                      View Whole Result Form
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-[11.5px]" style={{ color: "#6b7da0" }}>
                  Awaiting the encoded laboratory result form for this request.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

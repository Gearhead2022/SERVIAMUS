"use client";

import { ShieldAlert, Trash2, UserRound, X } from "lucide-react";
import {
  usePatientDeletionRequests,
  useReviewPatientDeletionRequest,
} from "@/hooks/Patient/usePatientRegistration";
import SweetAlert from "@/utils/SweetAlert";

const statusClass: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function PatientDeletionRequestsPanel() {
  const { data: requests = [], isLoading, error } = usePatientDeletionRequests();
  const review = useReviewPatientDeletionRequest();
  const pending = requests.filter((request) => request.status === "PENDING");

  const handleReview = async (
    requestId: number,
    decision: "APPROVED" | "REJECTED",
    patientName: string
  ) => {
    const confirmed = await SweetAlert.confirmationAlert2(
      decision === "APPROVED" ? "Approve deletion?" : "Reject deletion?",
      decision === "APPROVED"
        ? `This permanently deletes ${patientName} and associated records. This cannot be undone.`
        : `${patientName}'s record will remain available.`
    );

    if (!confirmed) return;
    await review.mutateAsync({ requestId, decision });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><ShieldAlert size={19} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Administrative review</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Patient deletion requests</h2>
            <p className="mt-1 text-sm text-slate-500">Records with clinical history require explicit approval before removal.</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">{pending.length} pending</span>
      </div>

      {isLoading ? <p className="p-6 text-sm text-slate-500">Loading deletion requests…</p> : null}
      {error ? <p className="p-6 text-sm text-red-700">Unable to load deletion requests.</p> : null}
      {!isLoading && !error && requests.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">No patient deletion requests require review.</p>
      ) : null}

      <div className="divide-y divide-slate-100">
        {requests.map((request) => (
          <article key={request.deletion_request_id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="rounded-xl bg-slate-100 p-2 text-slate-600"><UserRound size={17} /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{request.patient_name}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusClass[request.status]}`}>{request.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {request.patient_code ?? "No patient code"} · Requested by {request.requester.name} · {formatDate(request.requested_at)}
                </p>
                {request.reviewer ? <p className="mt-1 text-xs text-slate-400">Reviewed by {request.reviewer.name}</p> : null}
              </div>
            </div>
            {request.status === "PENDING" ? (
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" disabled={review.isPending} onClick={() => void handleReview(request.deletion_request_id, "REJECTED", request.patient_name)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><X size={14} /> Keep patient</button>
                <button type="button" disabled={review.isPending} onClick={() => void handleReview(request.deletion_request_id, "APPROVED", request.patient_name)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"><Trash2 size={14} /> Approve deletion</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

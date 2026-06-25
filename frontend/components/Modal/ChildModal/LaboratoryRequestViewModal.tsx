"use client";

import {
    User, MapPin, Calendar, Hash, Printer,
    CheckCircle2, Hourglass, XCircle, Clock,
    FlaskConical, TestTube2, FileX, Stethoscope,
    CheckCheck,
} from "lucide-react";
import { RequestProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { openExternalLabRequestPrintPage } from "@/utils/lab-request-print";
import SweetAlert from "@/utils/SweetAlert";

// ── Types ──────────────────────────────────────────────────────────────────

type Props = {
    request: RequestProps;
    patient: PatientProps;
    onClose: () => void;
};

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    DONE: { label: "Completed", icon: CheckCircle2, color: "#166534", bg: "#dcfce7" },
    SERVING: { label: "In Progress", icon: Hourglass, color: "#065050", bg: "#e0f4f4" },
    WAITING: { label: "Waiting", icon: Clock, color: "#92400e", bg: "#fef9c3" },
    CANCELED: { label: "Cancelled", icon: XCircle, color: "#475569", bg: "#f1f5f9" },
};

// ── Category colors ────────────────────────────────────────────────────────

const CAT_COLOR: Record<string, { color: string; bg: string; border: string }> = {
    "clinical-chemistry": { color: "#7c4dab", bg: "#f3eefb", border: "#d8b4fe" },
    "clinical-microscopy": { color: "#0e7c7b", bg: "#e0f4f4", border: "#b0dede" },
    "serology": { color: "#c8102e", bg: "#fdf0f2", border: "#fca5a5" },
    "hematology": { color: "#0f2244", bg: "#eef1f9", border: "#bfcde8" },
    "other": { color: "#6b7da0", bg: "#f0f3fa", border: "#c8d3e8" },
};

const DEFAULT_CAT = { color: "#6b7da0", bg: "#f0f3fa", border: "#c8d3e8" };

// ── Helpers ────────────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] whitespace-nowrap"
                style={{ color: "#b0bcd4" }}>
                {label}
            </span>
            <span className="flex-1 h-px" style={{ background: "#f0f3fa" }} />
        </div>
    );
}

function MetaRow({
    icon: Icon, label, value,
}: {
    icon: React.ElementType; label: string; value?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid #f4f6fb" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "#f0f3fa" }}>
                <Icon size={13} style={{ color: "#8a99b8" }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] mb-0.5" style={{ color: "#b0bcd4" }}>
                    {label}
                </p>
                <p className="text-[13.5px] font-semibold" style={{ color: value ? "#0f2244" : "#c0ccd8" }}>
                    {value ?? "—"}
                </p>
            </div>
        </div>
    );
}

// ── Individual test item ───────────────────────────────────────────────────

function TestItem({ item }: { item: NonNullable<RequestProps["laboratory"]>["items"][number] }) {
    const catKey = item.test?.category?.toLowerCase().replace(/\s+/g, "-") ?? "other";
    const cat = CAT_COLOR[catKey] ?? DEFAULT_CAT;
    const isDone = item.status.toLowerCase() === "done";

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: `1.5px solid ${cat.border}`, background: "white" }}>

            {/* Accent bar */}
            <div className="h-1" style={{ background: cat.color, opacity: 0.5 }} />

            <div className="px-4 py-3.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: cat.bg }}>
                            <TestTube2 size={13} style={{ color: cat.color }} />
                        </div>
                        <div>
                            <p className="font-semibold text-[13px] leading-tight" style={{ color: "#0f2244" }}>
                                {item.test?.name ?? "Unknown Test"}
                            </p>
                            <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-wider"
                                style={{ color: cat.color }}>
                                {item.test?.category}
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{
                            background: isDone ? "#dcfce7" : "#fef9c3",
                            color: isDone ? "#166534" : "#92400e",
                        }}>
                        {isDone ? <CheckCheck size={10} /> : <Hourglass size={10} />}
                        {isDone ? "Done" : "Pending"}
                    </span>
                </div>

                {/* Result payload */}
                {/* {item.result_payload && Object.keys(item.result_payload).length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(item.result_payload).map(([key, val]) => (
                            <div key={key} className="rounded-xl px-3 py-2"
                                style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}>
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-0.5"
                                    style={{ color: "#b0bcd4" }}>
                                    {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-[13px] font-bold" style={{ color: "#0f2244" }}>
                                    {String(val)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-3 px-3 py-2.5 rounded-xl flex items-center gap-2"
                        style={{ background: isDone ? "#f8f9fc" : "#fffbeb", border: `1px solid ${isDone ? "#eef1f9" : "#fde68a"}` }}>
                        {isDone
                            ? <FileX size={12} style={{ color: "#b0bcd4" }} />
                            : <Hourglass size={12} style={{ color: "#d97706" }} />}
                        <p className="text-[11.5px]" style={{ color: isDone ? "#b0bcd4" : "#92400e" }}>
                            {isDone ? "No result data recorded." : "Result not yet available."}
                        </p>
                    </div>
                )} */}

                {/* Completed at */}
                {item.completed_at && (
                    <p className="text-[10px] mt-2.5 flex items-center gap-1" style={{ color: "#b0bcd4" }}>
                        <Clock size={9} />
                        Completed {new Date(item.completed_at).toLocaleDateString("en-PH", {
                            month: "short", day: "numeric", year: "numeric",
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

const ViewLaboratoryModal: React.FC<Props> = ({ request, patient, onClose }) => {
    const lab = request.laboratory;
    const items = lab?.items ?? [];

    const statusMeta = STATUS_MAP[request.status] ?? STATUS_MAP.WAITING;
    const StatusIcon = statusMeta.icon;

    const initials = patient.name
        ?.split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?";

    const allTests = items.map((i) => i.test?.name).filter(Boolean) as string[];

    const handlePrint = async () => {
        if (!allTests.length) {
            await SweetAlert.errorAlert("No Tests", "No tests available to print.");
            return;
        }
        openExternalLabRequestPrintPage(
            {
                patientCode: patient.patient_code ?? "",
                patientName: patient.name ?? "",
                age: String(patient.age ?? ""),
                sex: patient.sex ?? null,
                address: patient.address ?? "",
                requestDate: request.req_date ?? "",
                requestedBy: lab?.req_by ?? "",
                tests: allTests,
            },
            { autoPrint: true }
        );
    };

    const doneCount = items.filter((i) => i.status === "done").length;
    const pendingCount = items.length - doneCount;

    return (
        <div className="font-['DM_Sans'] bg-white">

            {/* ── Identity strip — matches your ViewConsultation style ── */}
            <div className="relative overflow-hidden px-6 py-5">
                <div className="relative z-10 flex items-center gap-4 text-black">

                    {/* Avatar */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{
                            background: "rgba(90,12,12,0.14)",
                            border: "1.5px solid rgba(21,7,75,0.22)",
                            color: "#0f2244",
                            fontFamily: "'DM Serif Display', serif",
                        }}
                    >
                        {initials}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[18px] font-bold text-black leading-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}>
                            {patient.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(2,0,0,0.5)" }}>
                            #{patient.patient_code} &nbsp;·&nbsp; {patient.age} yrs &nbsp;·&nbsp; {patient.sex}
                        </p>

                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {/* Request status */}
                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: statusMeta.bg, color: statusMeta.color }}>
                                <StatusIcon size={10} />
                                {statusMeta.label}
                            </span>

                            {/* Request ID */}
                            <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(49,146,190,0.11)", color: "rgba(3,0,0,0.75)" }}>
                                REQ-{String(request.req_id).padStart(5, "0")}
                            </span>

                            {/* Date */}
                            {request.req_date && (
                                <span className="text-[10.5px] inline-flex items-center gap-1 font-medium"
                                    style={{ color: "rgba(0,0,0,0.45)" }}>
                                    <Calendar size={9} />
                                    {new Date(request.req_date).toLocaleDateString("en-PH", {
                                        month: "short", day: "numeric", year: "numeric",
                                    })}
                                </span>
                            )}

                            {/* Progress chips */}
                            {doneCount > 0 && (
                                <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: "#dcfce7", color: "#166534" }}>
                                    {doneCount} done
                                </span>
                            )}
                            {pendingCount > 0 && (
                                <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: "#fef9c3", color: "#92400e" }}>
                                    {pendingCount} pending
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Requested by chip */}
                    {lab?.req_by && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(28,59,161,0.11)", border: "1px solid rgba(28,59,161,0.15)" }}>
                            <Stethoscope size={13} style={{ color: "rgba(15,1,1,0.55)" }} />
                            <div>
                                <p className="text-[8.5px] font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(0,0,0,0.4)" }}>
                                    Requested By
                                </p>
                                <p className="text-[12px] font-semibold text-black">{lab.req_by}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="px-6 pb-6 space-y-6">

                {/* Patient information */}
                <div>
                    <Divider label="Patient Information" />
                    <div className="mt-1 divide-y divide-[#f4f6fb]">
                        <div className="grid grid-cols-2">
                            <MetaRow icon={Hash} label="Patient Code" value={patient.patient_code} />
                            <MetaRow icon={Calendar} label="Request Date" value={
                                request.req_date
                                    ? new Date(request.req_date).toLocaleDateString("en-PH", {
                                        month: "long", day: "numeric", year: "numeric",
                                    })
                                    : undefined
                            } />
                        </div>
                        <MetaRow icon={MapPin} label="Address" value={patient.address} />
                        <div className="grid grid-cols-2">
                            <MetaRow icon={User} label="Age" value={`${patient.age} years old`} />
                            <MetaRow icon={FlaskConical} label="Requested By" value={lab?.req_by} />
                        </div>
                    </div>
                </div>

                {/* Tests */}
                <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <Divider label={`Test Results (${items.length})`} />
                    </div>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl"
                            style={{ background: "#f8f9fc", border: "1.5px dashed #dce3ef" }}>
                            <TestTube2 size={24} className="mb-2" style={{ color: "#c0ccd8" }} />
                            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No test items found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {items.map((item, i) => (
                                <TestItem key={item.item_id ?? i} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-2"
                    style={{ borderTop: "1px solid #eef1f9" }}>
                    <button
                        type="button"
                        onClick={() => void handlePrint()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors"
                        style={{ background: "#f3eefb", color: "#7c4dab", border: "1.5px solid #e0d4f5" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#ede4fa"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f3eefb"; }}
                    >
                        <Printer size={13} /> Print Lab Request
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors"
                        style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewLaboratoryModal;
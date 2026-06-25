"use client";

import {
    User, MapPin, Calendar, Hash, Printer,
    CheckCircle2, Hourglass, XCircle, Clock,
    FileCheck, ShieldCheck, AlertTriangle,
    Stethoscope, BadgeCheck,
} from "lucide-react";
import { RequestProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import SweetAlert from "@/utils/SweetAlert";

// ── Types ──────────────────────────────────────────────────────────────────

type Props = {
    request: RequestProps;
    patient: PatientProps;
    onClose: () => void;
    onPrint?: () => void;
};

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    DONE: { label: "Issued", icon: CheckCircle2, color: "#166534", bg: "#dcfce7" },
    SERVING: { label: "In Progress", icon: Hourglass, color: "#065050", bg: "#e0f4f4" },
    WAITING: { label: "Waiting", icon: Clock, color: "#92400e", bg: "#fef9c3" },
    CANCELED: { label: "Cancelled", icon: XCircle, color: "#475569", bg: "#f1f5f9" },
};

// ── Purpose config ─────────────────────────────────────────────────────────

const PURPOSE_META: Record<string, { color: string; bg: string; border: string }> = {
    "Fit To Work": { color: "#065050", bg: "#e0f4f4", border: "#b0dede" },
    "Medical Assistance": { color: "#a3852c", bg: "#fef9c3", border: "#fde68a" },
};

const DEFAULT_PURPOSE = { color: "#6b7da0", bg: "#f0f3fa", border: "#c8d3e8" };

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
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] mb-0.5"
                    style={{ color: "#b0bcd4" }}>
                    {label}
                </p>
                <p className="text-[13.5px] font-semibold" style={{ color: value ? "#0f2244" : "#c0ccd8" }}>
                    {value ?? "—"}
                </p>
            </div>
        </div>
    );
}

// ── Certificate detail card ────────────────────────────────────────────────

function CertDetailCard({
    purpose,
    resultDate,
    physicianName,
    isAlreadyClaimed,
    currentYear,
}: {
    purpose?: string | null;
    resultDate?: string | null;
    physicianName?: string | null;
    isAlreadyClaimed?: boolean;
    currentYear: number;
}) {
    const purposeMeta = PURPOSE_META[purpose ?? ""] ?? DEFAULT_PURPOSE;

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: `1.5px solid ${purposeMeta.border}`, background: "white" }}>

            {/* Accent bar */}
            <div className="h-1" style={{ background: purposeMeta.color, opacity: 0.5 }} />

            <div className="px-4 py-3.5 space-y-3">
                {/* Purpose header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: purposeMeta.bg }}>
                            <FileCheck size={15} style={{ color: purposeMeta.color }} />
                        </div>
                        <div>
                            <p className="font-bold text-[14px] leading-tight" style={{ color: "#0f2244" }}>
                                {purpose ?? "—"}
                            </p>
                            <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-wider"
                                style={{ color: purposeMeta.color }}>
                                Medical Certificate
                            </p>
                        </div>
                    </div>

                    {/* Duplicate claim warning badge */}
                    {isAlreadyClaimed && purpose === "Medical Assistance" && (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
                            <AlertTriangle size={10} /> Claimed {currentYear}
                        </span>
                    )}
                </div>

                {/* Detail chips row */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Result / issue date */}
                    <div className="rounded-xl px-3 py-2.5"
                        style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}>
                        <p className="text-[9px] font-bold uppercase tracking-[0.13em] mb-0.5"
                            style={{ color: "#b0bcd4" }}>
                            Issue Date
                        </p>
                        <p className="text-[12.5px] font-semibold" style={{ color: "#0f2244" }}>
                            {resultDate
                                ? new Date(resultDate).toLocaleDateString("en-PH", {
                                    month: "long", day: "numeric", year: "numeric",
                                })
                                : "—"
                            }
                        </p>
                    </div>

                    {/* Physician */}
                    <div className="rounded-xl px-3 py-2.5"
                        style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}>
                        <p className="text-[9px] font-bold uppercase tracking-[0.13em] mb-0.5"
                            style={{ color: "#b0bcd4" }}>
                            Issuing Physician
                        </p>
                        <p className="text-[12.5px] font-semibold flex items-center gap-1.5"
                            style={{ color: physicianName ? "#0f2244" : "#c0ccd8" }}>
                            {physicianName
                                ? <><BadgeCheck size={11} style={{ color: "#0e7c7b", flexShrink: 0 }} />{physicianName}</>
                                : "—"
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

const ViewCertificateModal: React.FC<Props> = ({ request, patient, onClose, onPrint }) => {

    const cert = request.cert;
    const currentYear = new Date().getFullYear();
    const isAlreadyClaimed = Number(patient.last_medical_assistance_year) === currentYear;
    const statusMeta = STATUS_MAP[request.status] ?? STATUS_MAP.WAITING;
    const StatusIcon = statusMeta.icon;

    const initials = patient.name
        ?.split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?";

    const handlePrint = async () => {
        if (!cert) {
            await SweetAlert.errorAlert("No Certificate", "No certificate data available to print.");
            return;
        }
        onPrint?.();
    };

    return (
        <div className="font-['DM_Sans'] bg-white">

            {/* ── Identity strip ── */}
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

                            {/* Request date */}
                            {request.req_date && (
                                <span className="text-[10.5px] inline-flex items-center gap-1 font-medium"
                                    style={{ color: "rgba(0,0,0,0.45)" }}>
                                    <Calendar size={9} />
                                    {new Date(request.req_date).toLocaleDateString("en-PH", {
                                        month: "short", day: "numeric", year: "numeric",
                                    })}
                                </span>
                            )}

                            {/* Purpose quick badge */}
                            {cert?.purpose && (
                                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{
                                        background: (PURPOSE_META[cert.purpose] ?? DEFAULT_PURPOSE).bg,
                                        color: (PURPOSE_META[cert.purpose] ?? DEFAULT_PURPOSE).color,
                                    }}>
                                    <ShieldCheck size={9} />
                                    {cert.purpose}
                                </span>
                            )}

                            {/* Duplicate claim warning chip */}
                            {isAlreadyClaimed && cert?.purpose === "Medical Assistance" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
                                    <AlertTriangle size={9} /> Claimed this year
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Physician chip */}
                    {cert?.doctor?.name && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(28,59,161,0.11)", border: "1px solid rgba(28,59,161,0.15)" }}>
                            <Stethoscope size={13} style={{ color: "rgba(15,1,1,0.55)" }} />
                            <div>
                                <p className="text-[8.5px] font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(0,0,0,0.4)" }}>
                                    Issuing Physician
                                </p>
                                <p className="text-[12px] font-semibold text-black">{cert.doctor.name}</p>
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
                            <MetaRow icon={ShieldCheck} label="Request Type" value={request.req_type} />
                        </div>
                    </div>
                </div>

                {/* Certificate details */}
                <div>
                    <div className="mb-3">
                        <Divider label="Certificate Details" />
                    </div>

                    {!cert ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl"
                            style={{ background: "#f8f9fc", border: "1.5px dashed #dce3ef" }}>
                            <FileCheck size={24} className="mb-2" style={{ color: "#c0ccd8" }} />
                            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No certificate data found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <CertDetailCard
                                purpose={cert.purpose}
                                resultDate={cert?.certificate?.result_date ?? ""}
                                physicianName={cert.doctor.name}
                                isAlreadyClaimed={isAlreadyClaimed}
                                currentYear={currentYear}
                            />

                            {/* Additional notes / findings if present */}
                            {cert?.certificate?.recommendation && (
                                <div className="rounded-2xl px-4 py-3.5"
                                    style={{ background: "#f8f9fc", border: "1.5px solid #eef1f9" }}>
                                    <p className="text-[9.5px] font-bold uppercase tracking-[0.15em] mb-2"
                                        style={{ color: "#b0bcd4" }}>
                                        Findings / Remarks
                                    </p>
                                    <p className="text-[13px]" style={{ color: "#4a5568" }}>
                                        {cert.certificate.recommendation}
                                    </p>
                                </div>
                            )}

                            {/* Duplicate year warning banner */}
                            {isAlreadyClaimed && cert.purpose === "Medical Assistance" && (
                                <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                                    style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}>
                                    <AlertTriangle size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }} />
                                    <div>
                                        <p className="text-[12.5px] font-semibold" style={{ color: "#92400e" }}>
                                            Medical Assistance Already Claimed
                                        </p>
                                        <p className="text-[11px] mt-0.5" style={{ color: "#a16207" }}>
                                            This patient has already received medical assistance in {currentYear}.
                                        </p>
                                    </div>
                                </div>
                            )}
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
                        <Printer size={13} /> Print Certificate
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

export default ViewCertificateModal;
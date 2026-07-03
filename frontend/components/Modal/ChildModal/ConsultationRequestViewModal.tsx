"use client";

import {
    Stethoscope, User, MapPin, Calendar, Hash,
    Activity, ClipboardList, UserCheck, Clock,
    CheckCircle2, Hourglass, XCircle, HeartPulse,
    Thermometer, Wind, Scale, Ruler, Gauge,
} from "lucide-react";
import { RequestProps, VitalSignProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { useGetDoctorById } from "@/hooks/Consultation/useConsultation";

// ── Types ──────────────────────────────────────────────────────────────────

type VitalKey = "bp" | "temp" | "cr" | "rr" | "wt" | "ht";

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; dot: string }> = {
    DONE: { label: "Completed", icon: CheckCircle2, color: "#166534", bg: "#dcfce7", dot: "#22c55e" },
    SERVING: { label: "In Progress", icon: Hourglass, color: "#065050", bg: "#e0f4f4", dot: "#0e7c7b" },
    WAITING: { label: "Waiting", icon: Clock, color: "#92400e", bg: "#fef9c3", dot: "#f59e0b" },
    CANCELED: { label: "Cancelled", icon: XCircle, color: "#475569", bg: "#f1f5f9", dot: "#94a3b8" },
};

// ── Vital sign meta ────────────────────────────────────────────────────────

const VITAL_META: { key: VitalKey; label: string; unit: string; icon: React.ElementType; color: string; bg: string }[] = [
    { key: "bp", label: "Blood Pressure", unit: "mmHg", icon: Gauge, color: "#c8102e", bg: "#fdf0f2" },
    { key: "temp", label: "Temperature", unit: "°C", icon: Thermometer, color: "#d97706", bg: "#fffbeb" },
    { key: "cr", label: "Pulse Rate", unit: "bpm", icon: HeartPulse, color: "#0e7c7b", bg: "#e0f4f4" },
    { key: "rr", label: "Resp. Rate", unit: "/min", icon: Wind, color: "#1d4ed8", bg: "#eff6ff" },
    { key: "wt", label: "Weight", unit: "kg", icon: Scale, color: "#7c4dab", bg: "#f3eefb" },
    { key: "ht", label: "Height", unit: "cm", icon: Ruler, color: "#0f2244", bg: "#eef1f9" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

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

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: React.ReactNode }) {
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

function VitalCard({
    meta,
    current,
    previous,
}: {
    meta: typeof VITAL_META[number];
    current?: string | number | null;
    previous?: string | number | null;
}) {
    const Icon = meta.icon;
    const hasCurrent = current !== undefined && current !== null && current !== "";
    const hasPrevious = previous !== undefined && previous !== null && previous !== "";

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #eef1f9" }}>
            {/* Color top bar */}
            <div className="h-1" style={{ background: meta.color, opacity: 0.5 }} />

            <div className="p-3">
                {/* Icon + label */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: meta.bg }}>
                        <Icon size={12} style={{ color: meta.color }} />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] leading-none"
                            style={{ color: meta.color }}>
                            {meta.label}
                        </p>
                        <p className="text-[8px] mt-0.5" style={{ color: "#b0bcd4" }}>{meta.unit}</p>
                    </div>
                </div>

                {/* Current (large) */}
                <p className="text-[22px] font-bold leading-none mb-1"
                    style={{ color: hasCurrent ? "#0f2244" : "#d4d8e2", fontFamily: "'DM Serif Display', serif" }}>
                    {hasCurrent ? String(current) : "—"}
                </p>

                {/* Previous (small) */}
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#b0bcd4" }}>prev</span>
                    <span className="text-[11px] font-semibold" style={{ color: hasPrevious ? "#8a99b8" : "#d4d8e2" }}>
                        {hasPrevious ? String(previous) : "—"}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

interface ViewConsultationModalProps {
    request: RequestProps;
    patient: PatientProps;
    vitals?: VitalSignProps;
    onClose?: () => void;
}

const ViewConsultationModal: React.FC<ViewConsultationModalProps> = ({
    request,
    patient,
    vitals,
    onClose
}) => {
    const consultation = request.consult?.consultation;
    const currentVitals = request.consult?.vitals;

    // console.log('patient', patient)

    const statusMeta = STATUS_MAP[request.status] ?? STATUS_MAP.WAITING;
    const StatusIcon = statusMeta.icon;

    const initials = patient.name
        ?.split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?";

    const doctorId = request.consult?.physician ?? 0;

    const { data: doctorInfo } = useGetDoctorById(doctorId);

    return (
        <div className="font-['DM_Sans'] bg-white">

            {/* ── Hero identity strip ── */}
            <div
                className="relative overflow-hidden px-6 py-5"
            // style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)" }}
            >
                {/* Decorative blobs */}


                <div className="relative z-10 flex items-center gap-4 text-black">
                    {/* Avatar */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-black flex-shrink-0"
                        style={{
                            background: "rgba(90, 12, 12, 0.14)",
                            border: "1.5px solid rgba(21, 7, 75, 0.22)",
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
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(2, 0, 0, 0.5)" }}>
                            #{patient.patient_code} &nbsp;·&nbsp; {patient.age} yrs &nbsp;·&nbsp; {patient.sex}
                        </p>

                        {/* Status + request id */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: statusMeta.bg, color: statusMeta.color }}>
                                <StatusIcon size={10} />
                                {statusMeta.label}
                            </span>
                            <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(49, 146, 190, 0.11)", color: "rgba(3, 0, 0, 0.75)" }}>
                                REQ-{String(request.req_id).padStart(5, "0")}
                            </span>
                            {request.req_date && (
                                <span className="text-[10.5px] inline-flex items-center gap-1 font-medium"
                                    style={{ color: "rgba(255,255,255,0.45)" }}>
                                    <Calendar size={9} />
                                    {new Date(request.req_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Physician chip */}
                    {request.consult?.physician && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(28, 59, 161, 0.11)", border: "1px solid rgba(255,255,255,0.16)" }}>
                            <Stethoscope size={13} style={{ color: "rgba(15, 1, 1, 0.55)" }} />
                            <div>
                                <p className="text-[8.5px] font-semibold uppercase tracking-wider" style={{ color: "rgba(0, 0, 0, 0.4)" }}>
                                    Physician
                                </p>
                                <p className="text-[12px] font-semibold text-black">
                                    Dr. {doctorInfo?.name}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 space-y-6">

                {/* ── Patient details ── */}
                <div>
                    <Divider label="Patient Information" />
                    <div className="mt-1 divide-y divide-[#f4f6fb]">
                        <div className="grid grid-cols-2">
                            <MetaRow icon={Hash} label="Patient Code" value={patient.patient_code} />
                            <MetaRow icon={Calendar} label="Request Date" value={
                                request.req_date
                                    ? new Date(request.req_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
                                    : undefined
                            } />
                        </div>
                        <MetaRow icon={MapPin} label="Address" value={patient.address} />
                        <div className="grid grid-cols-2">
                            <MetaRow icon={User} label="Age" value={`${patient.age} years old`} />
                            <MetaRow icon={Calendar} label="Consultation Date" value={
                                consultation?.consultation_date
                                    ? new Date(consultation.consultation_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
                                    : undefined
                            } />
                        </div>
                    </div>
                </div>

                {/* ── Clinical Findings ── */}
                {(consultation?.chief_complaint || consultation?.assessment) && (
                    <div>
                        <Divider label="Clinical Findings" />
                        <div className="mt-3 space-y-3">

                            {consultation?.chief_complaint && (
                                <div className="rounded-2xl px-5 py-4"
                                    style={{ background: "#f0f9f9", border: "1.5px solid #b0dede" }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ClipboardList size={13} style={{ color: "#0e7c7b" }} />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#0e7c7b" }}>
                                            Chief Complaint
                                        </p>
                                    </div>
                                    <p className="text-[14px] font-semibold leading-snug" style={{ color: "#0f2244" }}>
                                        {consultation.chief_complaint}
                                    </p>
                                </div>
                            )}

                            {consultation?.assessment && (
                                <div className="rounded-2xl px-5 py-4"
                                    style={{ background: "#f9f4fe", border: "1.5px solid #d8b4fe" }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity size={13} style={{ color: "#7c4dab" }} />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#7c4dab" }}>
                                            Assessment / Diagnosis
                                        </p>
                                    </div>
                                    <p className="text-[14px] leading-snug" style={{ color: "#4a5568" }}>
                                        {consultation.assessment}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Vital Signs ── */}
                <div>
                    <Divider label="Vital Signs" />
                    <div className="mt-3 grid grid-cols-3 gap-2.5 lg:grid-cols-6">
                        {VITAL_META.map((meta) => (
                            <VitalCard
                                key={meta.key}
                                meta={meta}
                                current={currentVitals?.[meta.key]}
                                previous={vitals?.[meta.key]}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: "#0f2244" }} />
                            <span className="text-[10.5px]" style={{ color: "#8a99b8" }}>Large number = current visit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase" style={{ color: "#b0bcd4" }}>prev</span>
                            <span className="text-[10.5px]" style={{ color: "#8a99b8" }}>= previous record</span>
                        </div>
                    </div>
                </div>

                {/* ── Physician + date ── */}
                <div>
                    <Divider label="Assignment" />
                    <div className="mt-1 divide-y divide-[#f4f6fb] grid grid-cols-2">
                        <MetaRow icon={UserCheck} label="Assigned Physician"
                            value={request.consult?.physician
                                ? `Dr. ${doctorInfo?.name}`
                                : undefined}
                        />
                        <MetaRow icon={Clock} label="Consultation Date"
                            value={consultation?.consultation_date
                                ? new Date(consultation.consultation_date).toLocaleDateString("en-PH", {
                                    month: "long", day: "numeric", year: "numeric",
                                })
                                : undefined}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2" style={{ borderTop: "1px solid #eef1f9" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors"
                        style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ViewConsultationModal;
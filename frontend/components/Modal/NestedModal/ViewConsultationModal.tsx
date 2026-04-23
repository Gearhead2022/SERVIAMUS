"use client";

import { useState } from "react";
import { ConsultationResultProps } from "@/types/ConsultationTypes";
import {
    User, Heart, FlaskConical, Baby, Activity,
    Cigarette, Wine, Dumbbell, Utensils, MapPin,
    Stethoscope, ClipboardList, Calendar, Phone,
    ChevronDown, CheckCircle2, XCircle, AlertCircle,
    FileText, Clock,
} from "lucide-react";
import { PatientProps } from "@/types/PatientTypes";

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]";

type SectionId =
    | "vitals"
    | "history"
    | "family"
    | "obgyne"
    | "social"
    | "clinical";

interface SectionConfig {
    id: SectionId;
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const SECTIONS: SectionConfig[] = [
    { id: "vitals", label: "Vital Signs", icon: Activity, color: "#0e7c7b", bg: "#e0f4f4" },
    { id: "history", label: "Medical History", icon: ClipboardList, color: "#0f2244", bg: "#eef1f9" },
    { id: "family", label: "Family History", icon: Heart, color: "#c8102e", bg: "#fdf0f2" },
    { id: "obgyne", label: "OB-Gyne History", icon: Baby, color: "#7c4dab", bg: "#f3eefb" },
    { id: "social", label: "Social History", icon: User, color: "#d97706", bg: "#fffbeb" },
    { id: "clinical", label: "Clinical Assessment", icon: Stethoscope, color: "#0e7c7b", bg: "#e0f4f4" },
];

function InfoChip({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col px-3 py-2.5 rounded-xl"
            style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
            <p className={`${labelCls} mb-0.5`}>{label}</p>
            <p className="text-[13px] font-semibold" style={{ color: value ? "#1a2a45" : "#c0ccd8" }}>
                {value || "—"}
            </p>
        </div>
    );
}

function BoolChip({ label, value }: { label: string; value?: boolean | null }) {
    if (value === undefined || value === null) return null;
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
                background: value ? "#f0fdf4" : "#f8f9fc",
                border: `1px solid ${value ? "#bbf7d0" : "#dce3ef"}`,
            }}>
            {value
                ? <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
                : <XCircle size={13} style={{ color: "#c0ccd8" }} />
            }
            <span className="text-[12px] font-medium"
                style={{ color: value ? "#166534" : "#8a99b8" }}>
                {label}
            </span>
        </div>
    );
}

function SectionBlock({
    config, children, defaultOpen = true,
}: {
    config: SectionConfig;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const { label, icon: Icon, color, bg } = config;

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>
            <button type="button" onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f8f9fc]"
                style={{ borderBottom: open ? "1px solid #f0f3fa" : "none" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}>
                    <Icon size={15} style={{ color }} />
                </div>
                <p className="flex-1 text-[13px] font-bold" style={{ color: "#0f2244" }}>{label}</p>
                <ChevronDown size={14}
                    className="flex-shrink-0 transition-transform"
                    style={{ color: "#b0bcd4", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {open && <div className="px-5 py-4">{children}</div>}
        </div>
    );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <p className={`${labelCls} mb-1.5`}>{label}</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#4a5568" }}>{value}</p>
        </div>
    );
}

function Divider() {
    return <div className="border-t border-[#f0f3fa] my-1" />;
}

interface ViewConsultationModalProps {
    patient: PatientProps | null;
    record: ConsultationResultProps | null;
    isLoading?: boolean;
}

const ViewConsultationModal: React.FC<ViewConsultationModalProps> = ({ patient, record, isLoading }) => {
    const initials = patient?.name
        ? patient?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const consultDate = record?.consultation_date
        ? new Date(record?.consultation_date).toLocaleDateString("en-PH", {
            month: "long", day: "numeric", year: "numeric",
        })
        : "—";

    const birthDate = record?.birth_date
        ? new Date(record?.birth_date).toLocaleDateString("en-PH", {
            month: "long", day: "numeric", year: "numeric",
        })
        : "—";

    const followUp = record?.follow_up_date
        ? new Date(record?.follow_up_date).toLocaleDateString("en-PH", {
            month: "long", day: "numeric", year: "numeric",
        })
        : null;

    if (isLoading) {
        return (
            <div className="p-6 space-y-3 font-['DM_Sans']">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl animate-pulse overflow-hidden"
                        style={{ border: "1.5px solid #dce3ef" }}>
                        <div className="h-14 bg-[#f4f6fb]" />
                        <div className="p-5 grid grid-cols-6 gap-2">
                            {[...Array(6)].map((_, j) => (
                                <div key={j} className="h-12 rounded-xl bg-[#f4f6fb]" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!record) {
        return (
            <div className="flex flex-col items-center justify-center py-20 font-['DM_Sans']">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#f0f3fa" }}>
                    <FileText size={24} style={{ color: "#c0ccd8" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No consultation data</p>
                <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>Record could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col font-['DM_Sans'] bg-white">

            {/* ── Patient + Consultation header band ── */}
            <div className="flex-shrink-0 flex items-center justify-between gap-5 px-6 py-5 flex-wrap"
                style={{ background: "#f7f8fc", borderBottom: "1.5px solid #dce3ef" }}>

                {/* Patient info */}
                <div className="flex items-center gap-4">
                    <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)", boxShadow: "0 4px 14px rgba(15,34,68,0.2)" }}>
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-black text-xl leading-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}>
                            {patient?.name}
                        </h2>
                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                style={{ background: "#eef1f9", color: "#0f2244" }}>
                                #{String(record?.consultation_id).padStart(5, "0")}
                            </span>
                            <span className="text-[11px]" style={{ color: "#6b7da0" }}>{record?.age} yrs</span>
                            <span className="text-[11px]" style={{ color: "#6b7da0" }}>{record?.sex}</span>
                            {record?.contact_number && (
                                <span className="flex items-center gap-1 text-[11px]" style={{ color: "#6b7da0" }}>
                                    <Phone size={10} />{record?.contact_number}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Consultation meta chips */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "#eef1f9", border: "1px solid #dce3ef" }}>
                        <Calendar size={13} style={{ color: "#0f2244" }} />
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>Date</p>
                            <p className="text-[12px] font-semibold" style={{ color: "#0f2244" }}>{consultDate}</p>
                        </div>
                    </div>
                    {followUp && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <Clock size={13} style={{ color: "#d97706" }} />
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#d97706" }}>Follow-up</p>
                                <p className="text-[12px] font-semibold" style={{ color: "#92400e" }}>{followUp}</p>
                            </div>
                        </div>
                    )}
                    <span className="flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1.5 rounded-full"
                        style={{ background: "#f0fdf4", color: "#166534" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        Completed
                    </span>
                </div>
            </div>

            {/* ── Chief complaint + quick info strip ── */}
            <div className="flex-shrink-0 px-6 py-4 flex items-center gap-4 flex-wrap"
                style={{ background: "white", borderBottom: "1px solid #f0f3fa" }}>
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#c8102e" }} />
                    <div>
                        <p className={`${labelCls} mb-0.5`}>Chief Complaint</p>
                        <p className="text-[14px] font-semibold" style={{ color: "#1a2a45" }}>{record?.chief_complaint}</p>
                    </div>
                </div>
                <Divider />
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#6b7da0" }}>
                    <MapPin size={11} />
                    <span>{record?.address || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#6b7da0" }}>
                    <Calendar size={11} />
                    <span>Born {birthDate}</span>
                </div>
                {record?.religion && (
                    <span className="text-[11px]" style={{ color: "#6b7da0" }}>{record?.religion}</span>
                )}
            </div>

            {/* ── Scrollable sections ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
                style={{ background: "#f8f9fc" }}>

                {/* VITAL SIGNS */}
                <SectionBlock config={SECTIONS[0]} defaultOpen>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <InfoChip label="BP (mmHg)" value={record?.bp} />
                        <InfoChip label="Temp (°C)" value={record?.temp} />
                        <InfoChip label="CR (bpm)" value={record?.cr} />
                        <InfoChip label="RR (/min)" value={record?.rr} />
                        <InfoChip label="Weight (kg)" value={record?.wt} />
                        <InfoChip label="Height (cm)" value={record?.ht} />
                    </div>
                    {record?.hist_illness && (
                        <div className="mt-4">
                            <TextBlock label="History of Present Illness" value={record?.hist_illness} />
                        </div>
                    )}
                </SectionBlock>

                {/* PAST MEDICAL HISTORY */}
                <SectionBlock config={SECTIONS[1]}>
                    <div className="flex flex-wrap gap-2">
                        <BoolChip label="Food & Drug Allergy (FDA)" value={record?.pmh_allergy} />
                        <BoolChip label="Previous Admission" value={record?.pmh_admission} />
                        <BoolChip label="Others" value={record?.pmh_others} />
                    </div>
                    {record?.pmh_others && record?.pmh_others_text && (
                        <div className="mt-3">
                            <TextBlock label="Other Medical History" value={record?.pmh_others_text} />
                        </div>
                    )}
                </SectionBlock>

                {/* FAMILY HISTORY */}
                <SectionBlock config={SECTIONS[2]}>
                    <div className="flex flex-wrap gap-2">
                        <BoolChip label="Hypertension" value={record?.fh_htn} />
                        <BoolChip label="Diabetes Mellitus" value={record?.fh_dm} />
                        <BoolChip label="Bronchial Asthma" value={record?.fh_ba} />
                        <BoolChip label="Cancer" value={record?.fh_cancer} />
                        <BoolChip label="Others" value={record?.fh_others} />
                    </div>
                    {record?.fh_others && record?.fh_others_text && (
                        <div className="mt-3">
                            <TextBlock label="Other Family History" value={record?.fh_others_text} />
                        </div>
                    )}
                </SectionBlock>

                {/* OB-GYNE HISTORY */}
                <SectionBlock config={SECTIONS[3]}>
                    <div className="space-y-4">
                        {/* OB Score + delivery */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {record?.ob_score && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                    style={{ background: "#f3eefb", border: "1px solid #e0d4f5" }}>
                                    <Baby size={13} style={{ color: "#7c4dab" }} />
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#7c4dab" }}>G P Score</p>
                                        <p className="text-[13px] font-bold" style={{ color: "#4a1d96" }}>{record?.ob_score}</p>
                                    </div>
                                </div>
                            )}
                            <BoolChip label="NVSD" value={record?.ob_nvsd} />
                            <BoolChip label="CS" value={record?.ob_cs} />
                        </div>

                        {/* Menstrual */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <InfoChip label="Menarche" value={record?.menarche} />
                            <InfoChip label="Interval" value={record?.interval} />
                            <InfoChip label="Duration" value={record?.duration} />
                            <InfoChip label="Amount" value={record?.amount} />
                        </div>
                        {record?.ob_symptoms && (
                            <TextBlock label="OB Symptoms" value={record?.ob_symptoms} />
                        )}
                    </div>
                </SectionBlock>

                {/* SOCIAL HISTORY */}
                <SectionBlock config={SECTIONS[4]}>
                    <div className="space-y-4">
                        {/* Lifestyle habits */}
                        <div>
                            <p className={`${labelCls} mb-2`}>Lifestyle & Habits</p>
                            <div className="flex flex-wrap gap-2">
                                <BoolChip label="Cigarette Use" value={record?.cigarette_use} />
                                <BoolChip label="Alcohol Use" value={record?.alcohol_use} />
                                <BoolChip label="Drug Use" value={record?.drug_use} />
                                <BoolChip label="Exercise" value={record?.exercise} />
                                <BoolChip label="Hygiene Practice" value={record?.hygiene_prac} />
                                <BoolChip label="Coffee" value={record?.coffee_cons} />
                                <BoolChip label="Soda" value={record?.soda_cons} />
                            </div>
                        </div>

                        {/* Social flags */}
                        <div>
                            <p className={`${labelCls} mb-2`}>Social Medical History</p>
                            <div className="flex flex-wrap gap-2">
                                <BoolChip label="Allergy (Social)" value={record?.sh_allergy} />
                                <BoolChip label="Admission" value={record?.sh_admission} />
                            </div>
                        </div>

                        {/* Info fields */}
                        <div className="grid grid-cols-2 gap-3">
                            <InfoChip label="Occupation" value={record?.occupation} />
                            <InfoChip label="Diet" value={record?.diet} />
                            <InfoChip label="Travel History" value={record?.travel_history} />
                            <InfoChip label="Stress / Coping" value={record?.stress} />
                        </div>
                    </div>
                </SectionBlock>

                {/* CLINICAL ASSESSMENT */}
                <SectionBlock config={SECTIONS[5]}>
                    <div className="space-y-4">
                        {record?.examination && (
                            <div className="rounded-xl px-4 py-3.5"
                                style={{ background: "#f0f9f9", border: "1px solid #b0dede" }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#0e7c7b" }}>
                                    Physical Examination Findings
                                </p>
                                <p className="text-[13px] leading-relaxed" style={{ color: "#1a2a45" }}>{record?.examination}</p>
                            </div>
                        )}
                        {record?.assessment && (
                            <div className="rounded-xl px-4 py-3.5"
                                style={{ background: "#eef1f9", border: "1px solid #c5d2e8" }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#0f2244" }}>
                                    Assessment / Diagnosis
                                </p>
                                <p className="text-[13px] leading-relaxed" style={{ color: "#1a2a45" }}>{record?.assessment}</p>
                            </div>
                        )}
                        {record?.plans && (
                            <div className="rounded-xl px-4 py-3.5"
                                style={{ background: "#f3eefb", border: "1px solid #d8c7f0" }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#7c4dab" }}>
                                    Management Plans
                                </p>
                                <p className="text-[13px] leading-relaxed" style={{ color: "#1a2a45" }}>{record?.plans}</p>
                            </div>
                        )}
                        {followUp && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                                <Clock size={13} style={{ color: "#d97706" }} />
                                <p className="text-[12.5px] font-medium" style={{ color: "#92400e" }}>
                                    Follow-up scheduled: <strong>{followUp}</strong>
                                </p>
                            </div>
                        )}
                        {!record?.examination && !record?.assessment && !record?.plans && (
                            <p className="text-[12.5px] text-center py-4" style={{ color: "#b0bcd4" }}>
                                No clinical assessment recorded.
                            </p>
                        )}
                    </div>
                </SectionBlock>
            </div>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-3"
                style={{ borderTop: "1px solid #eef1f9", background: "#f7f8fc" }}>
                <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                    Consultation #{String(record?.consultation_id).padStart(5, "0")}
                </p>
                <p className="text-[11px] italic" style={{ color: "#b0bcd4" }}>
                    For authorized medical personnel only
                </p>
            </div>
        </div>
    );
};

export default ViewConsultationModal;
"use client";

import { useState } from "react";
import { PatientProps } from "@/types/PatientTypes";
import {
    Stethoscope, TestTube2, FileCheck, ChevronRight,
    Calendar, Activity,
    FileText,
    TrendingUp, Eye,
    PrinterIcon,
    Hourglass,
    FlaskConical,
    CheckCircle2,
    Clock,
    Zap,
    BadgeDollarSign,
    ReceiptText,
    AlertTriangle,
} from "lucide-react";
import { useAllConsultationRecords } from "@/hooks/Consultation/useConsultation";
import { useAllMedCertRecords } from "@/hooks/Consultation/useConsultation";
import { useDebounce } from "use-debounce";
import { ConsultationHistoryRecordsProps, MedicalCertificateProps } from "@/types/ConsultationTypes";
import { mapConsultationRecordToForm } from "@/utils/consultation/mapConsultationRecord";
import { MedCertFormValues, PrescriptionValues, RegisterConsultationFormValues } from "@/schemas/consultation.schema";
import { mapMedCertRecordToForm } from "@/utils/consultation/mapMedCertRecord";
import { mapPrescriptionRecordToForm } from "@/utils/consultation/mapRxRecord";
import { LabRecordGroup, LabRequest, LabResultPayload } from "@/types/LabTypes";
import { usePatientLabRecords } from "@/hooks/Lab/useLab";

const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]";

type TabId = "consultations" | "laboratory" | "certificates";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "consultations", label: "Consultations", icon: Stethoscope },
    { id: "laboratory", label: "Laboratory", icon: TestTube2 },
    { id: "certificates", label: "Certificates", icon: FileCheck },
];

// ── Status / badge helpers ────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
        completed: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", label: "Completed" },
        cancelled: { bg: "#fdf2f2", text: "#991b1b", dot: "#ef4444", label: "Cancelled" },
        pending: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", label: "Pending" },
        queued: { bg: "#f0f3fa", text: "#0f2244", dot: "#6b7da0", label: "Queued" },
        done: { bg: "#e0f4f4", text: "#065050", dot: "#0e7c7b", label: "Done" },
        released: { bg: "#e0f4f4", text: "#065050", dot: "#0e7c7b", label: "Released" },
        issued: { bg: "#eef1f9", text: "#1e3a6e", dot: "#0f2244", label: "Issued" },
    };
    const m = map[status] ?? { bg: "#f4f6fb", text: "#6b7da0", dot: "#b0bcd4", label: status };
    return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.text }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
            {m.label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: "Routine" | "Urgent" }) {
    const isUrgent = priority === "Urgent";
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
                background: isUrgent ? "#fef2f2" : "#f0f3fa",
                color: isUrgent ? "#b91c1c" : "#6b7da0",
                border: `1px solid ${isUrgent ? "#fecaca" : "#dce3ef"}`,
            }}>
            {isUrgent ? <Zap size={9} /> : <Clock size={9} />}
            {priority}
        </span>
    );
}

function BillingBadge({ isPaid }: { isPaid: boolean; billingStatus: string }) {
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
                background: isPaid ? "#f0fdf4" : "#fffbeb",
                color: isPaid ? "#166534" : "#92400e",
                border: `1px solid ${isPaid ? "#bbf7d0" : "#fde68a"}`,
            }}>
            <BadgeDollarSign size={9} />
            {isPaid ? "Paid" : "Unpaid"}
        </span>
    );
}

function VitalChip({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="flex flex-col items-center px-3 py-2 rounded-xl"
            style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
            <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>{label}</p>
            <p className="text-[13px] font-bold mt-0.5" style={{ color: "#0f2244" }}>{value}</p>
            <p className="text-[9px]" style={{ color: "#b0bcd4" }}>{unit}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#f0f3fa" }}>
                <Icon size={24} style={{ color: "#c0ccd8" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No records found</p>
            <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>{message}</p>
        </div>
    );
}

// ── Consultation card ─────────────────────────────────────────────────────────

function ConsultationCard({
    records,
    onSelectPrescription,
    onSelectConsultation,
}: {
    records: ConsultationHistoryRecordsProps;
    onSelectPrescription: () => void;
    onSelectConsultation: () => void;
}) {
    const [open, setOpen] = useState(false);
    const c = records.consultation;

    return (
        <div className="rounded-2xl overflow-hidden transition-all"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>
            <div className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f8f9fc]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#eef1f9" }}>
                    <Stethoscope size={16} style={{ color: "#0f2244" }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{c.chief_complaint}</p>
                        <StatusPill status="completed" />
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "#8a99b8" }}>
                        {c.assessment} &nbsp;·&nbsp;
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={10} /> {new Date(c.consultation_date).toISOString().split("T")[0]}
                        </span>
                    </p>
                </div>

                {records.prescription ? (
                    <button type="button"
                        className="flex justify-end items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0"
                        style={{ background: "#f8f8df", color: "#0f2244", border: "1px solid #dce3ef" }}
                        onClick={onSelectPrescription}>
                        <PrinterIcon size={12} /> View Prescription
                    </button>
                ) : null}

                <button type="button"
                    className="flex justify-end items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0"
                    style={{ background: "#dfe6f8", color: "#0f2244", border: "1px solid #dce3ef" }}
                    onClick={onSelectConsultation}>
                    <PrinterIcon size={12} /> Print Preview
                </button>

                <ChevronRight size={15}
                    className="flex-shrink-0 transition-transform cursor-pointer"
                    style={{ color: "#b0bcd4", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
                    onClick={() => setOpen((v) => !v)} />
            </div>

            {open && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "#f0f3fa" }}>
                    <div className="mt-4 mb-4">
                        <p className={`${labelCls} mb-2`}>Vital Signs</p>
                        <div className="grid grid-cols-6 gap-2">
                            <VitalChip label="BP" value={c.bp ?? "—"} unit="mmHg" />
                            <VitalChip label="Temp" value={c.temp ?? "—"} unit="°C" />
                            <VitalChip label="CR" value={c.cr ?? "—"} unit="bpm" />
                            <VitalChip label="RR" value={c.rr ?? "—"} unit="/min" />
                            <VitalChip label="Wt" value={c.wt ?? "—"} unit="kg" />
                            <VitalChip label="Ht" value={c.ht ?? "—"} unit="cm" />
                        </div>
                    </div>
                    {c.assessment && (
                        <div className="mb-4 rounded-xl px-4 py-3"
                            style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}>
                            <p className={`${labelCls} mb-1`}>Doctor&apos;s Notes</p>
                            <p className="text-[13px]" style={{ color: "#4a5568" }}>{c.assessment}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Lab card ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
    "clinical-chemistry": { label: "Clinical Chemistry", color: "#7c4dab", bg: "#f3eefb" },
    "hematology": { label: "Hematology", color: "#0f2244", bg: "#eef1f9" },
    "parasitology": { label: "Parasitology", color: "#225e08", bg: "#ddf0d5" },
    "urinalysis": { label: "Urinalysis", color: "#0e7c7b", bg: "#e0f4f4" },
    "other": { label: "Other", color: "#6b7da0", bg: "#f0f3fa" },
};

function ResultPayloadTable({ payload }: { payload: LabResultPayload }) {
    const entries = Object.entries(payload).filter(([, v]) => v !== null && v !== undefined && v !== "");
    if (entries.length === 0) return null;
    return (
        <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid #dce3ef" }}>
            <div className="px-3 py-2" style={{ background: "#f4f6fb", borderBottom: "1px solid #dce3ef" }}>
                <p className={labelCls}>Test Results</p>
            </div>
            <div className="divide-y" >
                {entries.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-3 py-2 bg-white">
                        <span className="text-[11.5px] font-medium capitalize"
                            style={{ color: "#6b7da0" }}>
                            {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-[12px] font-bold" style={{ color: "#0f2244" }}>
                            {String(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LabCard({ lab, onView }: { lab: LabRequest; onView?: (lab: LabRequest) => void }) {
    const [open, setOpen] = useState(false);

    const catMeta = CATEGORY_META[lab.category] ?? CATEGORY_META["other"];
    const isDone = lab.status === "done";
    const isUrgent = lab.priority === "Urgent";
    const progressPct = lab.totalTests > 0
        ? Math.round((lab.completedCount / lab.totalTests) * 100)
        : 0;

    return (
        <div className="rounded-2xl overflow-hidden transition-all"
            style={{ border: `1.5px solid ${isDone ? "#b0dede" : "#dce3ef"}`, background: "white" }}>

            {/* ── Summary row ── */}
            <div className="flex items-start gap-4 px-5 py-4">

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: catMeta.bg }}>
                    <FlaskConical size={16} style={{ color: catMeta.color }} />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    {/* Top row: test type + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[13.5px]" style={{ color: "#1a2a45" }}>
                            {lab.testType}
                        </p>
                        <StatusPill status={lab.status} />
                        <PriorityBadge priority={lab.priority} />
                        <BillingBadge isPaid={lab.isPaid} billingStatus={lab.billingStatus} />
                    </div>

                    {/* Sub-row: category chip + meta */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: catMeta.bg, color: catMeta.color }}>
                            {catMeta.label}
                        </span>
                        <span className="text-[11px]" style={{ color: "#8a99b8" }}>
                            Requested by {lab.requestedBy}
                        </span>
                        <span className="text-[11px] inline-flex items-center gap-1" style={{ color: "#8a99b8" }}>
                            <Calendar size={10} /> {lab.requestedDate}
                        </span>
                        {lab.billingCode && (
                            <span className="text-[11px] inline-flex items-center gap-1" style={{ color: "#8a99b8" }}>
                                <ReceiptText size={10} /> {lab.billingCode}
                            </span>
                        )}
                    </div>

                    {/* Progress bar (only if not done) */}
                    {!isDone && lab.totalTests > 0 && (
                        <div className="mt-2.5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold" style={{ color: "#8a99b8" }}>
                                    {lab.completedCount}/{lab.totalTests} tests completed
                                </span>
                                <span className="text-[10px] font-bold" style={{ color: "#0f2244" }}>
                                    {progressPct}%
                                </span>
                            </div>
                            <div className="w-full rounded-full h-1.5" style={{ background: "#eef1f9" }}>
                                <div className="h-1.5 rounded-full transition-all"
                                    style={{
                                        width: `${progressPct}%`,
                                        background: progressPct === 100
                                            ? "linear-gradient(90deg, #0e7c7b, #22c55e)"
                                            : "linear-gradient(90deg, #0f2244, #0e7c7b)",
                                    }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {onView && (
                        <button type="button"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all"
                            style={{ background: "#f0f3fa", color: "#0f2244", border: "1px solid #dce3ef" }}
                            onClick={() => onView(lab)}>
                            <Eye size={12} /> View
                        </button>
                    )}
                    <button type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: open ? "#eef1f9" : "#f8f9fc", border: "1px solid #dce3ef" }}>
                        <ChevronRight size={14}
                            style={{ color: "#6b7da0", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
                    </button>
                </div>
            </div>

            {/* ── Expanded detail ── */}
            {open && (
                <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "#f0f3fa" }}>

                    {/* Tests grid */}
                    {lab.tests.length > 0 && (
                        <div className="mt-4">
                            <p className={`${labelCls} mb-2`}>Requested Tests</p>
                            <div className="flex flex-wrap gap-2">
                                {lab.tests.map((t) => {
                                    const done = lab.completedTests.includes(t);
                                    return (
                                        <span key={t}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                                            style={{
                                                background: done ? "#e0f4f4" : "#f4f6fb",
                                                color: done ? "#065050" : "#6b7da0",
                                                border: `1px solid ${done ? "#b0dede" : "#dce3ef"}`,
                                            }}>
                                            {done
                                                ? <CheckCircle2 size={10} style={{ color: "#0e7c7b" }} />
                                                : <Hourglass size={10} style={{ color: "#d97706" }} />}
                                            {t}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pending tests warning */}
                    {lab.pendingTests.length > 0 && (
                        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
                            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                            <div>
                                <p className="text-[11px] font-semibold" style={{ color: "#92400e" }}>
                                    {lab.pendingTests.length} test(s) still pending
                                </p>
                                <p className="text-[10.5px] mt-0.5" style={{ color: "#b45309" }}>
                                    {lab.pendingTests.join(", ")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Billing summary */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: "Record Group", value: lab.recordGroup.replace(/-/g, " ") },
                            { label: "Billing Total", value: `₱${lab.billingTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
                            { label: "Paid At", value: lab.paidAt ? new Date(lab.paidAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl px-3 py-2.5"
                                style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
                                <p className={`${labelCls} mb-0.5`}>{label}</p>
                                <p className="text-[12.5px] font-semibold capitalize" style={{ color: "#1a2a45" }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Result payload */}
                    {lab.resultPayload && Object.keys(lab.resultPayload).length > 0 && (
                        <ResultPayloadTable payload={lab.resultPayload} />
                    )}

                    {/* No results yet */}
                    {isDone && (!lab.resultPayload || Object.keys(lab.resultPayload).length === 0) && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                            style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
                            <Activity size={13} style={{ color: "#8a99b8" }} />
                            <p className="text-[11.5px]" style={{ color: "#6b7da0" }}>
                                Results recorded but no payload data available.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Certificate card ──────────────────────────────────────────────────────────

function CertCard({ cert, onSelectMedCert }: { cert: MedicalCertificateProps; onSelectMedCert: () => void }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <p className="font-semibold text-[13.5px]" style={{ color: "#1a2a45" }}>{cert.purpose}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8a99b8" }}>
                            <span className="inline-flex items-center gap-1">
                                <Calendar size={10} /> {cert.result_date}
                            </span>
                        </p>
                    </div>
                </div>
                <p className="text-[11.5px] mt-2 flex items-center gap-1.5" style={{ color: "#6b7da0" }}>
                    <FileText size={11} className="flex-shrink-0" />
                    Purpose: {cert.purpose}
                </p>
            </div>
            {cert.result_date && (
                <button type="button"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0"
                    style={{ background: "#f0f3fa", color: "#0f2244", border: "1px solid #dce3ef" }}
                    onClick={(e) => { e.stopPropagation(); onSelectMedCert(); }}>
                    <Eye size={12} /> View
                </button>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

const ViewPatientHistoryModal: React.FC<{
    patient: PatientProps | null;
    onViewPrescription?: (requestId: number, form: PrescriptionValues, doctorId: number) => void;
    onViewConsultation?: (requestId: number, form: RegisterConsultationFormValues, doctorId: number) => void;
    onViewMedicalCertificate?: (requestId: number, form: MedCertFormValues, doctorId: number) => void;
    onViewLaboratoryTest?: (record: LabRequest) => void;
}> = ({ patient, onViewPrescription, onViewConsultation, onViewMedicalCertificate, onViewLaboratoryTest }) => {

    const [search, setSearch] = useState<string>("");
    const [debouncedSearch] = useDebounce(search, 500);

    const { data: consultationList } = useAllConsultationRecords({
        patient_id: patient?.patient_id ?? 0,
        search: debouncedSearch,
    });

    // console.log('dipoeta', consultationList)

    const { data: medCertList } = useAllMedCertRecords({
        patient_id: patient?.patient_id ?? 0,
        search: debouncedSearch,
    });

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [recordGroup, setRecordGroup] = useState<LabRecordGroup | "all">("all");

    const { data: labRecords = [] } = usePatientLabRecords(
        patient?.patient_id,
        { dateFrom, dateTo, recordGroup }
    );

    const [activeTab, setActiveTab] = useState<TabId>("consultations");

    const initials = patient?.name
        ? patient.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const counts = {
        consultations: consultationList?.length ?? 0,
        laboratory: labRecords.length,
        certificates: medCertList?.length ?? 0,
    };

    const urgentLabs = labRecords.filter((l: LabRequest) => l.status !== "done" && l.priority === "Urgent");
    const pendingLabs = labRecords.filter((l: LabRequest) => l.status === "pending" || l.status === "queued");

    return (
        <div className="font-['DM_Sans'] bg-white flex flex-col" style={{ minHeight: "560px", maxHeight: "80vh" }}>

            {/* ── Patient info band ── */}
            <div className="flex-shrink-0 px-6 py-5 flex items-center gap-5"
                style={{ background: "#f7f8fc", borderBottom: "1.5px solid #dce3ef" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)", boxShadow: "0 4px 14px rgba(15,34,68,0.2)" }}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-['DM_Serif_Display'] text-[#0f2244] text-xl leading-tight">
                        {patient?.name ?? "Patient"}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {patient?.patient_code && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                style={{ background: "#eef1f9", color: "#0f2244" }}>
                                {patient.patient_code}
                            </span>
                        )}
                        {patient?.age && <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.age} yrs</span>}
                        {patient?.sex && <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.sex}</span>}
                        {patient?.contact_number && <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.contact_number}</span>}
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    {[
                        { icon: Stethoscope, count: counts.consultations, label: "Consults", color: "#0f2244", bg: "#eef1f9" },
                        { icon: TestTube2, count: counts.laboratory, label: "Lab Tests", color: "#0e7c7b", bg: "#e0f4f4" },
                        { icon: FileCheck, count: counts.certificates, label: "Certificates", color: "#7c4dab", bg: "#f3eefb" },
                    ].map(({ icon: Icon, count, label, color, bg }) => (
                        <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: bg }}>
                            <Icon size={13} style={{ color }} />
                            <div>
                                <p className="text-[14px] font-bold leading-none" style={{ color }}>{count}</p>
                                <p className="text-[9px] font-medium" style={{ color, opacity: 0.7 }}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="flex-shrink-0 flex items-center gap-1 px-6 py-3"
                style={{ borderBottom: "1px solid #eef1f9" }}>
                {TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <button key={id} type="button" onClick={() => setActiveTab(id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                            style={isActive
                                ? { background: "#0f2244", color: "white" }
                                : { background: "transparent", color: "#6b7da0" }}>
                            <Icon size={13} />
                            {label}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={isActive
                                    ? { background: "rgba(255,255,255,0.2)", color: "white" }
                                    : { background: "#eef1f9", color: "#0f2244" }}>
                                {counts[id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: "#f8f9fc" }}>

                {/* CONSULTATIONS */}
                {activeTab === "consultations" && onViewConsultation && onViewPrescription && (
                    <div className="space-y-3">
                        {!consultationList || consultationList.length === 0
                            ? <EmptyState icon={Stethoscope} message="No consultation records yet" />
                            : consultationList.map((c) => (
                                <ConsultationCard
                                    key={c.consultation.consultation_id}
                                    records={c}
                                    onSelectPrescription={() => {
                                        const prescription = c.prescription;
                                        if (!prescription) return;
                                        onViewPrescription(
                                            c.consultationRequest.request.req_id,
                                            mapPrescriptionRecordToForm(prescription, patient ?? undefined),
                                            c.consultationRequest.physician,
                                        );
                                    }}
                                    onSelectConsultation={() =>
                                        onViewConsultation(
                                            c.consultationRequest.request.req_id,
                                            mapConsultationRecordToForm(c.consultation, patient ?? undefined, c.consultationRequest.cons_id),
                                            c.consultationRequest.physician,
                                        )
                                    }
                                />
                            ))
                        }
                    </div>
                )}

                {/* LABORATORY */}
                {activeTab === "laboratory" && (
                    <div className="space-y-3">

                        {/* Urgent alert banner */}
                        {urgentLabs.length > 0 && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                                <Zap size={13} style={{ color: "#b91c1c" }} />
                                <p className="text-[11.5px] font-semibold" style={{ color: "#991b1b" }}>
                                    {urgentLabs.length} urgent lab request(s) awaiting completion.
                                </p>
                            </div>
                        )}

                        {/* Pending banner */}
                        {pendingLabs.length > 0 && urgentLabs.length === 0 && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                                <Hourglass size={13} style={{ color: "#d97706" }} />
                                <p className="text-[11.5px] font-medium" style={{ color: "#92400e" }}>
                                    {pendingLabs.length} lab result(s) still pending release.
                                </p>
                            </div>
                        )}

                        {/* Filter row */}
                        {/* {labRecords.length > 0 && ( */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {(["all", "hematology", "clinical-chemistry", "clinical-microscopy", "serology", "other"] as const).map((g) => (
                                <button key={g} type="button"
                                    onClick={() => setRecordGroup(g)}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all capitalize"
                                    style={recordGroup === g
                                        ? { background: "#0f2244", color: "white" }
                                        : { background: "#eef1f9", color: "#6b7da0" }}>
                                    {g.replace(/-/g, " ")}
                                </button>
                            ))}
                        </div>
                        {/* )} */}

                        {labRecords.length === 0
                            ? <EmptyState icon={TestTube2} message="No laboratory records yet" />
                            : labRecords.map((lab: LabRequest) => (
                                <LabCard key={lab.labId} lab={lab} onView={onViewLaboratoryTest} />
                            ))
                        }
                    </div>
                )}

                {/* CERTIFICATES */}
                {activeTab === "certificates" && onViewMedicalCertificate && (
                    <div className="space-y-3">
                        {!medCertList || medCertList.length === 0
                            ? <EmptyState icon={FileCheck} message="No certificates issued yet" />
                            : medCertList.map((c) => (
                                <CertCard
                                    key={c.medCert.mcr_id}
                                    cert={c.medCert}
                                    onSelectMedCert={() =>
                                        onViewMedicalCertificate(
                                            c.medCertRequest.request.req_id,
                                            mapMedCertRecordToForm(c.medCert, patient ?? undefined, c.medCertRequest.mcr_id),
                                            c.medCertRequest.physician,
                                        )
                                    }
                                />
                            ))
                        }
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid #eef1f9", background: "#f7f8fc" }}>
                <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                    Showing {counts[activeTab]} record(s)
                </p>
                {consultationList && consultationList.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={12} style={{ color: "#b0bcd4" }} />
                        <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                            Last visit:{" "}
                            {consultationList[0].consultation.consultation_date
                                ? new Date(consultationList[0].consultation.consultation_date).toISOString().split("T")[0]
                                : "—"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewPatientHistoryModal;
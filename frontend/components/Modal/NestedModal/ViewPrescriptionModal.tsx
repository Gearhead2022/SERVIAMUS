"use client";

import React from "react";
import { PatientProps } from "@/types/PatientTypes";
import { useConsultationPrescription } from "@/hooks/Consultation/useConsultation";
import {
    Pill, FileText, Printer, Clock,
    Stethoscope, AlertCircle, Activity,
} from "lucide-react";

/* ─────────────────────────────────────
   TYPE matching your Prisma select
───────────────────────────────────── */
interface MedicineItem {
    item_id: number;
    medicine_name: string;
    strength: string;
    form: string;
    dose: string;
    frequency: string;
    route: string;
    duration: string;
    quantity: string;
    instruction: string;
}

interface PrescriptionData {
    presc_id: number;
    consultation_id: number;
    patient_id: number;
    doctor_id: number;
    gen_notes: string;
    medicines: MedicineItem[];
}

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const labelCls =
    "text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]";

function InfoChip({ label, value }: { label: string; value: string }) {
    return (
        <div
            className="flex flex-col px-3 py-2.5 rounded-xl min-w-0"
            style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}
        >
            <p className={`${labelCls} mb-0.5`}>{label}</p>
            <p className="text-[12.5px] font-semibold truncate" style={{ color: "#1a2a45" }}>
                {value || "—"}
            </p>
        </div>
    );
}

function SigLine({ med }: { med: MedicineItem }) {
    const parts = [
        med.medicine_name,
        med.strength,
        med.form,
        "—",
        med.dose,
        med.frequency?.toLowerCase(),
        med.route ? `(${med.route.toLowerCase()})` : "",
        med.duration,
        med.instruction ? `· ${med.instruction}` : "",
        med.quantity ? `· Qty: ${med.quantity}` : "",
    ]
        .filter(Boolean)
        .join(" ");
    return <p className="text-[12.5px] leading-relaxed" style={{ color: "#4a5568" }}>{parts}</p>;
}

/* ─────────────────────────────────────
   MEDICINE CARD
───────────────────────────────────── */
function MedicineCard({ med, index }: { med: MedicineItem; index: number }) {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}
        >
            {/* Card header */}
            <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ background: "#f4f6fb", borderBottom: "1px solid #dce3ef" }}
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                    style={{ background: "#0f2244", color: "white" }}
                >
                    {index + 1}
                </div>
                <div className="flex items-baseline gap-2 min-w-0">
                    <p
                        className="font-bold text-[14px] truncate"
                        style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}
                    >
                        {med.medicine_name || "Unnamed Medicine"}
                    </p>
                    {med.strength && (
                        <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "#eef1f9", color: "#0f2244" }}
                        >
                            {med.strength}
                        </span>
                    )}
                    {med.form && (
                        <span
                            className="text-[10.5px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "#f0f3fa", color: "#6b7da0" }}
                        >
                            {med.form}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5">
                {/* 6-chip grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                    <InfoChip label="Dose" value={med.dose} />
                    <InfoChip label="Frequency" value={med.frequency} />
                    <InfoChip label="Route" value={med.route} />
                    <InfoChip label="Duration" value={med.duration} />
                    <InfoChip label="Quantity" value={med.quantity} />
                    <InfoChip label="Form" value={med.form} />
                </div>

                {/* Special instructions */}
                {med.instruction && (
                    <div
                        className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-3"
                        style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                    >
                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#d97706" }}>
                                Special Instructions
                            </p>
                            <p className="text-[12.5px]" style={{ color: "#92400e" }}>{med.instruction}</p>
                        </div>
                    </div>
                )}

                {/* Sig preview */}
                <div
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
                    style={{ background: "#f0f9f9", border: "1px solid #b0dede" }}
                >
                    <FileText size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#0e7c7b" }} />
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#0e7c7b" }}>
                            Sig
                        </p>
                        <SigLine med={med} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────── */
function Skeleton() {
    return (
        <div className="space-y-3 px-6 py-5">
            {[1, 2].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{ border: "1.5px solid #dce3ef" }}
                >
                    <div className="h-11 bg-[#f0f3fa]" />
                    <div className="p-5 space-y-3">
                        <div className="grid grid-cols-6 gap-2">
                            {[...Array(6)].map((_, j) => (
                                <div key={j} className="h-12 rounded-xl bg-[#f4f6fb]" />
                            ))}
                        </div>
                        <div className="h-10 rounded-xl bg-[#f4f6fb]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────
   EMPTY STATE
───────────────────────────────────── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#f0f3fa" }}
            >
                <Pill size={24} style={{ color: "#c0ccd8" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>
                No prescription found
            </p>
            <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>
                No medicines were issued for this consultation.
            </p>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */
const ViewPrescriptionModal: React.FC<{
    patient: PatientProps | null;
    prescription: number | null;
}> = ({ patient, prescription }) => {
    const { data, isLoading } = useConsultationPrescription(prescription!);
    const rx = data as PrescriptionData | null | undefined;

    const initials = patient?.name
        ? patient.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const rxDate = new Date().toLocaleDateString("en-PH", {
        month: "long", day: "numeric", year: "numeric",
    });

    return (
        <div
            className="flex flex-col font-['DM_Sans'] bg-white">

            {/* ── Patient + Prescription info band ── */}
            <div
                className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-5 flex-wrap"
                style={{ background: "#f7f8fc", borderBottom: "1.5px solid #dce3ef" }}
            >
                {/* Patient info */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)",
                            boxShadow: "0 4px 14px rgba(15,34,68,0.2)",
                        }}
                    >
                        {initials}
                    </div>
                    <div>
                        <h2
                            className="text-[#0f2244] text-lg leading-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            {patient?.name ?? "Patient"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {patient?.patient_code && (
                                <span
                                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                    style={{ background: "#eef1f9", color: "#0f2244" }}
                                >
                                    {patient.patient_code}
                                </span>
                            )}
                            {patient?.age && (
                                <span className="text-[11px]" style={{ color: "#6b7da0" }}>
                                    {patient.age} yrs
                                </span>
                            )}
                            {patient?.sex && (
                                <span className="text-[11px]" style={{ color: "#6b7da0" }}>
                                    {patient.sex}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rx meta */}
                <div className="flex items-center gap-4 flex-wrap">
                    {rx && (
                        <div className="text-right">
                            <p className={labelCls}>Prescription ID</p>
                            <p className="text-[12px] font-bold font-mono" style={{ color: "#0f2244" }}>
                                RX-{String(rx.presc_id).padStart(5, "0")}
                            </p>
                        </div>
                    )}
                    <div className="text-right">
                        <p className={labelCls}>Date</p>
                        <div className="flex items-center gap-1">
                            <Clock size={11} style={{ color: "#8a99b8" }} />
                            <p className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{rxDate}</p>
                        </div>
                    </div>
                    {rx?.medicines && (
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: "#eef1f9", border: "1px solid #dce3ef" }}
                        >
                            <Pill size={13} style={{ color: "#0f2244" }} />
                            <div>
                                <p className="text-[14px] font-bold leading-none" style={{ color: "#0f2244" }}>
                                    {rx.medicines.length}
                                </p>
                                <p className="text-[9px] font-medium" style={{ color: "#6b7da0" }}>
                                    Medicine{rx.medicines.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                            background: "#0f2244", color: "white",
                            boxShadow: "0 4px 12px rgba(15,34,68,0.2)",
                        }}
                    >
                        <Printer size={13} /> Print
                    </button>
                </div>
            </div>

            {/* ── Scrollable content ── */}
            <div
                className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
                style={{ background: "#f8f9fc" }}
            >
                {isLoading ? (
                    <Skeleton />
                ) : !rx || rx.medicines.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Diagnosis / Clinical context strip */}
                        <div
                            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
                            style={{ background: "white", border: "1.5px solid #dce3ef" }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "#eef1f9" }}
                            >
                                <Stethoscope size={15} style={{ color: "#0f2244" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={labelCls}>Consultation #{rx.consultation_id}</p>
                                <p className="text-[12.5px] font-medium mt-0.5" style={{ color: "#1a2a45" }}>
                                    Prescription issued for this consultation
                                </p>
                            </div>
                            <span
                                className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                                style={{ background: "#f0fdf4", color: "#166534" }}
                            >
                                ✓ Issued
                            </span>
                        </div>

                        {/* Medicine cards */}
                        <div className="space-y-3">
                            {rx.medicines.map((med, i) => (
                                <MedicineCard key={med.item_id} med={med} index={i} />
                            ))}
                        </div>

                        {/* General notes */}
                        {rx.gen_notes && (
                            <div
                                className="rounded-2xl p-5"
                                style={{ background: "white", border: "1.5px solid #dce3ef" }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity size={14} style={{ color: "#0f2244" }} />
                                    <p
                                        className="text-[11px] font-bold uppercase tracking-wider"
                                        style={{ color: "#0f2244" }}
                                    >
                                        General Notes / Precautions
                                    </p>
                                </div>
                                <p className="text-[13px] leading-relaxed" style={{ color: "#4a5568" }}>
                                    {rx.gen_notes}
                                </p>
                            </div>
                        )}

                        {/* No-refill notice */}
                        <div
                            className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                        >
                            <AlertCircle size={13} className="flex-shrink-0" style={{ color: "#d97706" }} />
                            <p className="text-[11.5px]" style={{ color: "#92400e" }}>
                                <strong>No Refill</strong> — unless a new prescription is issued by the prescribing physician.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div
                className="flex-shrink-0 flex items-center justify-between px-6 py-3"
                style={{ borderTop: "1px solid #eef1f9", background: "#f7f8fc" }}
            >
                <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                    {rx ? `${rx.medicines.length} medicine(s) prescribed` : "No prescription data"}
                </p>
                <p className="text-[11px] italic" style={{ color: "#b0bcd4" }}>
                    For authorized personnel only
                </p>
            </div>
        </div>
    );
};

export default ViewPrescriptionModal;
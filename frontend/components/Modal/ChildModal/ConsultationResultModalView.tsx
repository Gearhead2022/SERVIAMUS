"use client";

import { useEffect, useState } from "react";
import {
    X, Calendar, User, Stethoscope, FileCheck, Pill,
    ZoomIn,
    ZoomOut,
    ArrowLeft,
    Printer,
    Download,
} from "lucide-react";
import { RequestProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { MedCertFormValues, PrescriptionValues, RegisterConsultationFormValues } from "@/schemas/consultation.schema";
import MedicalFormPreview from "../NestedModal/ModalPreview/MedicalFormPreview";
import { useGetDoctorById } from "@/hooks/Consultation/useConsultation";
import { formatDate } from "@/utils/Date";


// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
    string,
    {
        label: string;
        icon: React.ElementType;
        color: string;
        bg: string;
    }
> = {
    "consult-result": {
        label: "Clinical Chemistry",
        icon: Stethoscope,
        color: "#1d4ed8", // blue
        bg: "#dbeafe",
    },

    prescription: {
        label: "Prescription",
        icon: Pill,
        color: "#0e7c7b", // teal
        bg: "#ccfbf1",
    },

    "med-cert": {
        label: "Medical Certificate",
        icon: FileCheck,
        color: "#be123c", // rose
        bg: "#ffe4e6",
    },
};

// ── Main modal ─────────────────────────────────────────────────────────────

interface ConsultResultModalProps {
    form: RegisterConsultationFormValues | PrescriptionValues | MedCertFormValues;
    type: "consult-result" | "prescription" | "med-cert";
    doctorId: number;
    onBack: () => void;
    patient: PatientProps;
    request: RequestProps;
    onDownloadPdf?: () => void;
    onOpenPrintPage: () => void;
}

const LabResultModal: React.FC<ConsultResultModalProps> = ({ form, type, doctorId, onBack, patient, request, onDownloadPdf, onOpenPrintPage }) => {

    const template =
        doctorId === 1
            ? "temp-1"
            : "default";

    const { data: doctorInfo } = useGetDoctorById(doctorId);

    const catMeta = CATEGORY_META[type] ?? CATEGORY_META.other;
    const CatIcon = catMeta.icon;

    const [zoom, setZoom] = useState(100);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-600 flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onBack(); }}
        >
            <div
                className="bg-white rounded-2xl overflow-hidden w-full flex flex-col"
                style={{
                    maxWidth: "980px",
                    maxHeight: "88vh",
                    boxShadow: "0 32px 96px rgba(15,34,68,0.28)",
                }}
            >
                {/* ── Gradient hero header ── */}
                <div
                    className="relative px-6 py-5 overflow-hidden flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, #0f2244 0%, #1a3560 55%, ${catMeta.color} 100%)` }}
                >
                    {/* blobs */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }} />

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex float-right w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                            color: "rgba(255,255,255,0.45)",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <X size={14} />
                    </button>

                    <div className="relative z-10 flex items-start gap-4">
                        {/* Category icon */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.22)" }}>
                            <CatIcon size={22} className="text-white" />
                        </div>

                        {/* Title block */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-[17px] font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                    {catMeta.label}
                                </h2>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                    style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                                    {patient.patient_code}
                                </span>
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[11px]"
                                    style={{ color: "rgba(255,255,255,0.55)" }}>
                                    <User size={10} /> {patient.name}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                                <span className="inline-flex items-center gap-1 text-[11px]"
                                    style={{ color: "rgba(255,255,255,0.55)" }}>
                                    <Calendar size={10} /> {formatDate(request.req_date)}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                                    by {doctorInfo?.name}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-3 mt-2.5">
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-[180px]"
                                    style={{ background: "rgba(255,255,255,0.15)" }}>
                                    {/* <div className="h-full rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            background: pct === 100
                                                ? "linear-gradient(to right, #22c55e, #4ade80)"
                                                : "linear-gradient(to right, #e0f4f4, white)",
                                        }} /> */}
                                </div>
                                <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body: test sidebar + result panel ── */}
                <div className="h-screen">

                    <div
                        className="h-[65vh] overflow-y-auto p-1"
                        style={{ background: "linear-gradient(180deg,#eef2f7 0%,#e4e9f2 100%)" }}>
                        <div
                            className={`shadow overflow-y-auto scale-80 mt-2 origin-top ${type === 'consult-result' ? 'w-[790px]' : 'w-[560px]'} mx-auto`}
                            style={{
                                boxShadow:
                                    "0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.08)",
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: "top center",
                            }}
                        >
                            {form ? (
                                <MedicalFormPreview
                                    type={type}
                                    form={form}
                                    doctorId={doctorId}
                                    template={template}
                                />
                            ) : (
                                <div className="p-6 text-center text-slate-400">
                                    No consultation record available
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer Toolbar ── */}
                <div
                    className="flex-shrink-0 px-5 py-3 flex items-center justify-between"
                    style={{
                        borderTop: "1px solid #eef1f9",
                        background: "#ffffff",
                    }}
                >
                    {/* Left */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                            style={{
                                background: "#eef1f9",
                                color: "#0f2244",
                            }}
                        >
                            <ArrowLeft size={14} />
                            Back
                        </button>
                    </div>

                    {/* Center Zoom Controls */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                        style={{
                            background: "#f8f9fc",
                            border: "1px solid #eef1f9",
                        }}
                    >
                        <button
                            onClick={() =>
                                setZoom((z) => Math.max(50, z - 10))
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{
                                background: "#1a3560",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <ZoomOut size={14} />
                        </button>

                        <span
                            className="min-w-[60px] text-center text-[12px] font-bold"
                            style={{ color: "#0f2244" }}
                        >
                            {zoom}%
                        </span>

                        <button
                            onClick={() =>
                                setZoom((z) => Math.min(150, z + 10))
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{
                                background: "#1a3560",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onDownloadPdf}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                            style={{
                                background: "#eef6ff",
                                color: "#1d4ed8",
                            }}
                        >
                            <Printer size={14} />
                            Print
                        </button>

                        <button
                            onClick={onOpenPrintPage}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all"
                            style={{
                                background:
                                    "linear-gradient(135deg,#0f2244 0%,#1a3560 100%)",
                            }}
                        >
                            <Download size={14} />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabResultModal;
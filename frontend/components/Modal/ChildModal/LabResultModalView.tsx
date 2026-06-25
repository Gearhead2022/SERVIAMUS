"use client";

import { useState, useEffect } from "react";
import {
    X, CheckCircle2, Clock, FlaskConical,
    Microscope, Dna, Droplet, Activity, CreditCard,
    CheckCheck, Calendar, User, ChevronRight, Hourglass,
    Printer, ZoomIn, ArrowLeft, ZoomOut, Download
} from "lucide-react";
import { RequestStatus, PatientLabRequestResponse } from "@/types/LabTypes";
import { LabRecordGroupRequest } from "@/types/RequestTypes";
import LabResultDocument from "@/components/Modal/LabModal/LabResultDocument";
import { useLabResultPreview } from "@/hooks/Lab/useLab";
import { PatientProps } from "@/types/PatientTypes";
import { formatDate } from "@/utils/Date";
import { openLabPrintPage } from "@/utils/lab-print";

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_META: Record<LabRecordGroupRequest, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    "clinical_chemistry": { label: "Clinical Chemistry", icon: FlaskConical, color: "#7c4dab", bg: "#f3eefb" },
    "clinical_microscopy": { label: "Clinical Microscopy", icon: Microscope, color: "#0e7c7b", bg: "#e0f4f4" },
    "hematology": { label: "Hematology", icon: Droplet, color: "#c8102e", bg: "#fdf0f2" },
    "serology": { label: "Serology", icon: Dna, color: "#1d4ed8", bg: "#eff6ff" },
    "other": { label: "Other", icon: Activity, color: "#0f2244", bg: "#eef1f9" },
};

const TEST_STATUS_META: Record<RequestStatus, { label: string; color: string; bg: string; dot: string }> = {
    queued: { label: "Queued", color: "#92400e", bg: "#fffbeb", dot: "#f59e0b" },
    pending: { label: "Pending", color: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" },
    done: { label: "Done", color: "#065050", bg: "#e0f4f4", dot: "#0e7c7b" },
};

// ── Main modal ─────────────────────────────────────────────────────────────

interface LabResultModalProps {
    lab: PatientLabRequestResponse
    labid: number;
    patient: PatientProps;
    onClose: () => void;
}

const LabResultModal: React.FC<LabResultModalProps> = ({ lab, labid, onClose }) => {

    const [selectedItemId, setSelectedItemId] = useState<number>(
        lab.tests.find(
            (t) =>
                t.result_payload &&
                t.status === "done"
        )?.item_id
        ?? lab.tests[0]?.item_id
        ?? 0
    );

    const {
        data: previewData,
        isLoading,
    } = useLabResultPreview(
        labid,
        selectedItemId
    );

    const selectedTest =
        lab.tests.find(
            (t) => t.item_id === selectedItemId
        )
        ?? lab.tests[0];

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const recordGroup = selectedTest?.test.category?.toLowerCase() as LabRecordGroupRequest;

    const catMeta = CATEGORY_META[recordGroup] ?? CATEGORY_META.other;
    const CatIcon = catMeta.icon;

    const pct = lab.totalTests > 0 ? Math.round((lab.completedTests / lab.totalTests) * 100) : 0;
    const requestDate = formatDate(lab.requestedDate);

    const [zoom, setZoom] = useState(100);

    // console.log('lab view', previewData)

    return (
        <div
            className="fixed inset-0 z-600 flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                        onClick={onClose}
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
                                    {lab.labId}
                                </span>
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[11px]"
                                    style={{ color: "rgba(255,255,255,0.55)" }}>
                                    <User size={10} /> {lab.patientName}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                                <span className="inline-flex items-center gap-1 text-[11px]"
                                    style={{ color: "rgba(255,255,255,0.55)" }}>
                                    <Calendar size={10} /> {formatDate(requestDate)}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                                    by {lab.requestedBy}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-3 mt-2.5">
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-[180px]"
                                    style={{ background: "rgba(255,255,255,0.15)" }}>
                                    <div className="h-full rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            background: pct === 100
                                                ? "linear-gradient(to right, #22c55e, #4ade80)"
                                                : "linear-gradient(to right, #e0f4f4, white)",
                                        }} />
                                </div>
                                <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                                    {lab.completedTests}/{lab.totalTests} tests done
                                </span>
                                {/* Billing chip */}
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: lab.status === 'DONE' ? "rgba(14,124,123,0.3)" : "rgba(245,158,11,0.3)",
                                        color: lab.status === 'DONE' ? "#6ee7b7" : "#fde68a",
                                    }}>
                                    {lab.status === 'DONE' ? <CheckCheck size={9} /> : <CreditCard size={9} />}
                                    {lab.status === 'DONE' ? "Paid" : "Unpaid"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body: test sidebar + result panel ── */}
                <div className="grid grid-cols-[250px_1fr] flex-1 min-h-0">

                    {/* ── Left: test list ── */}
                    <div
                        className="w-[250px] flex-shrink-0 overflow-y-auto py-3"
                        style={{ borderRight: "1px solid #eef1f9", background: "#f8f9fc" }}
                    >
                        <p className="px-4 mb-2 text-[9.5px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: "#8a99b8" }}>
                            Tests ({lab.tests.length})
                        </p>
                        {lab.tests.map((test) => {
                            const isActive = test.item_id === selectedItemId;
                            const isDone = test.status === "done";
                            const isPending = test.status === "pending";
                            return (
                                <button
                                    key={test.item_id}
                                    onClick={() => setSelectedItemId(test.item_id)}
                                    className="w-full text-left px-4 py-3 flex items-start gap-2.5 transition-all"
                                    style={{
                                        background: isActive ? "white" : "transparent",
                                        borderLeft: isActive ? `3px solid ${catMeta.color}` : "3px solid transparent",
                                    }}
                                >
                                    {/* Status icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        {isDone ? (
                                            <CheckCircle2 size={13} style={{ color: "#0e7c7b" }} />
                                        ) : isPending ? (
                                            <Clock size={13} style={{ color: "#3b82f6" }} />
                                        ) : (
                                            <Hourglass size={13} style={{ color: "#f59e0b" }} />
                                        )}
                                    </div>
                                    {/* Test name */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold leading-tight"
                                            style={{ color: isActive ? catMeta.color : "#1a2a45" }}>
                                            {test.test.name}
                                        </p>
                                        <p className="text-[10px] mt-0.5" style={{ color: "#8a99b8" }}>
                                            {TEST_STATUS_META[test.status]?.label ?? test.status}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <ChevronRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: catMeta.color }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Right: result panel ── */}
                    <div
                        className="overflow-y-auto p-4 min-h-0"
                        style={{ background: "#f8f9fc" }}
                    >
                        {selectedTest ? (
                            <div className={`h-screen overflow-y-none scale-75 mt-2 font-sm origin-top`}
                            >
                                {isLoading ? (
                                    <div>Loading...</div>
                                ) : previewData ? (
                                    <div
                                        className="mx-[-50px] bg-white"
                                        style={{
                                            maxWidth: "770px",
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: "top center",
                                            boxShadow:
                                                "0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.10)",
                                        }}
                                    >
                                        <LabResultDocument
                                            request={previewData.request}
                                            form={previewData.form}
                                        />
                                    </div>
                                ) : (
                                    <div>No result available</div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-slate-400">
                                Select a laboratory test
                            </div>
                        )}
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
                            onClick={onClose}
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
                            onClick={() => {
                                openLabPrintPage(selectedItemId, {
                                    autoDownload: true,
                                })
                            }}
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
                            onClick={() => {
                                openLabPrintPage(selectedItemId, {
                                    autoPrint: true,
                                })
                            }}
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
        </div >
    );
};

export default LabResultModal;
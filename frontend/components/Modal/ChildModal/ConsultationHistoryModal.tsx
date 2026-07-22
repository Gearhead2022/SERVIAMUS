"use client";

import { useEffect, useMemo, useState } from "react";

import {
    X,
    ArrowLeft,
    Calendar,
    User,
    Clock,
    ChevronRight,
    ChevronLeft,
    History,
    Activity,
    Pill,
    Printer,
    Download,
    FileText,
    Stethoscope,
    ZoomIn,
    ZoomOut,
    FileCheck
} from "lucide-react";

import { PatientProps } from "@/types/PatientTypes";
import { RequestProps } from "@/types/RequestTypes";
import { formatDate } from "@/utils/Date";
import { useFollowupRecords, useGetDoctorById } from "@/hooks/Consultation/useConsultation";
import { MedCertFormValues, PrescriptionValues, RegisterConsultationFormValues, RegisterFollowupFormValues } from "@/schemas/consultation.schema";
import MedicalFormPreview from "../NestedModal/ModalPreview/MedicalFormPreview";
import { mapConsultationRecordToForm } from "@/utils/consultation/mapConsultationRecord";
import { mapConsultationHistoryToForm } from "@/utils/consultation/mapConsultationHistoryToForm";
import { FollowupConsultationProps, FollowupConsultationResultProps, InitialConsultationProps } from "@/types/ConsultationTypes";
import { mapFollowUpToPrisma } from "@/utils/consultation/mapFollowUpToPrisma";
import { mapFollowupHistoryToForm } from "@/utils/consultation/mapFollowupHistoryToForm";

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

interface FollowupHistoryModalProps {
    patient: PatientProps;
    request: RequestProps;
    doctorId: number;
    onBack: () => void;
    onOpenPrintPage: () => void;
    onDownloadPdf: () => void;
    type: "consult-result" | "prescription" | "med-cert";
}

const FollowupHistoryModal = ({
    patient,
    request,
    doctorId,
    onBack,
    onOpenPrintPage,
    onDownloadPdf,
    type
}: FollowupHistoryModalProps) => {

    const { data: history } = useFollowupRecords(Number(request.consult?.cons_id));

    const template =
        doctorId === 1
            ? "temp-1"
            : "default";

    const { data: doctor } = useGetDoctorById(doctorId);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [selectedType, setSelectedType] = useState<
        "consult-result" | "followup-result"
    >("consult-result");

    const [selectedRecord, setSelectedRecord] = useState<
        RegisterConsultationFormValues |
        RegisterFollowupFormValues
    >();

    useEffect(() => {

        if (!history) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedType("consult-result");

        console.log('from useEffect', history)

        setSelectedRecord(
            mapConsultationHistoryToForm(
                history,
                patient,
                request.consult!.cons_id
            )
        );

    }, [history, patient, request.consult]);

    console.log('data in modal', history)

    const [zoom, setZoom] = useState(100);

    useEffect(() => {

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };

    }, []);

    type TimelineItem =
        | {
            type: "initial";
            title: string;
            description: string;
            date: string;
            data: InitialConsultationProps;
        }
        | {
            type: "followup";
            title: string;
            description: string;
            date: string;
            data: FollowupConsultationResultProps;
        };

    const timeline = useMemo<TimelineItem[]>(() => {
        if (!history) return [];

        const items: TimelineItem[] = [
            {
                type: "initial",
                title: "Initial Consultation",
                description:
                    history.initialConsultation.chief_complaint ?? "",
                date: history.initialConsultation.consultation_date,
                data: history.initialConsultation,
            },
        ];

        if (history.followups.length > 0) {
            items.push({
                type: "followup",
                title: "Follow-up History",
                description: `${history.followups.length} Follow-up(s)`,
                date:
                    history.followups.length > 0
                        ? formatDate(history.followups.at(-1)!.followup_date)
                        : history.initialConsultation.consultation_date,
                data: history,
            });
        }

        return items;
    }, [history]);

    return (

        <div
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            style={{
                background: "rgba(15,34,68,.55)",
                backdropFilter: "blur(6px)"
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onBack(); }}
        >

            <div
                className="bg-white rounded-2xl overflow-hidden flex flex-col w-full"
                style={{
                    maxWidth: "1200px",
                    maxHeight: "90vh",
                    boxShadow: "0 24px 80px rgba(15,34,68,.25)"
                }}
            >
                {/* ───────────────── HEADER ───────────────── */}
                <div
                    className="relative px-6 py-5 overflow-hidden flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#0f2244 0%, #1a3560 55%, #3b82f6 100%)", }}>
                    {/* decorative circles */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,.05)", }} />
                    <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,.04)", }} />

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex float-right w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                            color: "rgba(255,255,255,0.45)",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}>
                        <X size={14} />
                    </button>

                    <div className="relative z-10 flex gap-4">
                        {/* Left Icon */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "rgba(255,255,255,.12)",
                                border: "1px solid rgba(255,255,255,.18)",
                            }}
                        >
                            <History
                                size={26}
                                className="text-white"
                            />
                        </div>

                        {/* Header Text */}
                        <div className="flex-1">

                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-white"
                                    style={{ fontFamily: "'DM Serif Display', serif", }}
                                >
                                    Consultation Timeline
                                </h2>

                                <span
                                    className="px-2 py-1 rounded-md text-[10px] font-semibold"
                                    style={{
                                        background: "rgba(255,255,255,.12)",
                                        color: "rgba(255,255,255,.85)",
                                    }}
                                >
                                    {patient.patient_code}
                                </span>

                            </div>

                            <div
                                className="mt-1 flex flex-wrap items-center gap-3 text-[12px]"
                                style={{ color: "rgba(255,255,255,.70)", }}
                            >
                                <span className="flex items-center gap-1">
                                    <User size={12} />
                                    {patient.name}
                                </span>

                                <span>•</span>

                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(patient.birth_date)}
                                </span>
                                <span>•</span>
                                <span>
                                    {patient.sex}
                                </span>
                                <span>•</span>
                                <span>
                                    {patient.age} yrs old
                                </span>
                            </div>

                            {/* Small description */}
                            <p
                                className="mt-3 text-[12px]"
                                style={{ color: "rgba(255,255,255,.55)", }}
                            >
                                View every consultation, follow-up, prescription,
                                and doctor`s assessment in chronological order.
                            </p>

                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────
                    BODY
                ───────────────────────────────────────────── */}

                <div
                    className="flex flex-1 overflow-hidden"
                    style={{
                        background: "#f7f9fc",
                    }}
                >
                    {/* LEFT SIDE */}
                    <div
                        className="w-[340px] border-r overflow-y-auto"
                        style={{ borderColor: "#eef1f9", background: "white", }}
                    >
                        <div
                            className="sticky top-0 z-10 px-5 py-4"
                            style={{
                                background: "#ffffff",
                                borderBottom: "1px solid #eef1f9",
                            }}
                        >
                            <h3
                                className="font-bold text-[14px]"
                                style={{ color: "#0f2244" }}
                            >
                                Consultation Timeline
                            </h3>

                            <p
                                className="text-[11px] mt-1"
                                style={{ color: "#94a3b8" }}
                            >
                                Select a consultation to view its details.
                            </p>
                        </div>
                        <div className="relative py-3">
                            <div
                                className="absolute left-8 top-0 bottom-0 w-[2px]"
                                style={{
                                    background: "#e6ebf5",
                                }}
                            />
                            {timeline.map((item, index) => {
                                const active = selectedIndex === index;
                                const button_type = item.type === 'initial' ? 'consult-result' : 'followup-result';
                                const selected = item.type === 'initial' ? 0 : index;
                                console.log('itemszsdas', history)

                                return (

                                    <div
                                        key={index}
                                        className="relative px-4 py-2"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {

                                                if (!history) return;

                                                setSelectedIndex(selected);

                                                setSelectedType(button_type);

                                                if (item.type === "initial") {
                                                    setSelectedType("consult-result");
                                                    setSelectedRecord(
                                                        mapConsultationHistoryToForm(
                                                            history!,
                                                            patient,
                                                            request.consult!.cons_id
                                                        )
                                                    );

                                                } else {
                                                    setSelectedType("followup-result");
                                                    setSelectedRecord(
                                                        mapFollowupHistoryToForm(
                                                            history,
                                                            patient,
                                                        )
                                                    );
                                                }
                                            }}
                                            className="w-full text-left rounded-xl p-4 transition-all"
                                            style={active
                                                ? {
                                                    background: "#eef6ff",
                                                    border: "1px solid #bfdbfe",
                                                    boxShadow: "0 4px 12px rgba(37,99,235,.08)"
                                                }
                                                : {
                                                    background: "white",
                                                    border: "1px solid transparent"
                                                }
                                            }
                                        >
                                            <div
                                                className="absolute left-[26px] mt-2 w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{
                                                    background:
                                                        item.type === "initial"
                                                            ? "#1d4ed8"
                                                            : "#10b981",

                                                    border: "3px solid white"
                                                }}
                                            >
                                                {item.type === "initial"
                                                    ?
                                                    <Stethoscope
                                                        size={10}
                                                        className="text-white"
                                                    />
                                                    :
                                                    <Activity
                                                        size={10}
                                                        className="text-white"
                                                    />
                                                }
                                            </div>
                                            <div className="ml-8">
                                                <div className="flex items-center justify-between">
                                                    <h4
                                                        className="font-semibold text-[13px]"
                                                        style={{ color: "#0f2244" }}
                                                    >
                                                        {item.title}
                                                    </h4>

                                                    {active && (

                                                        <ChevronRight
                                                            size={16}
                                                            style={{
                                                                color: "#2563eb"
                                                            }}
                                                        />

                                                    )}

                                                </div>
                                                <p
                                                    className="mt-1 text-[11px]"
                                                    style={{
                                                        color: "#64748b"
                                                    }}
                                                >

                                                    <Calendar
                                                        size={11}
                                                        className="inline mr-1"
                                                    />

                                                    {formatDate(item.date)}

                                                </p>
                                                {item.type === 'initial' && (
                                                    <>
                                                        <p
                                                            className="mt-2 text-[12px] line-clamp-2"
                                                            style={{
                                                                color: "#475569"
                                                            }}
                                                        >
                                                            {item.data.chief_complaint}
                                                        </p>

                                                        <div
                                                            className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold"
                                                            style={{
                                                                background: "#eef2ff",
                                                                color: "#1d4ed8"
                                                            }}
                                                        >

                                                            <FileText size={10} />

                                                            Assessment

                                                        </div>


                                                        {item.data.prescription && (

                                                            <div
                                                                className="mt-2 ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold"
                                                                style={{
                                                                    background: "#ecfdf5",
                                                                    color: "#047857"
                                                                }}
                                                            >

                                                                <Pill size={10} />

                                                                Prescription

                                                            </div>

                                                        )}
                                                    </>

                                                )}
                                            </div>

                                        </button>

                                    </div>

                                );
                            })}
                        </div>

                    </div>
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{
                            background:
                                "linear-gradient(180deg,#eef2f7 0%,#e7edf6 100%)"
                        }}
                    >

                        <div className="p-6">

                            <h2
                                className="font-bold text-lg"
                                style={{
                                    color: "#0f2244"
                                }}
                            >
                                {/* {selectedFollowup
                                    ? `Follow-up #${selectedIndex}`
                                    : "Initial Consultation"} */}
                                {selectedRecord ? (
                                    <MedicalFormPreview
                                        type={selectedType}
                                        form={selectedRecord}
                                        doctorId={doctorId}
                                        template={template}
                                        isSaved={true}
                                    />
                                ) : (
                                    <div className="p-6 text-center text-slate-400">
                                        No consultation record available
                                    </div>
                                )}

                            </h2>

                            <p
                                className="text-sm mt-1"
                                style={{
                                    color: "#64748b"
                                }}
                            >
                                Detailed consultation information will appear here.
                            </p>

                            {/* PART 3 starts here */}

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
            </div >
        </div >
    );
};

export default FollowupHistoryModal;
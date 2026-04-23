"use client";

import { useState } from "react";
import { PatientProps } from "@/types/PatientTypes";
import {
    Stethoscope, TestTube2, FileCheck, ChevronRight,
    Clock, Calendar, Activity, AlertCircle,
    CheckCircle2, XCircle, Hourglass, FileText,
    TrendingUp, Eye,
    PrinterIcon,
} from "lucide-react";
import { useAllConsultationRecords } from "@/hooks/Consultation/useConsultation";
import { useAllMedCertRecords } from "@/hooks/Consultation/useConsultation";
import { useDebounce } from "use-debounce";
import { ConsultationResultProps, MedicalCertificateProps } from "@/types/ConsultationTypes";

interface LabRecord {
    id: number;
    date: string;
    requestedBy: string;
    test: string;
    result: string;
    referenceRange: string;
    status: "released" | "pending" | "cancelled";
    remarks: string;
}

const MOCK_LABS: LabRecord[] = [
    { id: 1, date: "Mar 31, 2026", requestedBy: "Dr. Maria Santos", test: "CBC (Complete Blood Count)", result: "Normal", referenceRange: "WBC 4.5–11.0 × 10³/µL", status: "released", remarks: "All parameters within normal limits." },
    { id: 2, date: "Mar 31, 2026", requestedBy: "Dr. Maria Santos", test: "Urinalysis", result: "Normal", referenceRange: "Color: Yellow, Clear", status: "released", remarks: "No significant findings." },
    { id: 3, date: "Jan 6, 2026", requestedBy: "Dr. Maria Santos", test: "Fasting Blood Sugar", result: "98 mg/dL", referenceRange: "70–100 mg/dL", status: "released", remarks: "Within normal range." },
    { id: 4, date: "Jan 6, 2026", requestedBy: "Dr. Maria Santos", test: "Lipid Profile", result: "Borderline", referenceRange: "Total Chol. <200 mg/dL", status: "released", remarks: "Total cholesterol 205 mg/dL. Advised dietary modification." },
    { id: 5, date: "Apr 2, 2026", requestedBy: "Dr. Maria Santos", test: "Chest X-Ray", result: "—", referenceRange: "—", status: "pending", remarks: "Awaiting result." },
];

const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]";

type TabId = "consultations" | "laboratory" | "certificates";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "consultations", label: "Consultations", icon: Stethoscope },
    { id: "laboratory", label: "Laboratory", icon: TestTube2 },
    { id: "certificates", label: "Certificates", icon: FileCheck },
];

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
        completed: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", label: "Completed" },
        cancelled: { bg: "#fdf2f2", text: "#991b1b", dot: "#ef4444", label: "Cancelled" },
        pending: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", label: "Pending" },
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

function VitalChip({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
            <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>{label}</p>
            <p className="text-[13px] font-bold mt-0.5" style={{ color: "#0f2244" }}>{value}</p>
            <p className="text-[9px]" style={{ color: "#b0bcd4" }}>{unit}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#f0f3fa" }}>
                <Icon size={24} style={{ color: "#c0ccd8" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No records found</p>
            <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>{message}</p>
        </div>
    );
}
//   CONSULTATION DETAIL EXPAND

function ConsultationCard({ c, onSelectPrescription, onSelectConsultation }: { c: ConsultationResultProps, onSelectPrescription: () => void; onSelectConsultation: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden transition-all"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>
            {/* Summary row */}
            <div onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f8f9fc]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#eef1f9" }}>
                    <Stethoscope size={16} style={{ color: "#0f2244" }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{c.chief_complaint}</p>
                        <StatusPill status={"completed"} />
                    </div>

                    <p className="text-[11px] mt-0.5" style={{ color: "#8a99b8" }}>
                        {c.assessment} &nbsp;·&nbsp; {"DOCTOR"} &nbsp;·&nbsp;
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={10} /> {new Date(c.consultation_date).toISOString().split("T")[0]}
                        </span>
                    </p>
                </div>

                <button type="button"
                    className="flex justify-end items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0"
                    style={{ background: "#f8f8df", color: "#0f2244", border: "1px solid #dce3ef" }}
                    onClick={(e) => { e.stopPropagation(); onSelectPrescription(); }}>
                    <PrinterIcon size={12} /> View Prescription
                </button>

                <button type="button"
                    className="flex justify-end items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0"
                    style={{ background: "#dfe6f8", color: "#0f2244", border: "1px solid #dce3ef" }}
                    onClick={(e) => { e.stopPropagation(); onSelectConsultation() }}>
                    <PrinterIcon size={12} /> Print Preview
                </button>

                <ChevronRight size={15}
                    className="flex-shrink-0 transition-transform"
                    style={{ color: "#b0bcd4", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
                    onClick={() => setOpen((v) => !v)} />
            </div>

            {/* Expanded detail */}
            {open && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "#f0f3fa" }}>
                    {/* Vitals */}
                    <div className="mt-4 mb-4">
                        <p className={`${labelCls} mb-2`}>Vital Signs</p>
                        <div className="grid grid-cols-6 gap-2">
                            <VitalChip label="BP" value={c.bp ?? ''} unit="mmHg" />
                            <VitalChip label="Temp" value={c.temp ?? ''} unit="°C" />
                            <VitalChip label="CR" value={c.cr ?? ''} unit="bpm" />
                            <VitalChip label="RR" value={c.rr ?? ''} unit="/min" />
                            <VitalChip label="Wt" value={c.wt ?? ''} unit="kg" />
                            <VitalChip label="Ht" value={c.ht ?? ''} unit="cm" />
                        </div>
                    </div>

                    {/* Doctor notes */}
                    {c.assessment && (
                        <div className="mb-4 rounded-xl px-4 py-3" style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}>
                            <p className={`${labelCls} mb-1`}>Doctor&apos;s Notes</p>
                            <p className="text-[13px]" style={{ color: "#4a5568" }}>{c.assessment}</p>
                        </div>
                    )}

                    {/* Prescriptions */}
                    {/* {c.prescriptions.length > 0 && (
                        <div>
                            <p className={`${labelCls} mb-2`}>Prescriptions Issued</p>
                            <div className="flex flex-wrap gap-2">
                                {c.prescriptions.map((rx) => (
                                    <span key={rx} className="flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-full"
                                        style={{ background: "#eef1f9", color: "#0f2244", border: "1px solid #dce3ef" }}>
                                        💊 {rx}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )} */}
                </div>
            )}
        </div>
    );
}


// LAB CARD

function LabCard({ lab }: { lab: LabRecord }) {
    return (
        <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={lab.status === "released" ? { background: "#e0f4f4" } : { background: "#fffbeb" }}>
                <TestTube2 size={16} style={{ color: lab.status === "released" ? "#0e7c7b" : "#d97706" }} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <p className="font-semibold text-[13.5px]" style={{ color: "#1a2a45" }}>{lab.test}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8a99b8" }}>
                            Requested by {lab.requestedBy} &nbsp;·&nbsp;
                            <span className="inline-flex items-center gap-1"><Calendar size={10} /> {lab.date}</span>
                        </p>
                    </div>
                    <StatusPill status={lab.status} />
                </div>

                {lab.status === "released" && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl px-3 py-2.5" style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
                            <p className={`${labelCls} mb-0.5`}>Result</p>
                            <p className="text-[13px] font-semibold" style={{ color: "#1a2a45" }}>{lab.result}</p>
                        </div>
                        <div className="rounded-xl px-3 py-2.5" style={{ background: "#f4f6fb", border: "1px solid #dce3ef" }}>
                            <p className={`${labelCls} mb-0.5`}>Reference Range</p>
                            <p className="text-[12px]" style={{ color: "#6b7da0" }}>{lab.referenceRange}</p>
                        </div>
                    </div>
                )}

                {lab.remarks && (
                    <p className="text-[11.5px] mt-2 flex items-start gap-1.5" style={{ color: "#6b7da0" }}>
                        <Activity size={11} className="flex-shrink-0 mt-0.5" />
                        {lab.remarks}
                    </p>
                )}
            </div>
        </div>
    );
}

// CERT CARD
function CertCard({ cert }: { cert: MedicalCertificateProps }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>
            {/* <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={cert.status === "issued" ? { background: "#eef1f9" } : { background: "#fffbeb" }}>
                <FileCheck size={16} style={{ color: cert.status === "issued" ? "#0f2244" : "#d97706" }} />
            </div> */}

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <p className="font-semibold text-[13.5px]" style={{ color: "#1a2a45" }}>{cert.purpose}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8a99b8" }}>
                            {/* {cert.issuedBy} &nbsp;·&nbsp; */}
                            <span className="inline-flex items-center gap-1"><Calendar size={10} /> {cert.result_date}</span>
                        </p>
                    </div>
                    {/* <StatusPill status={cert.status} /> */}
                </div>
                <p className="text-[11.5px] mt-2 flex items-center gap-1.5" style={{ color: "#6b7da0" }}>
                    <FileText size={11} className="flex-shrink-0" />
                    Purpose: {cert.purpose}
                </p>
            </div>

            {/* {cert.status === "issued" && (
                <button type="button"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0"
                    style={{ background: "#f0f3fa", color: "#0f2244", border: "1px solid #dce3ef" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f0f3fa"; }}>
                    <Eye size={12} /> View
                </button>
            )} */}
        </div>
    );
}


// MAIN COMPONENT

const ViewPatientHistoryModal: React.FC<{ patient: PatientProps | null, onViewPrescription: (consultation_id: number) => void, onViewConsultation: (data: ConsultationResultProps) => void }> = ({ patient, onViewPrescription, onViewConsultation }) => {

    const [search, setSearch] = useState<string>('');
    const [debouncedSearch] = useDebounce(search, 500);

    const { data: consultationList, isLoading: consultLoading } = useAllConsultationRecords({
        patient_id: patient?.patient_id ?? 0,
        search: debouncedSearch,
    });

    const { data: medCertList, isLoading: medCertLoading } = useAllMedCertRecords({
        patient_id: patient?.patient_id ?? 0,
        search: debouncedSearch,
    });

    const [activeTab, setActiveTab] = useState<TabId>("consultations");

    const initials = patient?.name
        ? patient.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const counts = {
        consultations: consultationList?.length,
        laboratory: MOCK_LABS.length,
        certificates: medCertList?.length,
    };

    // console.log('history', ConsultationList);

    return (
        <div className="font-['DM_Sans'] bg-white flex flex-col" style={{ minHeight: "560px", maxHeight: "80vh" }}>

            {/* ── Patient info band ── */}
            <div className="flex-shrink-0 px-6 py-5 flex items-center gap-5"
                style={{ background: "#f7f8fc", borderBottom: "1.5px solid #dce3ef" }}>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)", boxShadow: "0 4px 14px rgba(15,34,68,0.2)" }}>
                    {initials}
                </div>

                {/* Info */}
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
                        {patient?.age && (
                            <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.age} yrs</span>
                        )}
                        {patient?.sex && (
                            <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.sex}</span>
                        )}
                        {patient?.contact_number && (
                            <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.contact_number}</span>
                        )}
                    </div>
                </div>

                {/* Summary badges */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    {[
                        { icon: Stethoscope, count: counts.consultations, label: "Consults", color: "#0f2244", bg: "#eef1f9" },
                        { icon: TestTube2, count: counts.laboratory, label: "Lab Tests", color: "#0e7c7b", bg: "#e0f4f4" },
                        { icon: FileCheck, count: counts.certificates, label: "Certificates", color: "#7c4dab", bg: "#f3eefb" },
                    ].map(({ icon: Icon, count, label, color, bg }) => (
                        <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: bg, border: `1px solid ${bg}` }}>
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
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setActiveTab(id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all relative"
                        style={activeTab === id
                            ? { background: "#0f2244", color: "white" }
                            : { background: "transparent", color: "#6b7da0" }
                        }>
                        <Icon size={13} />
                        {label}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={activeTab === id
                                ? { background: "rgba(255,255,255,0.2)", color: "white" }
                                : { background: "#eef1f9", color: "#0f2244" }}>
                            {counts[id]}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Tab content (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5"
                style={{ background: "#f8f9fc" }}>

                {/* CONSULTATIONS */}
                {activeTab === "consultations" && (
                    <div className="space-y-3">
                        {consultationList && consultationList?.length === 0
                            ? <EmptyState icon={Stethoscope} message="No consultation records yet" />
                            : consultationList?.map((c) => <ConsultationCard key={c.consultation_id} c={c} onSelectPrescription={() => onViewPrescription(c.consultation_id!)} onSelectConsultation={() => onViewConsultation(c)} />)
                        }
                    </div>
                )}

                {/* LABORATORY */}
                {activeTab === "laboratory" && (
                    <div className="space-y-3">
                        {/* Pending highlight */}
                        {MOCK_LABS.some((l) => l.status === "pending") && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                                <Hourglass size={13} style={{ color: "#d97706" }} />
                                <p className="text-[11.5px] font-medium" style={{ color: "#92400e" }}>
                                    {MOCK_LABS.filter((l) => l.status === "pending").length} lab result(s) still pending release.
                                </p>
                            </div>
                        )}
                        {MOCK_LABS.length === 0
                            ? <EmptyState icon={TestTube2} message="No laboratory records yet" />
                            : MOCK_LABS.map((lab) => <LabCard key={lab.id} lab={lab} />)
                        }
                    </div>
                )}

                {/* CERTIFICATES */}
                {activeTab === "certificates" && (
                    <div className="space-y-3">
                        {medCertList && medCertList.length === 0
                            ? <EmptyState icon={FileCheck} message="No certificates issued yet" />
                            : medCertList?.map((cert) => <CertCard key={cert.mcr_id} cert={cert} />)
                        }
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid #eef1f9", background: "#f7f8fc" }}>
                <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                    Showing {activeTab === "consultations" ? counts.consultations : activeTab === "laboratory" ? counts.laboratory : counts.certificates} record(s)
                </p>
                <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} style={{ color: "#b0bcd4" }} />
                    {/* <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                        Last visit: {ConsultationList?.[0].consultation_date ? new Date(ConsultationList?.[0]?.consultation_date).toISOString().split("T")[0] : "—"}
                    </p> */}
                </div>
            </div>
        </div>
    );
};

export default ViewPatientHistoryModal;
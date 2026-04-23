"use client";

import { useState, useMemo } from "react";
import {
    Stethoscope, Pill, FileCheck, Search, Filter,
    Calendar, ChevronRight, Eye, Printer,
    Clock, CheckCircle2, XCircle, AlertCircle,
    ArrowUpRight, Activity, TrendingUp, Users,
    Download, MoreHorizontal, ChevronDown,
    FlaskConical, FileText,
} from "lucide-react";
import { useConsultationRecordsHistory, usePrescriptionRecordsHistory, useMedicalCertificateRecordsHistory } from "@/hooks/Consultation/useConsultation";


type ConsultStatus = "completed" | "cancelled" | "pending";
type LabStatus = "released" | "pending" | "cancelled";
type CertStatus = "issued" | "pending";
type PrescStatus = "active" | "completed";

type AnyStatus = ConsultStatus | LabStatus | CertStatus | PrescStatus;

type Status = "WAITING" | "SERVING" | "DONE" | "CANCELED" | "RELEASED" | "ISSUED" | "ACTIVE";

const STATUS_MAP: Record<Status, { dot: string; text: string; bg: string; label: string }> = {
    "DONE": { dot: "#22c55e", text: "#166534", bg: "#f0fdf4", label: "Completed" },
    "CANCELED": { dot: "#ef4444", text: "#991b1b", bg: "#fef2f2", label: "Cancelled" },
    "WAITING": { dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", label: "Pending" },
    "RELEASED": { dot: "#0e7c7b", text: "#065050", bg: "#e0f4f4", label: "Released" },
    "ISSUED": { dot: "#0f2244", text: "#1e3a6e", bg: "#eef1f9", label: "Issued" },
    "ACTIVE": { dot: "#0e7c7b", text: "#065050", bg: "#e0f4f4", label: "Active" },
    "SERVING": { label: "In Progress", dot: "#0e7c7b", text: "#065050", bg: "#e0f4f4" },
};

function StatusBadge({ status }: { status: Status }) {
    const m = STATUS_MAP[status] ?? { dot: "#b0bcd4", text: "#6b7da0", bg: "#f4f6fb", label: status };
    return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.text }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
            {m.label}
        </span>
    );
}

function TableHead({ cols }: { cols: string[] }) {
    return (
        <thead>
            <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                {cols.map((c) => (
                    <th key={c} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#8a99b8" }}>
                        {c}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function ActionBtn({ label, icon: Icon, onClick, variant = "ghost" }: {
    label: string; icon: React.ElementType;
    onClick?: () => void; variant?: "ghost" | "primary";
}) {
    return (
        <button type="button" onClick={onClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={variant === "primary"
                ? { background: "#0f2244", color: "white" }
                : { background: "#f0f3fa", color: "#0f2244", border: "1px solid #dce3ef" }
            }>
            <Icon size={11} />{label}
        </button>
    );
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: {
    label: string; value: number; sub: string;
    icon: React.ElementType; color: string; bg: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-5 relative overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(15,34,68,0.07), 0 4px 16px rgba(15,34,68,0.04)" }}>
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: color }} />
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <TrendingUp size={12} style={{ color: "#c0ccd8" }} className="mt-1" />
            </div>
            <p className="text-3xl font-bold leading-none" style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>
                {value}
            </p>
            <p className="text-xs font-medium mt-1.5" style={{ color: "#6b7da0" }}>{label}</p>
            <p className="text-[10.5px] font-semibold mt-2" style={{ color }}>{sub}</p>
        </div>
    );
}

type TabId = "consultations" | "prescriptions" | "certificates";


const HistoryRecords = () => {
    const [activeTab, setActiveTab] = useState<TabId>("consultations");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("all");

    const { data: consultaionList } = useConsultationRecordsHistory();
    const { data: prescriptionList } = usePrescriptionRecordsHistory();
    const { data: medicalRecordList } = useMedicalCertificateRecordsHistory();

    const filteredConsults = consultaionList;
    const filteredRx = prescriptionList;
    const filteredCerts = medicalRecordList;
    // console.log('certs', prescriptionList)

    const TABS = useMemo(() => [
        {
            id: "consultations",
            label: "Consultations",
            icon: Stethoscope,
            count: filteredConsults?.length,
        },
        {
            id: "prescriptions",
            label: "Prescriptions",
            icon: Pill,
            count: filteredRx?.length,
        },
        {
            id: "certificates",
            label: "Certificates",
            icon: FileCheck,
            count: filteredCerts?.length,
        },
    ], [filteredConsults, filteredRx, filteredCerts]);

    return (
        <div className="min-h-screen font-['DM_Sans'] relative"
            style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}>
            <div className="relative z-10">

                {/* ── Page header ── */}
                <div className="px-8 py-5">
                    <div className="max-w-[1400px] mx-auto flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black mb-1">
                                Clinical Records
                            </p>
                            <h1 className="text-3xl leading-tight text-black"
                                style={{ fontFamily: "'DM Serif Display', serif" }}>
                                History & Records
                            </h1>
                        </div>
                        <div className="flex items-center text-black gap-2.5 flex-wrap">
                            <button type="button"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                            >
                                <Download size={13} /> Export
                            </button>
                            <button type="button"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                                style={{ background: "#c8102e", color: "white", boxShadow: "0 4px 14px rgba(200,16,46,0.4)" }}>
                                <Printer size={13} /> Print Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[95%] mx-auto px-6 py-3 space-y-7">

                    {/* ── Stat cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Consultations" value={filteredConsults?.length ?? 0}
                            sub={`${filteredConsults?.filter(c => c.request.status === "completed").length} completed`}
                            icon={Stethoscope} color="#0f2244" bg="#eef1f9" />
                        <StatCard label="Prescriptions Issued" value={filteredRx?.length ?? 0}
                            sub={`${filteredRx?.filter(r => r.request.status === "active").length} active`}
                            icon={Pill} color="#0e7c7b" bg="#e0f4f4" />
                        <StatCard label="Certificates Issued" value={filteredCerts?.filter(c => c.request.status === "issued").length ?? 0}
                            sub={`${filteredCerts?.filter(c => c.request.status === "pending").length} pending`}
                            icon={FileCheck} color="#7c4dab" bg="#f3eefb" />
                        <StatCard label="Pending Follow-ups"
                            value={filteredConsults?.filter(c => c.consultation.follow_up_date).length ?? 0}
                            sub="Upcoming reviews"
                            icon={Clock} color="#c8102e" bg="#fdf0f2" />
                    </div>

                    {/* ── Main records card ── */}
                    <div className="bg-white rounded-2xl overflow-hidden"
                        style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.10), 0 8px 24px rgba(15,34,68,0.06)" }}>

                        {/* Toolbar */}
                        <div className="px-6 pt-5 pb-0 flex items-center justify-between gap-4 flex-wrap"
                            style={{ borderBottom: "1px solid #f0f3fa" }}>

                            {/* Tab bar */}
                            <div className="flex items-center gap-1">
                                {TABS.map(({ id, label, icon: Icon, count }) => (
                                    <button key={id} type="button" onClick={() => { setActiveTab(id as TabId); setSearch(""); setStatus("all"); }}
                                        className="flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold transition-all rounded-t-xl relative"
                                        style={activeTab === id
                                            ? { color: "#0f2244", borderBottom: "2px solid #0f2244", background: "#f8f9fc" }
                                            : { color: "#8a99b8", borderBottom: "2px solid transparent" }
                                        }>
                                        <Icon size={13} />
                                        {label}
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={activeTab === id
                                                ? { background: "#0f2244", color: "white" }
                                                : { background: "#eef1f9", color: "#6b7da0" }}>
                                            {count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Search + filter */}
                            <div className="flex items-center gap-2 pb-3">
                                <div className="relative">
                                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                                    <input type="text" placeholder="Search patient or code…" value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none transition"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "200px" }} />
                                </div>
                                <div className="relative">
                                    <select value={statusFilter} onChange={(e) => setStatus(e.target.value)}
                                        className="pl-3 pr-8 py-2 text-xs rounded-xl outline-none appearance-none"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                        <option value="all">All Status</option>
                                        {activeTab === "consultations" && <>
                                            <option value="completed">Completed</option>
                                            <option value="pending">Pending</option>
                                            <option value="cancelled">Cancelled</option>
                                        </>}
                                        {activeTab === "prescriptions" && <>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </>}
                                        {activeTab === "certificates" && <>
                                            <option value="issued">Issued</option>
                                            <option value="pending">Pending</option>
                                        </>}
                                    </select>
                                    <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: "#8a99b8" }} />
                                </div>
                            </div>
                        </div>

                        {/* ── CONSULTATIONS TABLE ── */}
                        {activeTab === "consultations" && (
                            <div className="overflow-x-auto min-h-[50vh]">
                                {filteredConsults?.length === 0 ? (
                                    <EmptyState icon={Stethoscope} message="No consultation records match your search." />
                                ) : (
                                    <table className="w-full text-sm">
                                        <TableHead cols={["Date", "Patient", "Chief Complaint", "Diagnosis", "Doctor", "Follow-up", "Status", ""]} />
                                        <tbody>
                                            {Array.isArray(filteredConsults) && filteredConsults.map((c, i) => (
                                                <tr key={i} className="group transition-all"
                                                    style={{ borderBottom: "1px solid #f4f6fb" }}>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                            <span className="text-[12px]" style={{ color: "#6b7da0" }}>date</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                                style={{ background: "#eef1f9", color: "#0f2244" }}>
                                                                {c.patient.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{c.patient.name}</p>
                                                                <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{c.patient.patient_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 max-w-[160px]">
                                                        <p className="text-[12px] truncate" style={{ color: "#4a5568" }}>{c.consultation.chief_complaint}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 max-w-[180px]">
                                                        <p className="text-[12px] truncate" style={{ color: "#4a5568" }}>{c.consultation.assessment}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <p className="text-[12px]" style={{ color: "#6b7da0" }}>DOCTOR</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        {c.consultation.follow_up_date ? (
                                                            <span className="flex items-center gap-1.5 text-[11px] font-medium"
                                                                style={{ color: "#d97706" }}>
                                                                <Clock size={10} />date
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px]" style={{ color: "#c0ccd8" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <StatusBadge status={c.request.status as Status} />
                                                            {/* {c.hasRx && (
                                                                <span className="flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
                                                                    style={{ background: "#e0f4f4", color: "#0e7c7b" }}>
                                                                    <Pill size={8} /> Rx
                                                                </span>
                                                            )} */}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ActionBtn label="View" icon={Eye} />
                                                            {/* {c.hasRx && <ActionBtn label="Rx" icon={Pill} />} */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* ── PRESCRIPTIONS TABLE ── */}
                        {activeTab === "prescriptions" && (
                            <div className="overflow-x-auto min-h-[50vh]">
                                {filteredRx?.length === 0 ? (
                                    <EmptyState icon={Pill} message="No prescription records match your search." />
                                ) : (
                                    <table className="w-full text-sm">
                                        <TableHead cols={["Date", "Patient", "Prescribed By", "Medicines", "Consultation", "Status", ""]} />
                                        <tbody>
                                            {Array.isArray(filteredRx) && filteredRx.map((r, i) => (
                                                <tr key={i} className="group transition-all"
                                                    style={{ borderBottom: "1px solid #f4f6fb" }}
                                                    onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "#f8f9fc"}
                                                    onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "white"}>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                            <span className="text-[12px]" style={{ color: "#6b7da0" }}>{r.request.req_date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                                style={{ background: "#e0f4f4", color: "#0e7c7b" }}>
                                                                {r.patient.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{r.patient.name}</p>
                                                                <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{r.patient.patient_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <p className="text-[12px]" style={{ color: "#6b7da0" }}>DOCTOR</p>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                                style={{ background: "#eef1f9" }}>
                                                                <Pill size={11} style={{ color: "#0f2244" }} />
                                                            </div>
                                                            {/* <span className="text-[13px] font-bold" style={{ color: "#0f2244" }}>{r.prescription.medicines[0].medicine_name ?? ''}</span> */}
                                                            {/* <span className="text-[11px]" style={{ color: "#8a99b8" }}>medicine{Number(r.prescription.medicines[0].frequency) !== 1 ? "s" : ""}</span> */}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-[11.5px] font-mono px-2 py-0.5 rounded-md"
                                                            style={{ background: "#f4f6fb", color: "#6b7da0" }}>
                                                            #{String(r.consultation.consultation_id).padStart(5, "0")}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5"><StatusBadge status={r.request.status as Status} /></td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ActionBtn label="View" icon={Eye} />
                                                            <ActionBtn label="Print" icon={Printer} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* ── CERTIFICATES TABLE ── */}
                        {activeTab === "certificates" && (
                            <div className="overflow-x-auto min-h-[50vh]">
                                {filteredCerts?.length === 0 ? (
                                    <EmptyState icon={FileCheck} message="No certificate records match your search." />
                                ) : (
                                    <table className="w-full text-sm">
                                        <TableHead cols={["Date", "Patient", "Certificate Type", "Purpose", "Issued By", "Status", ""]} />
                                        <tbody>
                                            {Array.isArray(filteredCerts) && filteredCerts.map((c, i) => (
                                                <tr key={i} className="group transition-all"
                                                    style={{ borderBottom: "1px solid #f4f6fb" }}>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                            <span className="text-[12px]" style={{ color: "#6b7da0" }}>{c.request.req_date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                                style={{ background: "#f3eefb", color: "#7c4dab" }}>
                                                                {c.patient.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{c.patient.name}</p>
                                                                <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{c.patient.patient_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <FileText size={12} style={{ color: "#7c4dab" }} />
                                                            <p className="text-[12.5px] font-medium" style={{ color: "#1a2a45" }}>{c.request.req_type}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 max-w-[200px]">
                                                        <p className="text-[12px] truncate" style={{ color: "#6b7da0" }}>purpose</p>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <p className="text-[12px]" style={{ color: "#6b7da0" }}>issued by</p>
                                                    </td>
                                                    <td className="px-5 py-3.5"><StatusBadge status={c.request.status as Status} /></td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {/* {c.status === "issued" && (
                                                                <>
                                                                    <ActionBtn label="View" icon={Eye} />
                                                                    <ActionBtn label="Print" icon={Printer} />
                                                                </>
                                                            )}
                                                            {c.status === "pending" && (
                                                                <ActionBtn label="Process" icon={CheckCircle2} variant="primary" />
                                                            )} */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Table footer */}
                        {/* <div className="px-6 py-3 flex items-center justify-between"
                            style={{ borderTop: "1px solid #f0f3fa", background: "#f8f9fc" }}>
                            <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                                Showing {
                                    activeTab === "consultations" ? filteredConsults.length :
                                        activeTab === "prescriptions" ? filteredRx.length :
                                            filteredCerts.length
                                } record(s)
                            </p>
                            <div className="flex items-center gap-1.5">
                                <Activity size={11} style={{ color: "#c0ccd8" }} />
                                <p className="text-[11px]" style={{ color: "#b0bcd4" }}>Updated just now</p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────
   EMPTY STATE
───────────────────────────────────── */
function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#f0f3fa" }}>
                <Icon size={24} style={{ color: "#c0ccd8" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No records found</p>
            <p className="text-[11px] mt-1 max-w-xs" style={{ color: "#b0bcd4" }}>{message}</p>
        </div>
    );
}

export default HistoryRecords;
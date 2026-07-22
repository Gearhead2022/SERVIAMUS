"use client";

import { useState, useMemo } from "react";
import {
    Stethoscope, Pill, FileCheck, Search,
    Calendar, Eye, Printer,
    Clock, ChevronDown, FileText, TestTube2
} from "lucide-react";
import { useConsultationRecordsHistory, usePrescriptionRecordsHistory, useMedicalCertificateRecordsHistory, useRequestData, ConsultationHistoryItem, PrescriptionHistoryItem, MedicalCertificateHistoryItem, useLaboratoryRecordHistory, LaboratoryHistoryItem } from "@/hooks/Consultation/useConsultation";
import { formatDate } from "@/utils/Date";
import { useDebounce } from "use-debounce";
import { SortKey } from "@/types/BillingTypes";
import Pagination from "@/components/Pagination";
import { MedCertFormValues, PrescriptionValues, RegisterConsultationFormValues } from "@/schemas/consultation.schema";
import { mapConsultationRecordToForm } from "@/utils/consultation/mapConsultationRecord";
import { mapMedCertRecordToForm } from "@/utils/consultation/mapMedCertRecord";
import { mapPrescriptionRecordToForm } from "@/utils/consultation/mapRxRecord";
import LabResultModal from "@/components/Modal/ChildModal/LabResultModalView";
import RoleGuard from "@/guards/RoleGuard";
import SummaryCards from "@/components/ui/SummaryCards";
import ConsultationResultModalView from "@/components/Modal/ChildModal/ConsultationResultModalView";
import { openConsultPrintPage } from "@/utils/consultation/consultPrint";
import ConsultationHistoryModal from "@/components/Modal/ChildModal/ConsultationHistoryModal";

type Status = "WAITING" | "SERVING" | "DONE" | "CANCELED" | "RELEASED" | "ISSUED" | "ACTIVE";
type TabId = "consultations" | "prescriptions" | "certificates" | "laboratory";

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

const HistoryRecords = () => {

    const [activeTab, setActiveTab] = useState<TabId>("consultations");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);
    const [dateFrom] = useState("");
    const [dateTo] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [sortKey, setSortKey] = useState<SortKey>("date_desc");
    const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");

    // COMMON FILTERS
    const commonFilters = {
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: statusFilter,
        sort: sortKey,
        dateFrom,
        dateTo,
    };

    // CONSULTATION
    const { data: consultationData } = useConsultationRecordsHistory(commonFilters);

    // PRESCRIPTION
    const { data: prescriptionData } = usePrescriptionRecordsHistory(commonFilters);

    // MED CERT
    const { data: medicalCertData } = useMedicalCertificateRecordsHistory(commonFilters);

    // MED CERT
    const { data: laboratoryData } = useLaboratoryRecordHistory(commonFilters);

    // ACTIVE DATA
    const activeData =
        activeTab === "consultations"
            ? consultationData
            : activeTab === "prescriptions"
                ? prescriptionData
                : medicalCertData;

    // ACTIVE META
    const activeMeta =
        activeData?.pagination;

    // TOTAL ENTRIES
    const totalEntries =
        activeMeta?.total ?? 0;

    // TOTAL PAGES
    const totalPages =
        activeMeta?.totalPages ?? 1;

    const calculateStartIndex = () => {
        return totalEntries === 0
            ? 0
            : (page - 1) * rowsPerPage + 1;
    };

    // END INDEX
    const calculateEndIndex = () => {
        return Math.min(
            page * rowsPerPage,
            totalEntries
        );
    };

    const filteredConsults = consultationData?.data;
    const filteredRx = prescriptionData?.data;
    const filteredCerts = medicalCertData?.data;
    const filteredlabs = laboratoryData?.data;

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
        {
            id: "laboratory",
            label: "Laboratory",
            icon: TestTube2,
            count: filteredlabs?.length,
        },
    ], [filteredConsults, filteredRx, filteredCerts, filteredlabs]);

    const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
    const { data: currentRequest } = useRequestData(currentRequestId!);

    const [selectedConsultationRecord, setSelectedConsultationRecord] = useState<RegisterConsultationFormValues | null>(null);
    const [selectedMedCertRecord, setSelectedMedCertRecord] = useState<MedCertFormValues | null>(null);
    const [selectedPrescriptionRecord, setSelectedPrescriptionRecord] = useState<PrescriptionValues | null>(null);
    const [selectedLaboratoryRecord, setSelectedLaboratoryRecord] = useState<LaboratoryHistoryItem | null>(null);

    const [consultationResultPreview, setConsultationResultPreview] = useState<boolean>(false);
    const [medCertPreview, setMedCertPreview] = useState<boolean>(false);
    const [prescriptionPreview, setPrescriptionPreview] = useState<boolean>(false);
    const [laboratoryPreview, setLaboratoryPreview] = useState<boolean>(false);

    const doctorId =
        currentRequest?.consult?.physician ??
        currentRequest?.cert?.physician ??
        0;

    //Handle selected row
    const [selecteConsultRecord, setSelectedConsultRecord] = useState<ConsultationHistoryItem | null>(null);
    const [selecteRxRecord, setSelectedRxRecord] = useState<PrescriptionHistoryItem | null>(null);
    const [selectedCertificateRecord, setSelectedCertificateRecord] = useState<MedicalCertificateHistoryItem | null>(null);

    console.log('consult request', selectedConsultationRecord)

    const handleViewConsultation = async (
        requestId: number,
        form: RegisterConsultationFormValues,
    ) => {
        console.log('from handler', form)
        setCurrentRequestId(requestId);
        setSelectedConsultationRecord(form);
        setConsultationResultPreview(true);
    };

    const handleViewPrescription = async (
        requestId: number,
        form: PrescriptionValues,
    ) => {
        setCurrentRequestId(requestId);
        setSelectedPrescriptionRecord(form);
        setPrescriptionPreview(true);
    };

    const handleViewMedCert = async (
        requestId: number,
        form: MedCertFormValues,
    ) => {
        setCurrentRequestId(requestId);
        setSelectedMedCertRecord(form);
        setMedCertPreview(true);
    };

    const handleViewLaboratory = async (
        requestId: number,
    ) => {
        setCurrentRequestId(requestId);
        setLaboratoryPreview(true);
    };

    const stats = [
        {
            label: "Total Consultations",
            value: consultationData?.stats?.completed ?? 0,
            sub: consultationData?.stats?.completed ?? 0,
            icon: Stethoscope,
            color: "#0f2244",
            bg: "#eef1f9",
        },
        {
            label: "Prescriptions Issued",
            value: prescriptionData?.stats?.completed ?? 0,
            sub: prescriptionData?.stats?.completed ?? 0,
            icon: Pill,
            color: "#0e7c7b",
            bg: "#e0f4f4",
        },
        {
            label: "Certificates Issued",
            value: medicalCertData?.stats?.completed ?? 0,
            sub: medicalCertData?.stats?.completed ?? 0,
            icon: FileCheck,
            color: "#7c4dab",
            bg: "#f3eefb",
        },
        {
            label: "Laboratory Test Completed",
            value: laboratoryData?.stats?.completed ?? 0,
            sub: laboratoryData?.stats?.completed ?? 0,
            icon: Clock,
            color: "#c8102e",
            bg: "#fdf0f2",
        },
    ];
    // console.log('consult', selectedConsultationRecord)

    return (
        <RoleGuard allowedRoles={["DOCTOR", "ADMIN"]}>
            <div className="min-h-screen font-['DM_Sans'] relative"
                style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}>
                <div className="relative">

                    {currentRequest && selecteConsultRecord && consultationResultPreview && selectedConsultationRecord && (
                        <ConsultationHistoryModal type="consult-result" doctorId={doctorId} onBack={() => setConsultationResultPreview(false)} patient={selecteConsultRecord.patient} request={currentRequest}
                            onDownloadPdf={() =>
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoDownload: true,
                                    type: 'consult-result',
                                    patientName: selecteConsultRecord?.patient.name
                                })
                            }
                            onOpenPrintPage={() => {
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoPrint: true,
                                    type: 'consult-result',
                                    patientName: selecteConsultRecord?.patient.name
                                })
                            }}
                        ></ConsultationHistoryModal>
                    )}

                    {currentRequest && selecteConsultRecord && prescriptionPreview && selectedPrescriptionRecord && (
                        <ConsultationResultModalView form={selectedPrescriptionRecord} type="prescription" doctorId={doctorId} onBack={() => setPrescriptionPreview(false)} patient={selecteConsultRecord.patient} request={currentRequest}
                            onDownloadPdf={() =>
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoDownload: true,
                                    type: 'prescription',
                                    patientName: selecteConsultRecord?.patient.name,
                                    doctorId
                                })
                            }
                            onOpenPrintPage={() => {
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoPrint: true,
                                    type: 'prescription',
                                    patientName: selecteConsultRecord?.patient.name,
                                    doctorId
                                })
                            }}
                        ></ConsultationResultModalView>
                    )}

                    {currentRequest && selecteRxRecord && prescriptionPreview && selectedPrescriptionRecord && (
                        <ConsultationResultModalView form={selectedPrescriptionRecord} type="prescription" doctorId={doctorId} onBack={() => setPrescriptionPreview(false)} patient={selecteRxRecord.patient} request={currentRequest}
                            onDownloadPdf={() =>
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoDownload: true,
                                    type: 'prescription',
                                    patientName: selecteRxRecord?.patient.name,
                                    doctorId
                                })
                            }
                            onOpenPrintPage={() => {
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoPrint: true,
                                    type: 'prescription',
                                    patientName: selecteRxRecord?.patient.name,
                                    doctorId
                                })
                            }}
                        ></ConsultationResultModalView>
                    )}

                    {currentRequest && selectedCertificateRecord && medCertPreview && selectedMedCertRecord && (
                        <ConsultationResultModalView form={selectedMedCertRecord} type="med-cert" doctorId={doctorId} onBack={() => setMedCertPreview(false)} patient={selectedCertificateRecord.patient} request={currentRequest}
                            onDownloadPdf={() =>
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoDownload: true,
                                    type: 'med-cert',
                                    patientName: selectedCertificateRecord?.patient.name,
                                    doctorId
                                })
                            }
                            onOpenPrintPage={() => {
                                openConsultPrintPage(currentRequest.req_id, {
                                    autoPrint: true,
                                    type: 'med-cert',
                                    patientName: selectedCertificateRecord?.patient.name,
                                    doctorId
                                })
                            }}
                        ></ConsultationResultModalView>
                    )}

                    {selectedLaboratoryRecord && laboratoryPreview && (
                        <LabResultModal lab={selectedLaboratoryRecord.lab} labid={selectedLaboratoryRecord.lab.labId} patient={selectedLaboratoryRecord.patient} onClose={() => setLaboratoryPreview(false)} />
                    )}

                    {/* ── Page header ── */}
                    <div className="border-b border-white/10 px-8 py-5 flex items-center">
                        <div>
                            <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide mb-1">
                                Clinical Records
                            </h1>
                            <p className="text-black/60 text-sm">History & Records</p>
                        </div>
                    </div>

                    <div className="px-8 py-2 space-y-5 z-100">

                        {/* ── Stat cards ── */}
                        <SummaryCards
                            items={stats}
                        />

                        {/* ── Main records card ── */}
                        <div className="bg-white rounded-2xl overflow-hidden"
                            style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.10), 0 8px 24px rgba(15,34,68,0.06)" }}>

                            {/* Toolbar */}
                            <div className="px-6 pt-5 pb-0 flex items-center justify-between gap-4 flex-wrap"
                                style={{ borderBottom: "1px solid #f0f3fa" }}>

                                {/* Tab bar */}
                                <div className="flex items-center gap-1">
                                    {TABS.map(({ id, label, icon: Icon, count }) => (
                                        <button key={id} type="button" onClick={() => { setActiveTab(id as TabId); }}
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

                                {/* Search + filter + rows per page + sort */}
                                <div className="flex items-center gap-2 pb-3">
                                    {/* Rows Per Page */}
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(
                                                Number(e.target.value)
                                            );

                                            setPage(1);
                                        }}
                                        className="px-3 py-2 text-xs rounded-xl outline-none"
                                        style={{
                                            background: "#f4f6fb",
                                            border: "1.5px solid #dce3ef",
                                            color: "#1a2a45",
                                        }}
                                    >
                                        <option value={10}>
                                            10 / page
                                        </option>

                                        <option value={25}>
                                            25 / page
                                        </option>

                                        <option value={50}>
                                            50 / page
                                        </option>

                                        <option value={100}>
                                            100 / page
                                        </option>
                                    </select>
                                    <div className="relative">
                                        <select
                                            value={sortKey}
                                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                                            className="px-3 py-2 text-xs rounded-xl outline-none"
                                            style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}
                                        >
                                            <option value="date_desc">Newest first</option>
                                            <option value="date_asc">Oldest first</option>
                                            <option value="patient_asc">Patient A–Z</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                                        <input type="text" placeholder="Search patient or code…" value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none transition"
                                            style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "200px" }} />
                                    </div>
                                    <div className="relative">
                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
                                            className="pl-3 pr-8 py-2 text-xs rounded-xl outline-none appearance-none"
                                            style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                            <option value="ALL">All Status</option>
                                            <option value="DONE">Done</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: "#8a99b8" }} />
                                    </div>
                                </div>
                            </div>

                            {/* ── CONSULTATIONS TABLE ── */}
                            {activeTab === "consultations" && (
                                <>
                                    <div className="overflow-x-auto min-h-[50vh]">
                                        {filteredConsults?.length === 0 ? (
                                            <EmptyState icon={Stethoscope} message="No consultation records match your search." />
                                        ) : (
                                            <table className="w-full text-sm">
                                                <TableHead cols={["Patient", "Chief Complaint", "Doctor", "Follow-up", "Status", "Date Request", "action"]} />
                                                <tbody>
                                                    {Array.isArray(filteredConsults) && filteredConsults.map((c, i) => (
                                                        <tr key={i} className="group transition-all"
                                                            style={{ borderBottom: "1px solid #f4f6fb" }}
                                                            onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "#f8f9fc"}
                                                            onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "white"}>
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
                                                            {/* <td className="px-5 py-3.5 max-w-[180px]">
                                                                <p className="text-[12px] truncate" style={{ color: "#4a5568" }}>{c.consultation.assessment}</p>
                                                            </td> */}
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <p className="text-[12px]" style={{ color: "#6b7da0" }}>{c.consultationRequest.doctor.name}</p>
                                                            </td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                {c.consultation.follow_up_date ? (
                                                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-black"
                                                                        style={{ color: "#d97706" }}>
                                                                        <Clock size={10} />{formatDate(c.consultation.follow_up_date)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[11px]" style={{ color: "#c0ccd8" }}></span>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    <StatusBadge status={c.request.status as Status} />
                                                                    {c.request && (
                                                                        <span className="flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
                                                                            style={{ background: "#e0f4f4", color: "#0e7c7b" }}>
                                                                            <Pill size={8} /> Rx
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                                    <span className="text-[12px]" style={{ color: "#6b7da0" }}>{formatDate(c.request.req_date)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">

                                                                    <div className="transition-all duration-200 hover:scale-105 hover:-translate-y-0.5">
                                                                        <ActionBtn
                                                                            label="View"
                                                                            icon={Eye}
                                                                            onClick={() => [
                                                                                setSelectedConsultRecord(c),
                                                                                handleViewConsultation(
                                                                                    c.request.req_id,
                                                                                    mapConsultationRecordToForm(
                                                                                        c.consultation,
                                                                                        c.patient ?? undefined,
                                                                                        c.consultationRequest.cons_id
                                                                                    )
                                                                                ),
                                                                            ]}
                                                                        />
                                                                    </div>

                                                                    {c.prescription && c.patient && (
                                                                        <div className="transition-all duration-200 hover:scale-105 hover:-translate-y-0.5">
                                                                            <ActionBtn label="Rx" icon={Pill}
                                                                                onClick={() => [
                                                                                    setSelectedConsultRecord(c),
                                                                                    handleViewPrescription(
                                                                                        c.request.req_id,
                                                                                        mapPrescriptionRecordToForm(
                                                                                            c.prescription,
                                                                                            c.patient ?? undefined,
                                                                                        )
                                                                                    ),
                                                                                ]} />
                                                                        </div>
                                                                    )}

                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            totalEntries={totalEntries}
                                            calculateStartIndex={calculateStartIndex}
                                            calculateEndIndex={calculateEndIndex}
                                            setCurrentPage={setPage}
                                        />
                                    </div>
                                </>
                            )}

                            {/* ── PRESCRIPTIONS TABLE ── */}
                            {activeTab === "prescriptions" && (
                                <>
                                    <div className="overflow-x-auto min-h-[50vh]">
                                        {filteredRx?.length === 0 ? (
                                            <EmptyState icon={Pill} message="No prescription records match your search." />
                                        ) : (
                                            <table className="w-full text-sm">
                                                <TableHead cols={["Patient", "Prescribed By", "Medicines", "Date Issued", "Status", "Date Request", "action"]} />
                                                <tbody>
                                                    {Array.isArray(filteredRx) && filteredRx.map((r, i) => (
                                                        <tr key={i} className="group transition-all"
                                                            style={{ borderBottom: "1px solid #f4f6fb" }}
                                                            onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "#f8f9fc"}
                                                            onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "white"}>
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
                                                                <p className="text-[12px]" style={{ color: "#6b7da0" }}>{r.consultation.doctor.name}</p>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span className="text-[11.5px] font-mono px-2 py-0.5 rounded-md"
                                                                    style={{ background: "#f4f6fb", color: "#6b7da0" }}>
                                                                    #{String(r.consultation.consultation_id).padStart(5, "0")}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                                    <span className="text-[12px]" style={{ color: "#6b7da0" }}>{formatDate(r.request.req_date)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5"><StatusBadge status={r.request.status as Status} /></td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                                    <span className="text-[12px]" style={{ color: "#6b7da0" }}>{formatDate(r.prescription.issued_date)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ActionBtn label="View" icon={Eye}
                                                                        onClick={() => [
                                                                            setSelectedRxRecord(r),
                                                                            handleViewPrescription(
                                                                                r.request.req_id,
                                                                                mapPrescriptionRecordToForm(
                                                                                    r.prescription,
                                                                                    r.patient ?? undefined,
                                                                                )
                                                                            ),
                                                                        ]} />
                                                                    <ActionBtn label="Print" icon={Printer} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            totalEntries={totalEntries}
                                            calculateStartIndex={calculateStartIndex}
                                            calculateEndIndex={calculateEndIndex}
                                            setCurrentPage={setPage}
                                        />
                                    </div>
                                </>
                            )}

                            {/* ── CERTIFICATES TABLE ── */}
                            {activeTab === "certificates" && (
                                <>
                                    <div className="overflow-x-auto min-h-[50vh]">
                                        {filteredCerts?.length === 0 ? (
                                            <EmptyState icon={FileCheck} message="No certificate records match your search." />
                                        ) : (
                                            <table className="w-full text-sm">
                                                <TableHead cols={["Patient", "Certificate Type", "Purpose", "Issued By", "Status", "Date Request", ""]} />
                                                <tbody>
                                                    {Array.isArray(filteredCerts) && filteredCerts.map((c, i) => (
                                                        <tr key={i} className="group transition-all"
                                                            style={{ borderBottom: "1px solid #f4f6fb" }}
                                                            onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "#f8f9fc"}
                                                            onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "white"}>
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
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                                    <span className="text-[12px]" style={{ color: "#6b7da0" }}>{formatDate(c.request.req_date)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ActionBtn label="View" icon={Eye}
                                                                        onClick={() => [
                                                                            setSelectedCertificateRecord(c),
                                                                            handleViewMedCert(
                                                                                c.request.req_id,
                                                                                mapMedCertRecordToForm(
                                                                                    c.certificate,
                                                                                    c.patient ?? undefined,
                                                                                )
                                                                            ),
                                                                        ]} />
                                                                    <ActionBtn label="Print" icon={Printer} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            totalEntries={totalEntries}
                                            calculateStartIndex={calculateStartIndex}
                                            calculateEndIndex={calculateEndIndex}
                                            setCurrentPage={setPage}
                                        />
                                    </div>
                                </>
                            )}

                            {/* ── LABORATORY TABLE ── */}
                            {activeTab === "laboratory" && (
                                <>
                                    <div className="overflow-x-auto min-h-[50vh]">
                                        {filteredlabs?.length === 0 ? (
                                            <EmptyState
                                                icon={TestTube2}
                                                message="No laboratory records match your search."
                                            />
                                        ) : (
                                            <table className="w-full text-sm">
                                                <TableHead cols={["Patient", "Request Code", "Tests", "Progress", "Requested By", "Status", "Date Request", "",]}
                                                />
                                                <tbody>
                                                    {Array.isArray(filteredlabs) && filteredlabs.map((lab, i) => {
                                                        return (
                                                            <tr
                                                                key={i}
                                                                className="group transition-all"
                                                                style={{ borderBottom: "1px solid #f4f6fb" }}
                                                                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "#f8f9fc"}
                                                                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "white"}
                                                            >
                                                                {/* Patient */}
                                                                <td className="px-5 py-3.5">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div
                                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                                            style={{
                                                                                background: "#eef6ff",
                                                                                color: "#2563eb",
                                                                            }}
                                                                        >
                                                                            {lab.patient.name
                                                                                .split(" ")
                                                                                .map((n) => n[0])
                                                                                .slice(0, 2)
                                                                                .join("")}
                                                                        </div>

                                                                        <div>
                                                                            <p
                                                                                className="font-semibold text-[13px]"
                                                                                style={{
                                                                                    color: "#1a2a45",
                                                                                }}
                                                                            >
                                                                                {lab.patient.name}
                                                                            </p>

                                                                            <p
                                                                                className="text-[10.5px]"
                                                                                style={{
                                                                                    color: "#8a99b8",
                                                                                }}
                                                                            >
                                                                                {lab.patient.patient_code}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                {/* Request Code */}
                                                                <td className="px-5 py-3.5">
                                                                    <p
                                                                        className="text-[12px] font-medium"
                                                                        style={{
                                                                            color: "#1a2a45",
                                                                        }}
                                                                    >
                                                                        {lab.request.request_code}
                                                                    </p>
                                                                </td>

                                                                {/* Tests */}
                                                                <td className="px-5 py-3.5 max-w-[250px]">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {(lab.tests ?? []).slice(0, 3).map((test) => {

                                                                            return (
                                                                                <span
                                                                                    key={test.item_id}
                                                                                    className="px-2 py-1 rounded-full text-[10px] text-slate-700"
                                                                                    style={{
                                                                                        background: "#f3f4f6",
                                                                                    }}
                                                                                >
                                                                                    {test.test.name}
                                                                                </span>
                                                                            );
                                                                        })}

                                                                        {(lab.tests?.length ?? 0) > 3 && (
                                                                            <span
                                                                                className="px-2 py-1 rounded-full text-[10px]"
                                                                                style={{
                                                                                    background:
                                                                                        "#f3f4f6",
                                                                                }}
                                                                            >
                                                                                +{lab.tests.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                {/* Progress */}
                                                                <td className="px-5 py-3.5">
                                                                    <p
                                                                        className="text-[12px]"
                                                                        style={{
                                                                            color: "#6b7da0",
                                                                        }}
                                                                    >
                                                                        {lab.lab.completedTests}
                                                                        /
                                                                        {lab.lab.totalTests}
                                                                    </p>
                                                                </td>

                                                                {/* Requested By */}
                                                                <td className="px-5 py-3.5">
                                                                    <p
                                                                        className="text-[12px]"
                                                                        style={{
                                                                            color: "#6b7da0",
                                                                        }}
                                                                    >
                                                                        {lab.lab.requestedBy}
                                                                    </p>
                                                                </td>

                                                                {/* Status */}
                                                                <td className="px-5 py-3.5">
                                                                    <StatusBadge
                                                                        status={
                                                                            lab.request.status as Status
                                                                        }
                                                                    />
                                                                </td>

                                                                {/* Date */}
                                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Calendar
                                                                            size={11}
                                                                            style={{
                                                                                color:
                                                                                    "#c0ccd8",
                                                                            }}
                                                                        />

                                                                        <span
                                                                            className="text-[12px]"
                                                                            style={{
                                                                                color:
                                                                                    "#6b7da0",
                                                                            }}
                                                                        >
                                                                            {formatDate(
                                                                                lab.request.req_date
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </td>

                                                                {/* Actions */}
                                                                <td className="px-5 py-3.5">
                                                                    <div
                                                                        className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <ActionBtn
                                                                            label="View"
                                                                            icon={Eye}
                                                                            onClick={() => {
                                                                                setSelectedLaboratoryRecord(lab);

                                                                                handleViewLaboratory(
                                                                                    lab.request.req_id,

                                                                                );
                                                                            }}
                                                                        />

                                                                        <ActionBtn
                                                                            label="Print"
                                                                            icon={Printer}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            totalEntries={totalEntries}
                                            calculateStartIndex={calculateStartIndex}
                                            calculateEndIndex={calculateEndIndex}
                                            setCurrentPage={setPage}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
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
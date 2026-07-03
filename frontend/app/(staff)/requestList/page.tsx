"use client";

import { useState, useCallback, useEffect } from "react";
import RoleGuard from "@/guards/RoleGuard";
import {
    Search, SlidersHorizontal, RefreshCw, Stethoscope,
    TestTube2, FileText, ChevronRight, X, Pencil,
    Trash2, Ban, Calendar, CheckCircle2, Clock,
    XCircle, Filter,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { useGetAllRequests, useDeleteRequest } from "@/hooks/Patient/usePatientRegistration";
import { RequestProps } from "@/types/RequestTypes";
import { Status } from "@/types/ConsultationTypes";
import SweetAlert from "@/utils/SweetAlert";
import Pagination from "@/components/Pagination";
import Button from "@/components/ui/Button";
import { useRequestAction } from "@/hooks/Consultation/useConsultation";
import ModalHeader from "@/components/Modal/ModalHeader";
import ConsultationRequestModal from "@/components/Modal/ChildModal/ConsultationRequestModal";
import LaboratoryRequestModal from "@/components/Modal/ChildModal/LaboratoryRequestModal";
import CertificateRequestModal from "@/components/Modal/ChildModal/CertificateRequestModal";
import SummaryCards from "@/components/ui/SummaryCards";
import ConsultationRequestViewModal from "@/components/Modal/ChildModal/ConsultationRequestViewModal";
import LaboratoryRequestViewModal from "@/components/Modal/ChildModal/LaboratoryRequestViewModal";
import CertificateRequestViewModal from "@/components/Modal/ChildModal/CertificateRequestViewModal";

// ── Types ──────────────────────────────────────────────────────────────────

type SortKey = "date_desc" | "date_asc" | "patient_asc";

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; bar: string }> = {
    CONSULTATION: { label: "Consultation", icon: Stethoscope, color: "#0f2244", bg: "#eef1f9", bar: "#0f2244" },
    CERTIFICATE: { label: "Certificate", icon: FileText, color: "#0e7c7b", bg: "#e0f4f4", bar: "#0e7c7b" },
    LABORATORY: { label: "Laboratory", icon: TestTube2, color: "#7c4dab", bg: "#f3eefb", bar: "#7c4dab" },
};

const STATUS_META: Record<string, { label: string, dot: string, text: string, bg: string }> = {
    REQUESTED: { label: "Requested", dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", },
    PAYMENT: { label: "For Payment", dot: "#2563eb", text: "#1d4ed8", bg: "#eff6ff", },
    CONSULTATION: { label: "Consultation", dot: "#0891b2", text: "#155e75", bg: "#ecfeff", },
    LABORATORY: { label: "Laboratory", dot: "#7c3aed", text: "#5b21b6", bg: "#f5f3ff", },
    CERTIFICATION: { label: "Certification", dot: "#9333ea", text: "#6b21a8", bg: "#faf5ff", },
    DONE: { label: "Completed", dot: "#22c55e", text: "#166534", bg: "#f0fdf4", },
    CANCELED: { label: "Cancelled", dot: "#94a3b8", text: "#475569", bg: "#f1f5f9", },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden ${className}`}
            style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.08), 0 8px 24px rgba(15,34,68,0.05)" }}
        >
            {children}
        </div>
    );
}

function CardLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#8a99b8" }}>
            {children}
        </p>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const m = STATUS_META[status] ?? STATUS_META.REQUESTED;

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
            style={{
                background: m.bg,
                color: m.text,
            }}
        >
            <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{
                    background: m.dot,
                    boxShadow:
                        status === "PAYMENT"
                            ? `0 0 0 2px ${m.dot}44`
                            : "none",
                }}
            />
            {m.label}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    const m = TYPE_META[type] ?? TYPE_META.CONSULTATION;
    const Icon = m.icon;
    return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.color }}>
            <Icon size={10} />
            {m.label}
        </span>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const RequestsManagement = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);
    const [typeFilters, setTypeFilters] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("date_desc");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestProps | null>(null);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<string>('');
    const [modalView, setModalView] = useState<boolean>(false);
    const [modalEdit, setModalEdit] = useState<boolean>(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [totalEntries, setTotalEntries] = useState(0);
    const { mutateAsync: requestAction } = useRequestAction();
    const { mutateAsync: deleteRequestMutation } = useDeleteRequest();
    const { data, isLoading, refetch } = useGetAllRequests({
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: statusFilter,
        type: typeFilters,
        sort: sortKey,
        dateFrom,
        dateTo,
    });

    const requests = data?.data ?? [];
    const stats = data?.stats;
    const meta = data?.pagination;

    // TOTAL PAGES
    const totalPages =
        meta?.totalPages ?? 1;

    // SYNC TOTAL ENTRIES
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTotalEntries(
            meta?.total ?? 0
        );
    }, [meta]);

    // START INDEX
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

    const activeFiltersCount = [
        typeFilters !== "ALL",
        statusFilter !== "ALL",
        !!dateFrom,
        !!dateTo,
    ].filter(Boolean).length;

    const clearFilters = () => {
        setTypeFilters("ALL");
        setStatusFilter("ALL");
        setDateFrom("");
        setDateTo("");
    };

    const handleEdit = useCallback((r: RequestProps, type: string) => {
        setIsOpenModal(true);
        setSelectedRequest(r);
        setModalType(type);
        setModalEdit(true);
    }, []);

    const handleView = useCallback((r: RequestProps, type: string) => {
        setIsOpenModal(true);
        setSelectedRequest(r);
        setModalType(type);
        setModalView(true)
    }, []);

    const handleDelete = async (r: RequestProps) => {

        const confirmed = await SweetAlert.confirmationAlert2(
            "Delete Request?",
            `This will permanently delete request #${r.req_id}. This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteRequestMutation(r.req_id);
            setSelectedRequest(null);

        } catch (error) {
            SweetAlert.errorAlert("Failed to delete request.");
            console.error(error);
        }
    }

    // Counts for summary chips
    const waitingCount = stats?.waiting ?? 0;
    const servingCount = stats?.serving ?? 0;
    const doneCount = stats?.done ?? 0;
    const canceledCount = stats?.cancelled ?? 0;

    const currentPatient = selectedRequest?.patient;
    const currentVitals = selectedRequest?.consult?.vitals;

    // console.log('asd', data);

    const SUMMARY = [
        { label: "Waiting", value: waitingCount, color: "#92400e", bg: "#fffbeb", icon: Clock },
        { label: "In Progress", value: servingCount, color: "#065050", bg: "#e0f4f4", icon: CheckCircle2 },
        { label: "Done", value: doneCount, color: "#166534", bg: "#f0fdf4", icon: CheckCircle2 },
        { label: "Cancelled", value: canceledCount, color: "#475569", bg: "#f1f5f9", icon: XCircle },
    ];

    const handleRequestAction = async (
        request_id: number,
        status: Status,
    ) => {

        let confirmed = false;
        if (status === 'CANCELED') {
            confirmed = await SweetAlert.confirmationAlert2(
                "Cancel Request?",
                `This will mark request #${request_id} as cancelled.`
            );
        } else {
            confirmed = await SweetAlert.confirmationAlert2(
                "Delete Request?",
                `This will permanently delete request #${request_id}. This cannot be undone.`
            );
        }

        if (!confirmed) return;

        await requestAction({ request_id, status });
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setModalType('');
        setModalEdit(false);
        setModalView(false);
    };

    const canModifyRequest = (request: RequestProps) => {
        if (request.status !== "WAITING") {
            return false;
        }

        switch (request.req_type) {
            case "LABORATORY":
                return request.workflowStatus === "PAYMENT";

            case "CONSULTATION":
            case "CERTIFICATE":
                return request.workflowStatus === "REQUESTED";

            default:
                return false;
        }
    };

    return (
        <RoleGuard allowedRoles={["ADMIN", "STAFF", "DOCTOR", "ADMIN"]}>

            {isOpenModal && currentPatient && modalType === 'CONSULTATION' && modalEdit && (
                <ModalHeader
                    showModal={isOpenModal}
                    title={`Medical Consultation Request — ${currentPatient?.name}`}
                    subtitle=""
                    meta={`${selectedRequest?.req_id} - ${currentPatient?.patient_id}`}
                    sizeModal="2xlarge"
                    onClose={closeModal}>
                    <ConsultationRequestModal request={selectedRequest} patient={currentPatient} vitals={currentVitals} onClose={closeModal} />
                </ModalHeader>
            )}

            {isOpenModal && currentPatient && modalType === 'LABORATORY' && modalEdit && (
                <ModalHeader
                    showModal={isOpenModal}
                    title={`Laboratory Test Request — ${currentPatient?.name}`}
                    subtitle=""
                    meta={`${selectedRequest?.req_id} - ${currentPatient?.patient_id}`}
                    sizeModal="2xlarge"
                    onClose={closeModal}>
                    <LaboratoryRequestModal request={selectedRequest} isEditMode={true} patient={currentPatient} onClose={closeModal} />
                </ModalHeader>
            )}

            {isOpenModal && currentPatient && modalType === 'CERTIFICATE' && modalEdit && (
                <ModalHeader
                    showModal={isOpenModal}
                    title={`Medical Certificate Request — ${currentPatient?.name}`}
                    subtitle=""
                    meta={`${selectedRequest?.req_id} - ${currentPatient?.patient_id}`}
                    sizeModal="2xlarge"
                    onClose={closeModal}>
                    <CertificateRequestModal request={selectedRequest} patient={currentPatient} onClose={closeModal} />
                </ModalHeader>
            )}

            {/* View Modals */}

            {isOpenModal && currentPatient && modalType === 'CONSULTATION' && modalView && (
                <ModalHeader
                    showModal={isOpenModal}
                    title={`Medical Consultation Request — ${currentPatient?.name}`}
                    subtitle="Review consultation details, patient information, and physician recommendations."
                    meta={`${selectedRequest?.req_id} - ${currentPatient?.patient_id}`}
                    sizeModal="large"
                    onClose={closeModal}>
                    <ConsultationRequestViewModal request={selectedRequest} patient={currentPatient} vitals={currentVitals} onClose={closeModal} />
                </ModalHeader>
            )}

            {isOpenModal && currentPatient && modalType === 'LABORATORY' && modalView && (
                <ModalHeader
                    showModal={isOpenModal}
                    title={`Laboratory Test Request — ${currentPatient?.name}`}
                    subtitle="Review requested laboratory procedures, test information, and patient details."
                    meta={`${selectedRequest?.req_id} - ${currentPatient?.patient_id}`}
                    sizeModal="large"
                    onClose={closeModal}>
                    <LaboratoryRequestViewModal request={selectedRequest} patient={currentPatient} onClose={closeModal} />
                </ModalHeader>
            )}

            {isOpenModal && currentPatient && modalType === 'CERTIFICATE' && modalView && (
                <ModalHeader
                    showModal={isOpenModal}
                    title={`Medical Certificate Request — ${currentPatient?.name}`}
                    subtitle="Review certificate request details, medical findings, and issuance information."
                    meta={`${selectedRequest?.req_id} - ${currentPatient?.patient_id}`}
                    sizeModal="large"
                    onClose={closeModal}>
                    <CertificateRequestViewModal request={selectedRequest} patient={currentPatient} onClose={closeModal} />
                </ModalHeader>
            )}

            <div
                className="min-h-screen font-['DM_Sans']"
                style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}
            >
                {/* ── Page header ── */}
                <div className="border-b border-white/10 px-8 py-6">
                    <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide mb-1">
                        Request Management
                    </h1>
                    <p className="text-black/60 text-sm">View, edit, cancel, and manage all patient requests</p>
                </div>

                <div className="px-8 py-2 space-y-5">

                    {/* ── Summary chips ── */}
                    <SummaryCards items={SUMMARY}></SummaryCards>

                    {/* ── Main area ── */}
                    <div className="grid grid-cols-1 gap-3">

                        {/* ── Table card ── */}
                        <Card>
                            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #0f2244 33%, #0e7c7b 66%, #7c4dab 100%)" }} />

                            {/* Toolbar */}
                            <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
                                style={{ borderBottom: "1px solid #f0f3fa" }}>
                                <div>
                                    <CardLabel>All Requests</CardLabel>
                                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>
                                        {requests.length} records
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
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
                                    {/* Search */}
                                    <div className="relative">
                                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                                        <input
                                            type="text"
                                            placeholder="Search patient, ID…"
                                            value={search}
                                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                            className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                                            style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "185px" }}
                                        />
                                    </div>

                                    {/* Sort */}
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

                                    {/* Filters toggle */}
                                    <button
                                        onClick={() => setShowFilters((v) => !v)}
                                        className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                                        style={{
                                            background: showFilters ? "#0f2244" : "#f4f6fb",
                                            color: showFilters ? "white" : "#1a2a45",
                                            border: "1.5px solid " + (showFilters ? "#0f2244" : "#dce3ef"),
                                        }}
                                    >
                                        <SlidersHorizontal size={12} /> Filters
                                        {activeFiltersCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                                                style={{ background: "#c8102e" }}>
                                                {activeFiltersCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Refresh */}
                                    <button
                                        onClick={() => void refetch()}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#6b7da0" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}
                                    >
                                        <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>

                            {/* Filter drawer */}
                            {showFilters && (
                                <div className="px-5 py-4 flex flex-wrap items-end gap-4"
                                    style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>

                                    {/* Type toggles */}
                                    <div>
                                        <CardLabel>Request Type</CardLabel>
                                        <div className="flex gap-2 mt-2">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>Type</label>
                                            <select value={typeFilters} onChange={(e) => setTypeFilters(e.target.value)}
                                                className="px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                                style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                                <option value="ALL">All Types</option>
                                                <option value="CONSULTATION">Consultation</option>
                                                <option value="LABORATORY">Laboratory</option>
                                                <option value="CERTIFICATE">Certificate</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status filter */}
                                    <div>
                                        <CardLabel>Status</CardLabel>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>Status</label>
                                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
                                                className="px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                                style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                                <option value="ALL">All Status</option>
                                                <option value="WAITING">Waiting</option>
                                                <option value="SERVING">Serving</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Clear */}
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={() => {
                                                clearFilters();
                                            }}
                                            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl"
                                            style={{
                                                background: "#fdf0f2",
                                                color: "#c8102e"
                                            }}
                                        >
                                            <X size={10} /> Clear
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "580px" }}>
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                                            {["# | Request Code", "Patient", "Type", "Request Date", "Status", "Actions"].map((h) => (
                                                <th key={h}
                                                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                                                    style={{ color: "#8a99b8" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <RefreshCw size={22} className="animate-spin" style={{ color: "#b0bcd4" }} />
                                                        <p className="text-[12px]" style={{ color: "#8a99b8" }}>Loading requests…</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : requests.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center">
                                                    <Filter size={26} className="mx-auto mb-2" style={{ color: "#c0ccd8" }} />
                                                    <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No requests found</p>
                                                    <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>Try adjusting your filters or search</p>
                                                </td>
                                            </tr>
                                        ) : requests.map((r: RequestProps, i: number) => {
                                            const typeMeta = TYPE_META[r.req_type] ?? TYPE_META.CONSULTATION;
                                            const isSelected = selectedRequest?.req_id === r.req_id;

                                            return (
                                                <tr
                                                    key={r.req_id}
                                                    className="group transition-all cursor-pointer"
                                                    style={{
                                                        borderBottom: "1px solid #f4f6fb",
                                                        background: isSelected ? "rgba(14,124,123,0.05)" : "white",
                                                    }}
                                                    onClick={() => setSelectedRequest(isSelected ? null : r)}
                                                >
                                                    {/* # */}
                                                    <td className="px-10 py-3.5">
                                                        <span className="text-[11px] font-mono text-nowrap" style={{ color: "#030e1a" }}>
                                                            {(page - 1) * rowsPerPage + i + 1} : {r.request_code}
                                                        </span>
                                                    </td>

                                                    {/* Patient */}
                                                    <td className="px-10 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                                style={{
                                                                    background: isSelected ? typeMeta.bg : "#eef1f9",
                                                                    color: isSelected ? typeMeta.color : "#0f2244",
                                                                }}
                                                            >
                                                                {r.patient?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-[12.5px]" style={{ color: "#1a2a45" }}>
                                                                    {r.patient?.name}
                                                                </p>
                                                                <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>
                                                                    {r.patient?.age}y · {r.patient?.sex}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Type */}
                                                    <td className="px-10 py-3.5">
                                                        <TypeBadge type={r.req_type} />
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-10 py-3.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={10} style={{ color: "#c0ccd8" }} />
                                                            <span className="text-[11.5px] whitespace-nowrap" style={{ color: "#6b7da0" }}>
                                                                {new Date(r.req_date).toLocaleDateString("en-PH", {
                                                                    month: "short", day: "numeric", year: "numeric",
                                                                })}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3.5 text-nowrap">
                                                        <StatusBadge status={r.workflowStatus} />
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3">
                                                        {canModifyRequest(r) ? (
                                                            <div
                                                                className="flex items-center gap-1.5"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Button
                                                                    variant="acceptRequest"
                                                                    icon={<Pencil size={20} />}
                                                                    className="!text-[10px] !px-2 !py-1 !rounded-lg"
                                                                    onClick={() => handleEdit(r, r.req_type)}
                                                                >
                                                                    Edit
                                                                </Button>

                                                                <Button
                                                                    variant="declineRequest"
                                                                    icon={<Ban size={20} />}
                                                                    className="!text-[10px] !px-2 !py-1 !rounded-lg"
                                                                    onClick={() => handleRequestAction(r.req_id, "CANCELED")}
                                                                >
                                                                    Decline
                                                                </Button>

                                                                <Button
                                                                    variant="deleteRequest"
                                                                    icon={<Trash2 size={20} />}
                                                                    className="!text-[10px] !px-2 !py-1 !rounded-lg"
                                                                    onClick={() => handleDelete(r)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant="secondary"
                                                            className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                                            style={{ color: "#0f2244" }}
                                                            onClick={() => [handleView(r, r.req_type)]}
                                                        >
                                                            View <ChevronRight size={11} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalEntries={totalEntries}
                                calculateStartIndex={calculateStartIndex}
                                calculateEndIndex={calculateEndIndex}
                                setCurrentPage={setPage}
                            />
                        </Card>

                        {/* ── Detail drawer ── */}
                        {/* <div>
                            {selectedRequest ? (
                                <RequestDetailDrawer
                                    request={selectedRequest}
                                    onClose={() => setSelectedRequest(null)}
                                    onEdit={handleEdit}
                                    onCancel={handleCancel}
                                    onDelete={handleDelete}
                                />
                            ) : (
                                <Card className="sticky top-6">
                                    <div className="h-[3px]" style={{ background: "#dce3ef" }} />
                                    <div className="p-8 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                                            style={{ background: "#f0f3fa" }}>
                                            <ClipboardList size={20} style={{ color: "#c0ccd8" }} />
                                        </div>
                                        <p className="text-sm font-semibold" style={{ color: "#8a99b8" }}>No request selected</p>
                                        <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>
                                            Click any row to view details and actions
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </div> */}

                    </div>
                </div>
            </div>
        </RoleGuard>
    );
};

export default RequestsManagement;
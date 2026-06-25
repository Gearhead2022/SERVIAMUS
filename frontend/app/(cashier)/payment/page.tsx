"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/guards/RoleGuard";
import {
    Search, CheckCircle2, Clock, TrendingUp, FileText,
    ChevronRight, SlidersHorizontal, X, CreditCard,
    Banknote, Smartphone, Building2, Calendar, Filter, AlertCircle, RefreshCw
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { useGetAllPayment } from "@/hooks/Billing/useBilling";
import { PaymentRecord, PaymentMethod, PaymentStatus, SortKey } from "@/types/BillingTypes";
import PaymentDetailModal from "@/components/Modal/ChildModal/PaymentDatailModal";
import Pagination from "@/components/Pagination";
import { getApiErrorMessage } from "@/utils/api-error";
import ReceiptModal from "@/components/Modal/ReceiptModal";
import SummaryCards from "@/components/ui/SummaryCards";

// ── Constants ──────────────────────────────────────────────────────────────

const METHOD_META: Record<PaymentMethod, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    CASH: { label: "Cash", icon: Banknote, color: "#166534", bg: "#f0fdf4" },
    GCASH: { label: "GCash", icon: Smartphone, color: "#1d4ed8", bg: "#eff6ff" },
    CARD: { label: "Card", icon: CreditCard, color: "#7c4dab", bg: "#f3eefb" },
    BANK_TRANSFER: { label: "Bank Transfer", icon: Building2, color: "#0e7c7b", bg: "#e0f4f4" },
};

const STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string; dot: string }> = {
    PAID: { label: "Paid", color: "#065050", bg: "#e0f4f4", dot: "#0e7c7b" },
    REFUNDED: { label: "Refunded", color: "#92400e", bg: "#fffbeb", dot: "#f59e0b" },
    VOIDED: { label: "Voided", color: "#475569", bg: "#f1f5f9", dot: "#94a3b8" },
};

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
    CONSULTATION: { color: "#0f2244", bg: "#eef1f9" },
    LABORATORY: { color: "#7c4dab", bg: "#f3eefb" },
    CERTIFICATE: { color: "#0e7c7b", bg: "#e0f4f4" },
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

function StatusBadge({ status }: { status: PaymentStatus }) {
    const m = STATUS_META[status];
    return (
        <span
            className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
            {m.label}
        </span>
    );
}

function MethodBadge({ method }: { method: PaymentMethod }) {
    const m = METHOD_META[method];
    const Icon = m.icon;
    return (
        <span
            className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.color }}
        >
            <Icon size={10} />
            {m.label}
        </span>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────

const PaymentHistory = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);
    const [methodFilter, setMethodFilter] = useState<PaymentMethod | "ALL">("ALL");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [totalEntries, setTotalEntries] = useState(0);
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("date_desc");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showPaymentDetailModal, setShowPaymentDetailModal] = useState<boolean>(false);
    const [showReceipt, setShowReceipt] = useState<boolean>(false);

    const { data, error: PaymentError, isLoading: PaymentLoading } = useGetAllPayment({
        page,
        search: debouncedSearch,
        status: statusFilter,
        limit: rowsPerPage,
        method: methodFilter,
        type: typeFilter,
        sort: sortKey,
        dateFrom,
        dateTo,
    });

    const paymentData = data?.data ?? [];
    const meta = data?.pagination;
    const totalPages = meta?.totalPages ?? 1;
    const stats = data?.stats;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTotalEntries(meta?.total ?? 0);
    }, [meta]);

    const calculateStartIndex = () => totalEntries === 0 ? 0 : (page - 1) * rowsPerPage + 1;
    const calculateEndIndex = () => Math.min(page * rowsPerPage, totalEntries);

    const activeFiltersCount = [
        methodFilter !== "ALL",
        typeFilter !== "ALL",
        statusFilter !== "ALL",
        !!dateFrom,
        !!dateTo,
    ].filter(Boolean).length;

    const clearFilters = () => {
        setMethodFilter("ALL");
        setTypeFilter("ALL");
        setStatusFilter("ALL");
        setDateFrom("");
        setDateTo("");
    };

    // STATS

    const STATS = [
        {
            label: "Total Transactions",
            value: stats?.total ?? 0,
            icon: FileText,
            color: "#0f2244",
            bg: "#eef1f9",
            bar: "#0f2244",
        },
        {
            label: "Paid",
            value: stats?.completed ?? 0,
            icon: CheckCircle2,
            color: "#0e7c7b",
            bg: "#e0f4f4",
            bar: "#0e7c7b",
        },
        {
            label: "Refunded / Voided",
            value:
                (stats?.total ?? 0) -
                (stats?.completed ?? 0),
            icon: Clock,
            color: "#c8102e",
            bg: "#fdf0f2",
            bar: "#c8102e",
        },
        {
            label: "Total Revenue",
            value: `₱${(
                stats?.revenue ?? 0
            ).toLocaleString()}`,
            icon: TrendingUp,
            color: "#7c4dab",
            bg: "#f3eefb",
            bar: "#7c4dab",
        },
    ];

    const HandleActionButton = (payment: PaymentRecord) => {
        setShowPaymentDetailModal(true);
        setSelectedPayment(payment)
    }

    const HandleCloseModal = () => {
        setShowPaymentDetailModal(true);
        setSelectedPayment(null)
    }


    const resetAll = () => {
        setShowPaymentDetailModal(false);
        setSelectedPayment(null);
        setShowReceipt(false);
    };

    return (
        <RoleGuard allowedRoles={["CASHIER", "ADMIN"]}>
            {/* ── Preview modal ── */}
            {selectedPayment && showPaymentDetailModal && (
                <PaymentDetailModal
                    setViewReceipt={setShowReceipt}
                    payment={selectedPayment}
                    onClose={HandleCloseModal}
                />
            )}

            {/* ── Receipt modal ── */}
            {selectedPayment && showReceipt ? (
                <ReceiptModal
                    billingCode={selectedPayment?.billingCode}
                    patientName={selectedPayment.patientName}
                    patientCode={selectedPayment.patientCode}
                    requestType={selectedPayment.billing.requestType}
                    requestedBy={selectedPayment.requestedBy}
                    requestedDate={selectedPayment.requestedDate}
                    breakdown={selectedPayment.billing.breakdown}
                    subtotal={selectedPayment.billing.totalPrice}
                    discount={selectedPayment.billing.discount}
                    amountPaid={selectedPayment.amount}
                    paymentMethod={selectedPayment.billing.paymentMethod ?? "CASH"}
                    referenceNo={selectedPayment.referenceNo}
                    paidAt={selectedPayment.paidAt}
                    onClose={resetAll}
                />
            ) : null}

            <div
                className="min-h-screen font-['DM_Sans']"
                style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}
            >
                {/* ── Page header ── */}
                <div className="border-b border-white/10 px-8 py-5">
                    <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide mb-1">
                        Payment History
                    </h1>
                    <p className="text-black/60 text-sm">Browse and filter all completed payment transactions</p>
                </div>

                <div className="px-8 py-2 space-y-5">

                    {/* ── Stats row ── */}
                    <SummaryCards
                        items={STATS}
                    />

                    {/* ── Main area ── */}
                    <div className="grid grid-cols-1 gap-5">

                        {/* ── Transaction table ── */}
                        <Card>
                            <div className="h-[3px]" style={{ background: "#0f2244" }} />

                            {/* Table toolbar */}
                            <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
                                style={{ borderBottom: "1px solid #f0f3fa" }}>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#8a99b8" }}>
                                        Transactions
                                    </p>
                                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>
                                        {Filter.length} records found
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Rows per page */}
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                        className="px-3 py-2 text-xs rounded-xl outline-none"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}
                                    >
                                        {[10, 25, 50, 100].map((n) => (
                                            <option key={n} value={n}>{n} / page</option>
                                        ))}
                                    </select>
                                    {/* Search */}
                                    <div className="relative">
                                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                                        <input
                                            type="text"
                                            placeholder="Patient, bill code…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                                            style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "180px" }}
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
                                        <option value="amount_desc">Highest amount</option>
                                        <option value="amount_asc">Lowest amount</option>
                                    </select>

                                    {/* Filter toggle */}
                                    <button
                                        onClick={() => setShowFilters((v) => !v)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors relative"
                                        style={{
                                            background: showFilters ? "#0f2244" : "#f4f6fb",
                                            color: showFilters ? "white" : "#1a2a45",
                                            border: "1.5px solid " + (showFilters ? "#0f2244" : "#dce3ef"),
                                        }}
                                    >
                                        <SlidersHorizontal size={12} /> Filters
                                        {activeFiltersCount > 0 && (
                                            <span
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                                                style={{ background: "#c8102e" }}
                                            >
                                                {activeFiltersCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Filter drawer */}
                            {showFilters && (
                                <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-5 gap-3"
                                    style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>Method</label>
                                        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | "ALL")}
                                            className="px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                            <option value="ALL">All Methods</option>
                                            <option value="CASH">Cash</option>
                                            <option value="GCASH">GCash</option>
                                            <option value="CARD">Card</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>Type</label>
                                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                            className="px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                            <option value="ALL">All Types</option>
                                            <option value="CONSULTATION">Consultation</option>
                                            <option value="LABORATORY">Laboratory</option>
                                            <option value="CERTIFICATE">Certificate</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>Status</label>
                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "ALL")}
                                            className="px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }}>
                                            <option value="ALL">All Status</option>
                                            <option value="PAID">Paid</option>
                                            <option value="REFUNDED">Refunded</option>
                                            <option value="VOIDED">Voided</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>From</label>
                                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                                            className="px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>To</label>
                                        <div className="flex gap-1.5">
                                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                                                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg outline-none"
                                                style={{ background: "white", border: "1.5px solid #dce3ef", color: "#1a2a45" }} />
                                            {activeFiltersCount > 0 && (
                                                <button onClick={clearFilters}
                                                    className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                                    style={{ background: "#fdf0f2", color: "#c8102e" }}>
                                                    <X size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto overflow-y-auto" style={{ minHeight: "480px", maxHeight: "580px" }}>
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                                            {["Bill Code", "Patient", "Type", "Method", "Amount", "Date", "Status", ""].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                                                    style={{ color: "#8a99b8" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PaymentLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-14 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <RefreshCw size={22} className="animate-spin" style={{ color: "#b0bcd4" }} />
                                                        <p className="text-[12px]" style={{ color: "#8a99b8" }}>Loading Payments…</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : PaymentError ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-14 text-center">
                                                    <AlertCircle size={28} className="mx-auto mb-2" style={{ color: "#c8102e" }} />
                                                    <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>Unable to load records</p>
                                                    <p className="text-xs mt-1" style={{ color: "#6b7da0" }}>
                                                        {getApiErrorMessage(PaymentError, "Please try refreshing.")}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : paymentData.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-40 text-center">
                                                    <Filter size={28} className="mx-auto mb-2" style={{ color: "#c0ccd8" }} />
                                                    <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No transactions match your filters</p>
                                                    <button onClick={clearFilters} className="text-xs mt-2 font-semibold" style={{ color: "#0e7c7b" }}>
                                                        Clear all filters
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : paymentData.map((p) => {
                                            const net = p.amount - p.discount;
                                            const typeStyle = TYPE_COLORS[p.requestType] ?? { color: "#0f2244", bg: "#eef1f9" };
                                            const isSelected = selectedPayment?.paymentId === p.paymentId;
                                            return (
                                                <tr
                                                    key={p.paymentId}
                                                    onClick={() => HandleActionButton(p)}
                                                    className={`${isSelected ? 'bg-blue-900/20' : ''} group cursor-pointer hover:bg-blue-900/10 hover:text-white bg-white-100 transition-all`}
                                                >
                                                    {/* Bill code */}
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-[12px] font-semibold" style={{ color: "#0f2244" }}>
                                                            {p.billingCode}
                                                        </span>
                                                    </td>

                                                    {/* Patient */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                                style={{ background: "#eef1f9", color: "#0f2244" }}>
                                                                {p.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-[12.5px] whitespace-nowrap" style={{ color: "#1a2a45" }}>{p.patientName}</p>
                                                                <p className="text-[10px]" style={{ color: "#8a99b8" }}>#{p.patientCode}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Type */}
                                                    <td className="px-4 py-3">
                                                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                                                            style={{ background: typeStyle.bg, color: typeStyle.color }}>
                                                            {p.requestType}
                                                        </span>
                                                    </td>

                                                    {/* Method */}
                                                    <td className="px-4 py-3">
                                                        <MethodBadge method={p.method} />
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-[13px]" style={{ color: "#0f2244" }}>
                                                            ₱{net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                                        </p>
                                                        {p.discount > 0 && (
                                                            <p className="text-[10px]" style={{ color: "#c8102e" }}>
                                                                -₱{p.discount.toFixed(2)} disc.
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={10} style={{ color: "#c0ccd8" }} />
                                                            <span className="text-[11px] whitespace-nowrap" style={{ color: "#6b7da0" }}>
                                                                {new Date(p.paidAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] mt-0.5 pl-3.5" style={{ color: "#b0bcd4" }}>
                                                            {new Date(p.paidAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={p.status} />
                                                    </td>

                                                    {/* View */}
                                                    <td className="px-4 py-3">
                                                        <span className="flex items-center gap-0.5 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                                            style={{ color: "#0f2244" }} onClick={() => HandleActionButton(p)}>
                                                            Details <ChevronRight size={11} />
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalEntries={totalEntries}
                                calculateStartIndex={calculateStartIndex}
                                calculateEndIndex={calculateEndIndex}
                                setCurrentPage={setPage}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
};

export default PaymentHistory;
"use client";

import { useState } from "react";
import {
    Search, ChevronDown, Edit2, Check,
    PackageCheck, Stethoscope, TestTube2, FileCheck, ToggleLeft, ToggleRight, Calendar, Hash, Ban,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import Pagination from "@/components/Pagination";
import RoleGuard from "@/guards/RoleGuard";
import SummaryCards from "@/components/ui/SummaryCards";
import { useGetAllServices } from "@/hooks/admin/useAdmin";
import { ServiceRecord } from "@/hooks/admin/useAdmin";
import EditServiceModal from "@/components/Modal/ChildModal/EditServicesModal";

// ── Shared style tokens ───────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    consultation: { label: "Consultation", color: "#0f2244", bg: "#eef1f9", icon: Stethoscope },
    laboratory: { label: "Laboratory", color: "#7c4dab", bg: "#f3eefb", icon: TestTube2 },
    certificate: { label: "Certificate", color: "#0e7c7b", bg: "#e0f4f4", icon: FileCheck },
    other: { label: "Other", color: "#6b7da0", bg: "#f0f3fa", icon: PackageCheck },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function TableHead({ cols }: { cols: string[] }) {
    return (
        <thead>
            <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                {cols.map((c) => (
                    <th key={c}
                        className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#8a99b8" }}>
                        {c}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function CategoryBadge({ category }: { category: string }) {
    const m = CATEGORY_META[category] ?? CATEGORY_META.other;
    const Icon = m.icon;
    return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.color }}>
            <Icon size={9} />
            {m.label}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#f0f3fa" }}>
                <PackageCheck size={24} style={{ color: "#c0ccd8" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No services found</p>
            <p className="text-[11px] mt-1 max-w-xs" style={{ color: "#b0bcd4" }}>{message}</p>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type CategoryFilter = "all" | "consultation" | "laboratory" | "certificate" | "other";
type StatusFilter = "all" | "active" | "inactive";

const ServicesManagementPage = () => {

    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortKey, setSortKey] = useState<"name_asc" | "name_desc" | "price_asc" | "price_desc" | "date_desc">("name_asc");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
    const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);

    const { data } = useGetAllServices({
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
        sort: sortKey,
    });

    const services = data?.data ?? [];
    const meta = data?.pagination;

    // ACTIVE META
    const activeMeta =
        data?.pagination;

    // TOTAL ENTRIES
    const totalEntries =
        activeMeta?.total ?? 0;

    const totalPages =
        meta?.totalPages ?? 1;

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

    // ── Stats ─────────────────────────────────────────────────────────────────

    const consultationServices =
        services.filter(
            (s: ServiceRecord) =>
                s.category?.toLowerCase() === "consultation"
        );

    const laboratoryServices =
        services.filter(
            (s: ServiceRecord) =>
                s.category?.toLowerCase() === "laboratory"
        );

    const consultationPrices =
        consultationServices.map(
            (s: ServiceRecord) => s.price
        );

    const consultationMinPrice =
        consultationPrices.length > 0
            ? Math.min(...consultationPrices)
            : 0;

    const consultationMaxPrice =
        consultationPrices.length > 0
            ? Math.max(...consultationPrices)
            : 0;

    const stats = [
        {
            label: "Total Services",
            value: services.length,
            sub: `${services.filter((s) => s.is_active).length} active`,
            icon: PackageCheck,
            color: "#0f2244",
            bg: "#eef1f9",
        },
        {
            label: "Consultations",
            value: consultationServices.length,
            sub: `₱${consultationMinPrice.toLocaleString()} – ₱${consultationMaxPrice.toLocaleString()}`,
            icon: Stethoscope,
            color: "#0f2244",
            bg: "#eef1f9",
        },
        {
            label: "Laboratory",
            value: laboratoryServices.length,
            sub: `${laboratoryServices.filter((s) => s.is_active).length} active`,
            icon: TestTube2,
            color: "#7c4dab",
            bg: "#f3eefb",
        },
        {
            label: "Inactive Services",
            value: services.filter((s) => !s.is_active).length,
            sub: "Disabled from billing",
            icon: Ban,
            color: "#c8102e",
            bg: "#fdf0f2",
        },
    ];

    function StatusToggle({
        active,
        loading,
    }: {
        active: boolean;
        loading?: boolean;
    }) {
        return (
            <button
                type="button"
                disabled={loading}
                className="flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full transition-all disabled:opacity-60"
                style={active
                    ? { background: "#e0f4f4", color: "#065050" }
                    : { background: "#f1f5f9", color: "#64748b" }
                }
            >
                {active
                    ? <ToggleRight size={13} style={{ color: "#0e7c7b" }} />
                    : <ToggleLeft size={13} style={{ color: "#94a3b8" }} />
                }
                {active ? "Active" : "Inactive"}
            </button>
        );
    }

    const HandleCloseModal = () => {
        setShowServiceModal(false);
        setSelectedService(null)
    }

    const HandleActionButton = (service: ServiceRecord) => {
        setSelectedService(service);
        setShowServiceModal(true);
    }

    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            {showServiceModal && selectedService && (
                <EditServiceModal
                    service={selectedService}
                    onClose={HandleCloseModal}
                />
            )}
            <div className="min-h-screen font-['DM_Sans'] relative"
                style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}>

                {/* ── Page header ── */}
                <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide mb-1">
                            Services & Pricing
                        </h1>
                        <p className="text-black/60 text-sm">Manage service catalog, prices, and availability</p>
                    </div>
                    {/* <button
                        type="button"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
                        style={{
                            background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)",
                            boxShadow: "0 4px 16px rgba(15,34,68,0.25)",
                        }}
                    >
                        <Plus size={15} /> Add Service
                    </button> */}
                </div>

                <div className="px-8 py-2 space-y-5">

                    {/* ── Stat cards ── */}
                    <SummaryCards items={stats} />

                    {/* ── Main card ── */}
                    <div className="bg-white rounded-2xl overflow-hidden"
                        style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.10), 0 8px 24px rgba(15,34,68,0.06)" }}>

                        {/* ── Toolbar ── */}
                        <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-4 flex-wrap"
                            style={{ borderBottom: "1px solid #f0f3fa", background: "#f8f9fc" }}>



                            {/* Category filter tabs */}
                            <div className="flex items-center gap-1">
                                {(["all", "consultation", "laboratory", "certificate", "other"] as CategoryFilter[]).map((cat) => {
                                    const m = cat === "all" ? null : CATEGORY_META[cat];
                                    const Icon = m?.icon;
                                    return (
                                        <button key={cat} type="button"
                                            onClick={() => setCategoryFilter(cat)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold transition-all rounded-xl"
                                            style={categoryFilter === cat
                                                ? { background: "#0f2244", color: "white" }
                                                : { color: "#8a99b8" }
                                            }>
                                            {Icon && <Icon size={11} />}
                                            {cat === "all" ? "All Services" : m!.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right controls */}
                            <div className="flex items-center gap-2">
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
                                {/* Status filter */}
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
                                        className="pl-3 pr-7 py-2 text-xs rounded-xl outline-none appearance-none"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active only</option>
                                        <option value="inactive">Inactive only</option>
                                    </select>
                                    <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: "#8a99b8" }} />
                                </div>

                                {/* Sort */}
                                <div className="relative">
                                    <select
                                        value={sortKey}
                                        onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                                        className="pl-3 pr-7 py-2 text-xs rounded-xl outline-none appearance-none"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}
                                    >
                                        <option value="name_asc">Name A–Z</option>
                                        <option value="name_desc">Name Z–A</option>
                                        <option value="price_asc">Price: Low → High</option>
                                        <option value="price_desc">Price: High → Low</option>
                                        <option value="date_desc">Newest first</option>
                                    </select>
                                    <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: "#8a99b8" }} />
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                                        style={{ color: "#b0bcd4" }} />
                                    <input
                                        type="text"
                                        placeholder="Search service or ID…"
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none transition"
                                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "200px" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Table ── */}
                        <div className="overflow-x-auto min-h-[50vh]">
                            {services.length === 0 ? (
                                <EmptyState message="No services match your current filters." />
                            ) : (
                                <table className="w-full text-sm">
                                    <TableHead cols={["#", "Service Name", "Category", "Reference ID", "Price", "Status", "Last Updated", "Actions"]} />
                                    <tbody>
                                        {services.map((service: ServiceRecord) => (
                                            <tr key={service.service_id}
                                                className="group transition-all"
                                                style={{ borderBottom: "1px solid #f4f6fb" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fc")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                                            >
                                                {/* ID */}
                                                <td className="px-5 py-3.5">
                                                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md"
                                                        style={{ background: "#eef1f9", color: "#6b7da0" }}>
                                                        #{String(service.service_id).padStart(4, "0")}
                                                    </span>
                                                </td>

                                                {/* Service Name */}
                                                <td className="px-5 py-3.5 max-w-[240px]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                            style={{
                                                                background: CATEGORY_META[service.category?.toLowerCase() ?? "other"].bg,
                                                                color: CATEGORY_META[service.category?.toLowerCase() ?? "other"].color,
                                                            }}>
                                                            {(() => {
                                                                const Icon = CATEGORY_META[service.category?.toLowerCase() ?? "other"].icon;
                                                                return <Icon size={14} />;
                                                            })()}
                                                        </div>
                                                        <p className="font-semibold text-[13px] truncate" style={{ color: "#1a2a45" }}>
                                                            {service.service_name}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="px-5 py-3.5">
                                                    <CategoryBadge category={service.category?.toLowerCase() ?? "other"} />
                                                </td>

                                                {/* Reference ID */}
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-1 text-[11.5px] font-mono"
                                                        style={{ color: "#6b7da0" }}>
                                                        <Hash size={10} />{service.reference_id}
                                                    </span>
                                                </td>

                                                {/* Price — inline editable */}
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-1 text-[11.5px] font-mono"
                                                        style={{ color: "#6b7da0" }}>
                                                        ₱{Number(service.price ?? 0).toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Status toggle */}
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-1 text-[11.5px] font-mono"
                                                        style={{ color: "#6b7da0" }}>
                                                        {/* {service.is_active} */}
                                                        <StatusToggle active={service.is_active} />
                                                    </span>
                                                </td>

                                                {/* Last Updated */}
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={11} style={{ color: "#c0ccd8" }} />
                                                        <span className="text-[12px]" style={{ color: "#6b7da0" }}>
                                                            {new Date(service.updated_at).toLocaleDateString("en-PH", {
                                                                month: "short", day: "numeric", year: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button type="button"
                                                            onClick={() => HandleActionButton(service)}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                                            style={{ background: "#eef1f9", color: "#0f2244", border: "1px solid #dce3ef" }}>
                                                            <Edit2 size={11} /> Edit
                                                        </button>
                                                        <button type="button"
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                                            style={service.is_active
                                                                ? { background: "#fdf0f2", color: "#c8102e", border: "1px solid #f5c6ce" }
                                                                : { background: "#e0f4f4", color: "#065050", border: "1px solid #b0dede" }
                                                            }>
                                                            {service.is_active ? <><Ban size={11} /> Disable</> : <><Check size={11} /> Enable</>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* ── Pagination ── */}
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalEntries={totalEntries}
                            calculateStartIndex={calculateStartIndex}
                            calculateEndIndex={calculateEndIndex}
                            setCurrentPage={setPage}
                        />
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
};

export default ServicesManagementPage;
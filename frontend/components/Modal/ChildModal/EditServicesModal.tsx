"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    X, Stethoscope, TestTube2, FileCheck, PackageCheck,
    Hash, Tag, Wallet, Calendar, ToggleLeft, ToggleRight,
    RefreshCw, Check, AlertCircle, TrendingUp, TrendingDown,
    History, Save,
} from "lucide-react";
import { ServiceRecord } from "@/hooks/admin/useAdmin";
import { useUpdateService } from "@/hooks/admin/useAdmin";
import SweetAlert from "@/utils/SweetAlert";

// ── Schema ──────────────────────────────────────────────────────────────────

const editServiceSchema = z.object({
    service_name: z.string().min(1, "Service name is required").max(100, "Max 100 characters"),
    price: z.number().min(0, "Price cannot be negative"),
    date: z.string().min(1, "Effective date is required"),
    is_active: z.boolean(),
});

type EditServiceForm = z.infer<typeof editServiceSchema>;

// ── Category meta ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    consultation: { label: "Consultation", color: "#0f2244", bg: "#eef1f9", icon: Stethoscope },
    laboratory: { label: "Laboratory", color: "#7c4dab", bg: "#f3eefb", icon: TestTube2 },
    certificate: { label: "Certificate", color: "#0e7c7b", bg: "#e0f4f4", icon: FileCheck },
    other: { label: "Other", color: "#6b7da0", bg: "#f0f3fa", icon: PackageCheck },
};

// ── Shared helpers ───────────────────────────────────────────────────────────

function FieldLabel({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) {
    return (
        <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#8a99b8" }}>
                {children}
            </p>
            {optional && (
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#c0ccd8" }}>
                    Optional
                </span>
            )}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-[10.5px] flex items-center gap-1" style={{ color: "#c8102e" }}>
            <AlertCircle size={10} /> {message}
        </p>
    );
}

const inputCls = "w-full px-3 py-2.5 text-[13px] rounded-xl outline-none transition";
const inputStyle = { background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#0f2244" };
const inputErrStyle = { background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#0f2244" };
const inputFocusCls = "focus:ring-0"; // handled by onFocus inline

// ── Main modal ───────────────────────────────────────────────────────────────

interface EditServiceModalProps {
    service: ServiceRecord;
    onClose: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ service, onClose }) => {
    const { mutateAsync: updateService, isPending } = useUpdateService(onClose);

    const catKey = service.category?.toLowerCase() ?? "other";
    const catMeta = CATEGORY_META[catKey] ?? CATEGORY_META.other;
    const CatIcon = catMeta.icon;

    const originalPrice = Number(service.price ?? 0);
    const [watchedPrice, setWatchedPrice] = useState(originalPrice);

    const priceDelta = watchedPrice - originalPrice;
    const priceDeltaPct = originalPrice > 0 ? (Math.abs(priceDelta) / originalPrice) * 100 : 0;
    const priceChanged = Math.abs(priceDelta) > 0.001;

    // format the stored date to yyyy-MM-dd for <input type="date">
    const toDateInput = (d: string | Date) => {
        const date = typeof d === "string" ? new Date(d) : d;
        return date.toISOString().split("T")[0];
    };

    const {
        register, handleSubmit, watch, setValue,
        formState: { errors, isDirty },
    } = useForm<EditServiceForm>({
        resolver: zodResolver(editServiceSchema),
        defaultValues: {
            service_name: service.service_name,
            price: originalPrice,
            date: toDateInput(service.date ?? service.updated_at),
            is_active: service.is_active,
        },
    });

    const watchedActive = watch("is_active");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // Keep local watchedPrice in sync for delta display
    const priceField = watch("price");
    useEffect(() => {
        setWatchedPrice(Number(priceField) || 0);
    }, [priceField]);

    const onSubmit = async (
        formData: EditServiceForm
    ) => {

        if (!isDirty) {
            onClose();
            return;
        }

        if (priceChanged) {
            const confirmed =
                await SweetAlert.confirmationAlert2(
                    "Confirm Price Change",
                    `You are changing the price from ₱${originalPrice.toFixed(2)} to ₱${formData.price.toFixed(2)}. This will affect future billing.`
                );

            if (!confirmed) return;
        }

        const payload = {
            service_name: formData.service_name,
            price: formData.price,
            date: formData.date,
            is_active: formData.is_active,
        };

        try {
            const updated =
                await updateService({
                    service_id: service.service_id,
                    data: payload,
                });
        } catch {
            return;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}>
            <div
                className="bg-white rounded-2xl overflow-hidden w-full flex flex-col"
                style={{
                    maxWidth: "520px",
                    maxHeight: "92vh",
                    boxShadow: "0 32px 96px rgba(15,34,68,0.28)",
                }}>
                {/* ── Hero header ── */}
                <div
                    className="relative px-6 py-5 flex items-center gap-4 flex-shrink-0 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, #0f2244 0%, #1a3560 55%, ${catMeta.color} 100%)` }}
                >
                    <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="absolute -bottom-10 left-4 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.03)" }} />

                    {/* Category icon */}
                    <div className="relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.22)" }}>
                        <CatIcon size={20} className="text-white" />
                    </div>

                    {/* Title */}
                    <div className="relative z-10 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="font-['DM_Serif_Display'] text-[16px] text-white leading-tight">
                                Edit Service
                            </h2>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                                {catMeta.label}
                            </span>
                        </div>
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                            #{String(service.service_id).padStart(4, "0")} · Ref {service.reference_id}
                        </p>
                    </div>

                    {/* Close */}
                    <button onClick={onClose}
                        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}>
                        <X size={14} />
                    </button>
                </div>

                {/* ── Read-only meta strip ── */}
                <div className="flex items-center gap-6 px-6 py-3 flex-shrink-0"
                    style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                    <div className="flex items-center gap-2">
                        <Hash size={11} style={{ color: "#b0bcd4" }} />
                        <span className="text-[11px] font-semibold" style={{ color: "#8a99b8" }}>
                            Ref ID: <span style={{ color: "#1a2a45" }}>{service.reference_id}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <History size={11} style={{ color: "#b0bcd4" }} />
                        <span className="text-[11px] font-semibold" style={{ color: "#8a99b8" }}>
                            Created:{" "}
                            <span style={{ color: "#1a2a45" }}>
                                {new Date(service.created_at).toLocaleDateString("en-PH", {
                                    month: "short", day: "numeric", year: "numeric",
                                })}
                            </span>
                        </span>
                    </div>
                </div>

                {/* ── Form body ── */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                        {/* Service name */}
                        <div>
                            <FieldLabel>Service Name</FieldLabel>
                            <div className="relative">
                                <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: "#b0bcd4" }} />
                                <input
                                    {...register("service_name")}
                                    placeholder="e.g. CBC with Platelet Count"
                                    className={`${inputCls} pl-9`}
                                    style={errors.service_name ? inputErrStyle : inputStyle}
                                />
                            </div>
                            <FieldError message={errors.service_name?.message} />
                        </div>

                        {/* Price + effective date — side by side */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* Price */}
                            <div>
                                <FieldLabel>Price (₱)</FieldLabel>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold pointer-events-none"
                                        style={{ color: "#b0bcd4" }}>₱</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        {...register("price", { valueAsNumber: true })}
                                        placeholder="0.00"
                                        className={`${inputCls} pl-7`}
                                        style={errors.price ? inputErrStyle : inputStyle}
                                    />
                                </div>
                                <FieldError message={errors.price?.message} />

                                {/* Price delta hint */}
                                {priceChanged && (
                                    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-xl"
                                        style={{ background: priceDelta > 0 ? "#fdf0f2" : "#f0fdf4", border: `1px solid ${priceDelta > 0 ? "#fca5a5" : "#bbf7d0"}` }}>
                                        {priceDelta > 0
                                            ? <TrendingUp size={11} style={{ color: "#c8102e" }} />
                                            : <TrendingDown size={11} style={{ color: "#0e7c7b" }} />}
                                        <span className="text-[10.5px] font-semibold"
                                            style={{ color: priceDelta > 0 ? "#c8102e" : "#0e7c7b" }}>
                                            {priceDelta > 0 ? "+" : ""}₱{priceDelta.toFixed(2)} ({priceDeltaPct.toFixed(1)}%)
                                        </span>
                                        <span className="text-[10px]" style={{ color: "#8a99b8" }}>
                                            from ₱{originalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Effective date */}
                            <div>
                                <FieldLabel>Effective Date</FieldLabel>
                                <div className="relative">
                                    <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: "#b0bcd4" }} />
                                    <input
                                        type="date"
                                        {...register("date")}
                                        className={`${inputCls} pl-9`}
                                        style={errors.date ? inputErrStyle : inputStyle}
                                    />
                                </div>
                                <FieldError message={errors.date?.message} />
                            </div>
                        </div>

                        {/* Active status toggle */}
                        <div>
                            <FieldLabel>Availability</FieldLabel>
                            <button
                                type="button"
                                onClick={() => setValue("is_active", !watchedActive, { shouldDirty: true })}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all text-left"
                                style={{
                                    background: watchedActive ? "#e0f4f4" : "#f1f5f9",
                                    border: `1.5px solid ${watchedActive ? "#b0dede" : "#dce3ef"}`,
                                }}
                            >
                                {watchedActive
                                    ? <ToggleRight size={22} style={{ color: "#0e7c7b", flexShrink: 0 }} />
                                    : <ToggleLeft size={22} style={{ color: "#94a3b8", flexShrink: 0 }} />}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[13px]"
                                        style={{ color: watchedActive ? "#065050" : "#475569" }}>
                                        {watchedActive ? "Active — visible in billing" : "Inactive — hidden from billing"}
                                    </p>
                                    <p className="text-[11px] mt-0.5" style={{ color: watchedActive ? "#0e7c7b" : "#94a3b8" }}>
                                        {watchedActive
                                            ? "This service is currently available for selection when creating bills."
                                            : "This service will not appear when creating new bills."}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                                    style={{ background: watchedActive ? "#0e7c7b" : "#94a3b8", color: "white" }}>
                                    {watchedActive ? "ON" : "OFF"}
                                </span>
                            </button>
                        </div>

                        {/* Summary preview */}
                        <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #eef1f9" }}>
                            <div className="px-4 py-2.5"
                                style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#8a99b8" }}>
                                    Preview
                                </p>
                            </div>
                            <div className="px-4 py-3.5 space-y-2">
                                {[
                                    { label: "Service", value: watch("service_name") || "—" },
                                    { label: "Category", value: catMeta.label },
                                    { label: "Reference", value: `ID ${service.reference_id}` },
                                    { label: "Price", value: `₱${(Number(watch("price")) || 0).toFixed(2)}` },
                                    { label: "Effective", value: watch("date") ? new Date(watch("date")).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "—" },
                                    { label: "Status", value: watchedActive ? "Active" : "Inactive" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <span className="text-[11px] font-semibold" style={{ color: "#8a99b8" }}>{label}</span>
                                        <span className="text-[12.5px] font-semibold" style={{ color: "#1a2a45" }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* ── Footer ── */}
                    <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between gap-3"
                        style={{ borderTop: "1px solid #eef1f9", background: "#f8f9fc" }}>
                        <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                            {isDirty ? "You have unsaved changes." : "No changes yet."}
                        </p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors"
                                style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || !isDirty}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white transition-all disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)", boxShadow: "0 4px 16px rgba(15,34,68,0.2)" }}>
                                {isPending
                                    ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
                                    : <><Save size={13} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditServiceModal;
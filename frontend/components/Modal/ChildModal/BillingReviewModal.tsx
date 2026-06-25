"use client";

import { useState, useEffect } from "react";
import {
    X, Receipt, FileText, ChevronRight, RefreshCw,
    Tag, Percent, BadgePercent, Wallet, ArrowRight,
    Accessibility, GraduationCap, Briefcase, Gift, Edit3,
} from "lucide-react";
import { BillingRecord } from "@/types/BillingTypes";
import SweetAlert from "@/utils/SweetAlert";
import CardLabel from "@/components/ui/CardLabel";
import { useUpdateBillingDiscount } from "@/hooks/Billing/useBilling";

// ── Discount reason options ─────────────────────────────────────────────────

type DiscountReason = "SENIOR_CITIZEN" | "PWD" | "EMPLOYEE" | "PROMO" | "MANUAL" | "NONE";

const DISCOUNT_REASONS: {
    value: DiscountReason; label: string; icon: React.ElementType;
    color: string; bg: string; autoPct?: number;
}[] = [
        { value: "NONE", label: "No Discount", icon: Tag, color: "#6b7da0", bg: "#f4f6fb" },
        { value: "SENIOR_CITIZEN", label: "Senior Citizen", icon: GraduationCap, color: "#1d4ed8", bg: "#eff6ff", autoPct: 20 },
        { value: "PWD", label: "PWD", icon: Accessibility, color: "#7c4dab", bg: "#f3eefb", autoPct: 20 },
        { value: "EMPLOYEE", label: "Employee", icon: Briefcase, color: "#0e7c7b", bg: "#e0f4f4", autoPct: 10 },
        { value: "PROMO", label: "Promo", icon: Gift, color: "#c8102e", bg: "#fdf0f2" },
        { value: "MANUAL", label: "Manual Discount", icon: Edit3, color: "#92400e", bg: "#fffbeb" },
    ];
// ── Main modal ─────────────────────────────────────────────────────────────

interface BillingReviewModalProps {
    billing: BillingRecord;
    onClose: () => void;
    onSuccess: (updatedBilling: BillingRecord) => void;
}

const BillingReviewModal: React.FC<BillingReviewModalProps> = ({ billing, onClose, onSuccess }) => {
    const subtotal = billing.totalPrice;

    const [reason, setReason] = useState<DiscountReason>(
        billing.discount > 0 ? "MANUAL" : "NONE"
    );
    const [discountInput, setDiscountInput] = useState<string>(
        billing.discount > 0 ? billing.discount.toFixed(2) : ""
    );
    const [isSaving, setIsSaving] = useState(false);

    const { mutateAsync: updateDiscount, isPending } = useUpdateBillingDiscount();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const discount = Math.min(Math.max(Number(discountInput) || 0, 0), subtotal);
    const netDue = Math.max(subtotal - discount, 0);
    const discountPct = subtotal > 0 ? (discount / subtotal) * 100 : 0;

    // const selectedReason = DISCOUNT_REASONS.find((r) => r.value === reason) ?? DISCOUNT_REASONS[0];

    // const handleSelectReason = (r: typeof DISCOUNT_REASONS[number]) => {
    //     setReason(r.value);
    //     if (r.value === "NONE") {
    //         setDiscountInput("");
    //     } else if (r.autoPct) {
    //         setDiscountInput((subtotal * (r.autoPct / 100)).toFixed(2));
    //     }
    //     // PROMO / MANUAL: leave amount for the user to type
    // };

    const selectedReason =
        DISCOUNT_REASONS.find(
            (r) => r.value === reason
        ) ?? DISCOUNT_REASONS[0];

    useEffect(() => {
        setReason(
            (billing.discountReason as DiscountReason) ?? "NONE"
        );

        setDiscountInput(
            billing.discount > 0
                ? billing.discount.toFixed(2)
                : ""
        );
    }, [billing]);

    const handleSelectReason = (
        r: typeof DISCOUNT_REASONS[number]
    ) => {
        if (r.value === reason) return;

        setReason(r.value);

        if (r.value === "NONE") {
            setDiscountInput("");
        } else if (r.autoPct) {
            setDiscountInput(
                (subtotal * (r.autoPct / 100)).toFixed(2)
            );
        }
    };

    const handleProceed = async () => {
        if (reason !== "NONE" && discount === 0) {
            await SweetAlert.errorAlert("Missing Discount Amount", "Please enter a discount amount or select 'No Discount'.");
            return;
        }
        if (reason === "NONE" && discount > 0) {
            const confirmed = await SweetAlert.confirmationAlert2(
                "No reason selected",
                "A discount amount was entered but no reason was selected. Continue anyway?"
            );
            if (!confirmed) return;
        }

        setIsSaving(true);
        try {
            const updated = await updateDiscount({
                billing_id: billing.billingId,
                discount,
                discount_reason: reason === "NONE" ? null : reason,
            });
            console.log("updated", updated);
            console.log("patientName", updated.patientName);

            onSuccess(updated);
        } catch {
            return;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white rounded-2xl overflow-hidden w-full max-w-xl overflow-y-scroll h-[90%]"
                style={{ boxShadow: "0 32px 96px rgba(15,34,68,0.28)" }}
            >
                {/* ── Gradient hero ── */}
                <div
                    className="relative px-6 py-6 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)" }}
                >
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "rgba(124,77,171,0.18)" }} />

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        style={{
                            background: "rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.7)"
                        }}
                    >
                        <X size={14} />
                    </button>

                    {/* Patient + bill info */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.22)", fontFamily: "'DM Serif Display', serif" }}
                            >
                                {billing.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                                <p className="font-bold text-white text-[16px] leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                    {billing.patientName}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                                    {billing.billingCode} · {billing.requestType}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <FileText size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                            <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                                Review Billing — Apply Discount
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Bill breakdown ── */}
                {billing.breakdown.length > 0 && (
                    <div className="px-6 py-4" style={{ borderBottom: "1px solid #f0f3fa" }}>
                        <div className="flex items-center justify-between mb-3">
                            <CardLabel>Bill Breakdown</CardLabel>
                            <span className="text-[10px] font-semibold" style={{ color: "#8a99b8" }}>
                                {billing.breakdown.length} item{billing.breakdown.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="space-y-2 max-h-[130px] overflow-y-auto">
                            {billing.breakdown.map((item) => (
                                <div key={item.lineId}
                                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                                    style={{ background: "#f8f9fc" }}>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[12.5px]" style={{ color: "#1a2a45" }}>{item.label}</p>
                                        <p className="text-[10.5px] mt-0.5" style={{ color: "#8a99b8" }}>
                                            Qty {item.quantity} × ₱{item.unitPrice.toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="font-bold text-[12.5px] flex-shrink-0" style={{ color: "#0f2244" }}>
                                        ₱{item.totalPrice.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Discount section ── */}
                <div className="px-6 py-5 space-y-4">

                    {/* Reason picker */}
                    <div>
                        <CardLabel>Discount Reason</CardLabel>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {DISCOUNT_REASONS.map((r) => {
                                const isActive = reason === r.value;
                                const Icon = r.icon;
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => handleSelectReason(r)}
                                        className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 transition-all"
                                        style={{
                                            background: isActive ? r.bg : "#f8f9fc",
                                            border: `1.5px solid ${isActive ? r.color + "55" : "#eef1f9"}`,
                                        }}
                                    >
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{ background: isActive ? r.color + "20" : "#eef1f9" }}>
                                            <Icon size={13} style={{ color: isActive ? r.color : "#b0bcd4" }} />
                                        </div>
                                        <span className="text-[10.5px] font-semibold text-center leading-tight"
                                            style={{ color: isActive ? r.color : "#6b7da0" }}>
                                            {r.label}
                                        </span>
                                        {r.autoPct && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{ background: isActive ? r.color + "20" : "transparent", color: isActive ? r.color : "#c0ccd8" }}>
                                                {r.autoPct}%
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Discount amount input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <CardLabel>Discount Amount</CardLabel>
                            {discountPct > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: selectedReason.bg, color: selectedReason.color }}>
                                    {discountPct.toFixed(1)}% off
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[13px] font-semibold"
                                style={{ color: "#b0bcd4" }}>₱</span>
                            <input
                                type="number"
                                min={0}
                                max={subtotal}
                                step="0.01"
                                value={discountInput}
                                onChange={(e) => setDiscountInput(e.target.value)}
                                placeholder="0.00"
                                disabled={reason === "NONE"}
                                className="w-full pl-8 pr-4 py-2.5 text-[14px] font-semibold rounded-xl outline-none transition disabled:opacity-50"
                                style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#0f2244" }}
                            />
                        </div>
                        <p className="text-[10.5px] mt-1.5" style={{ color: "#b0bcd4" }}>
                            {reason === "NONE"
                                ? "Select a discount reason to enable this field."
                                : `Max discount: ₱${subtotal.toFixed(2)}`}
                        </p>
                    </div>

                    {/* ── Calculation summary ── */}
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #eef1f9" }}>
                        <div className="px-4 py-3 space-y-2" style={{ background: "#f8f9fc" }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px]" style={{ color: "#6b7da0" }}>Subtotal</span>
                                <span className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>
                                    ₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] flex items-center gap-1.5" style={{ color: "#6b7da0" }}>
                                    <BadgePercent size={12} />
                                    Discount
                                    {reason !== "NONE" && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                            style={{ background: selectedReason.bg, color: selectedReason.color }}>
                                            {selectedReason.label}
                                        </span>
                                    )}
                                </span>
                                <span className="font-semibold text-[13px]" style={{ color: discount > 0 ? "#c8102e" : "#1a2a45" }}>
                                    {discount > 0 ? `-₱${discount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "₱0.00"}
                                </span>
                            </div>
                        </div>

                        {/* Net due — gradient highlight */}
                        <div className="px-4 py-3.5 flex items-center justify-between"
                            style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 60%, #0e7c7b 100%)" }}>
                            <div className="flex items-center gap-2">
                                <Wallet size={14} className="text-white" />
                                <span className="text-[12.5px] font-semibold text-white">Net Due</span>
                            </div>
                            <span className="text-[20px] font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                ₱{netDue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-3 rounded-xl text-[12.5px] font-semibold transition-colors"
                        style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleProceed()}
                        disabled={isSaving}
                        className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #0f2244 0%, #7c4dab 100%)" }}
                    >
                        {isSaving ? (
                            <><RefreshCw size={14} className="animate-spin" /> Saving…</>
                        ) : (
                            <>Proceed to Payment <ArrowRight size={14} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingReviewModal;
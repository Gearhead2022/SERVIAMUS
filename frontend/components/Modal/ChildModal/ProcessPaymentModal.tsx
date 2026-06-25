"use client"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BillingRecord, PaymentProps } from "@/types/BillingTypes";
import { useProcessPayment } from "@/hooks/Billing/useBilling";
import { Banknote, Smartphone, CreditCard, Building2, X, RefreshCw, Receipt, ReceiptCentIcon, CoinsIcon } from "lucide-react";
import SweetAlert from "@/utils/SweetAlert";
import CardLabel from "@/components/ui/CardLabel";

type ReceiptPreview = {
    amountPaid: number;
    paidAt: string;
    paymentMethod: PaymentProps["method"];
    referenceNo?: string | null;
};

const METHOD_ICONS: Record<string, React.ElementType> = {
    CASH: Banknote, GCASH: Smartphone, CARD: CreditCard, BANK_TRANSFER: Building2,
};

const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash", icon: Banknote, color: "#166534", bg: "#f0fdf4" },
    { value: "GCASH", label: "GCash", icon: Smartphone, color: "#1d4ed8", bg: "#eff6ff" },
    { value: "CARD", label: "Card", icon: CreditCard, color: "#7c4dab", bg: "#f3eefb" },
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, color: "#0e7c7b", bg: "#e0f4f4" },
];

const ProcessPaymentModal = function ProcessPaymentModal({
    billing,
    onClose,
    onSuccess,
}: {
    billing: BillingRecord;
    onClose: () => void;
    onSuccess: (preview: ReceiptPreview) => void;
}) {
    const { mutateAsync: processPayment, isPending: paymentPending } = useProcessPayment();
    const [isProcessing, setIsProcessing] = useState(false);
    const { register, handleSubmit, reset, watch } = useForm<PaymentProps>({
        defaultValues: { method: "CASH" },
    });

    const watchedMethod = watch("method") as PaymentProps["method"];
    const MethodIcon = METHOD_ICONS[watchedMethod] ?? Banknote;
    const amountDue = Math.max(billing.totalPrice - billing.discount, 0);

    const onSubmit = async (data: PaymentProps) => {
        setIsProcessing(true);
        try {
            const confirmed = await SweetAlert.confirmationAlert2(
                "Are you sure?", "You are about to proceed this payment."
            );
            if (!confirmed) return;
            const result = await processPayment({
                ...data,
                billing_id: billing.billingId,
                amount: amountDue,
            });
            onSuccess({
                amountPaid: result.payment.amount || amountDue,
                paidAt: result.payment.payment_date ?? new Date().toISOString(),
                paymentMethod: result.payment.method,
                referenceNo: result.payment.reference_no ?? null,
            });
        } catch {
            return;
        } finally {
            setIsProcessing(false);
        }
    };

    // Trap scroll on body while modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[50] flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-2xl overflow-hidden w-full max-w-lg overflow-y-scroll h-[90%]"
                style={{ boxShadow: "0 32px 96px rgba(15,34,68,0.28)" }}
            >
                {/* ── Gradient hero ── */}
                <div
                    className="relative px-6 py-6 overflow-hidden z-0"
                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)" }}
                >
                    {/* decorative blob */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "rgba(14,124,123,0.18)" }} />

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

                    {/* Patient + amount */}
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

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                                    style={{ color: "rgba(255,255,255,0.45)" }}>
                                    Total Due
                                </p>
                                <p className="text-4xl font-bold text-white mt-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                    ₱{amountDue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </p>
                                {billing.discount > 0 && (
                                    <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        Subtotal ₱{billing.totalPrice.toFixed(2)} · Saved ₱{billing.discount.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Requested by */}
                            {billing.requestedBy && (
                                <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    by {billing.requestedBy}
                                </p>
                            )}
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
                        <div className="space-y-2 max-h-[140px] overflow-y-auto">
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

                {/* ── Payment form ── */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                    <div>
                        <CardLabel>Payment Method</CardLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {PAYMENT_METHODS.map(({ value, label, icon: Icon, color, bg }) => {
                                const isActive = watchedMethod === value;
                                return (
                                    <label
                                        key={value}
                                        className="flex items-center gap-2.5 rounded-xl px-3 py-3 cursor-pointer transition-all"
                                        style={{
                                            background: isActive ? bg : "#f8f9fc",
                                            border: `1.5px solid ${isActive ? color + "55" : "#eef1f9"}`,
                                        }}
                                    >
                                        <input type="radio" value={value} {...register("method")} className="hidden" />
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: isActive ? color + "20" : "#eef1f9" }}
                                        >
                                            <Icon size={14} style={{ color: isActive ? color : "#b0bcd4" }} />
                                        </div>
                                        <span className="text-[12px] font-semibold" style={{ color: isActive ? color : "#6b7da0" }}>
                                            {label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reference number */}
                    {watchedMethod !== "CASH" && (
                        <div>
                            <CardLabel>Reference No. (Optional)</CardLabel>
                            <input
                                type="text"
                                placeholder={
                                    watchedMethod === "GCASH" ? "e.g. GC-2025-00123" :
                                        watchedMethod === "CARD" ? "e.g. CARD-8821" :
                                            "e.g. BT-20250519-001"
                                }
                                {...register("reference_no")}
                                className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-xl outline-none"
                                style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}
                            />
                        </div>
                    )}

                    <div
                        className="flex items-center justify-between rounded-2xl px-4 "
                        style={{ background: "#f0f9f9", border: "1.5px solid #b0dede" }}
                    >
                        <div className="flex items-center gap-2">
                            <CoinsIcon size={15} style={{ color: "#0e7c7b" }} />
                            <span className="text-[12px] font-semibold" style={{ color: "#065050" }}>
                                Subtotal
                            </span>
                        </div>
                        <span className="font-semibold text-[14px]" style={{ color: "#ac2323", fontFamily: "'DM Serif Display', serif" }}>
                            ₱{billing.totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div
                        className="flex items-center justify-between rounded-2xl px-4 "
                        style={{ background: "#f0f9f9", border: "1.5px solid #b0dede" }}
                    >
                        <div className="flex items-center gap-2">
                            <ReceiptCentIcon size={15} style={{ color: "#0e7c7b" }} />
                            <span className="text-[12px] font-semibold" style={{ color: "#065050" }}>
                                Total Discount
                            </span>
                        </div>
                        <span className="font-semibold text-[14px]" style={{ color: "#ac2323", fontFamily: "'DM Serif Display', serif" }}>
                            −₱{billing.discount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <p className="text-black text-xs italic text-end">asd</p>

                    {/* Summary row */}
                    <div
                        className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                        style={{ background: "#f0f9f9", border: "1.5px solid #b0dede" }}
                    >
                        <div className="flex items-center gap-2">
                            <MethodIcon size={15} style={{ color: "#0e7c7b" }} />
                            <span className="text-[12.5px] font-semibold" style={{ color: "#065050" }}>
                                {PAYMENT_METHODS.find((m) => m.value === watchedMethod)?.label ?? "Cash"}
                            </span>
                        </div>
                        <span className="font-bold text-[16px]" style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>
                            ₱{amountDue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 rounded-xl text-[12.5px] font-semibold transition-colors"
                            style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={paymentPending || isProcessing}
                            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{
                                background: paymentPending || isProcessing
                                    ? "#b0bcd4"
                                    : "linear-gradient(135deg, #0f2244 0%, #c8102e 100%)",
                            }}
                        >
                            {paymentPending || isProcessing ? (
                                <><RefreshCw size={14} className="animate-spin" /> Processing…</>
                            ) : (
                                <><Receipt size={14} /> Confirm Payment</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProcessPaymentModal;
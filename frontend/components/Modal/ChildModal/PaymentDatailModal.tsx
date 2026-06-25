"use client"
import { PaymentMethod, PaymentRecord, PaymentStatus } from "@/types/BillingTypes";
import {
    X, CreditCard,
    Banknote, Smartphone, Building2, Download,
    ReceiptText
} from "lucide-react";

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
    CONSULTATION: { color: "#0f2244", bg: "#eef1f9" },
    LABORATORY: { color: "#7c4dab", bg: "#f3eefb" },
    CERTIFICATE: { color: "#0e7c7b", bg: "#e0f4f4" },
};

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

function PaymentDetailModal({
    payment,
    onClose,
    setViewReceipt
}: {
    payment: PaymentRecord;
    onClose: () => void;
    setViewReceipt: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const net = payment.amount - payment.discount;
    const typeStyle = TYPE_COLORS[payment.requestType] ?? { color: "#0f2244", bg: "#eef1f9" };
    const paidDate = new Date(payment.paidAt);
    const referenceNo = payment.billing ?? null;
    const paymentMethod = payment.billing.paymentMethod;

    return (
        <div
            className="fixed inset-0 z-[20] flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl overflow-hidden w-full max-w-md"
                style={{ boxShadow: "0 32px 96px rgba(15,34,68,0.28)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Gradient hero ── */}
                <div
                    className="relative px-6 py-6 overflow-hidden z-0"
                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)" }}
                >
                    {/* decorative blobs */}
                    <div
                        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                    <div
                        className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "rgba(14,124,123,0.18)" }}
                    />

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                    >
                        <X size={14} />
                    </button>

                    {/* Patient info */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                style={{
                                    background: "rgba(255,255,255,0.15)",
                                    border: "1.5px solid rgba(255,255,255,0.22)",
                                    fontFamily: "'DM Serif Display', serif",
                                }}
                            >
                                {payment.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                                <p
                                    className="font-bold text-white text-[16px] leading-tight"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    {payment.patientName}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                                    {payment.billingCode} · {payment.requestType}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                                    {payment.referenceNo}
                                </p>
                            </div>
                        </div>

                        {/* Amount hero */}
                        <div className="text-center">
                            <p
                                className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                                style={{ color: "rgba(255,255,255,0.5)" }}
                            >
                                Amount Paid
                            </p>
                            <p
                                className="text-4xl font-bold text-white mt-1"
                                style={{ fontFamily: "'DM Serif Display', serif" }}
                            >
                                ₱{net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </p>
                            {payment.discount > 0 && (
                                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                                    Subtotal ₱{payment.amount.toFixed(2)} · Discount −₱{payment.discount.toFixed(2)}
                                </p>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <StatusBadge status={payment.status} />
                                <MethodBadge method={payment.method} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Details list ── */}
                <div className="px-6 py-5 space-y-3.5" style={{ borderBottom: "1px solid #f0f3fa" }}>
                    {[
                        { label: "Patient", value: payment.patientName },
                        { label: "Patient Code", value: `#${payment.patientCode}` },
                        {
                            label: "Request Type",
                            value: (
                                <span
                                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                                    style={{ background: typeStyle.bg, color: typeStyle.color }}
                                >
                                    {payment.requestType}
                                </span>
                            ),
                        },
                        { label: "Requested By", value: payment.requestedBy },
                        {
                            label: "Date",
                            value: paidDate.toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }),
                        },
                        {
                            label: "Time",
                            value: paidDate.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
                        },
                        ...(payment.referenceNo
                            ? [
                                {
                                    label: "Reference No.",
                                    value: <span className="font-mono text-[12px]">{payment.referenceNo}</span>,
                                },
                            ]
                            : []),
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-semibold" style={{ color: "#8a99b8" }}>
                                {label}
                            </span>
                            <span className="text-[12.5px] font-semibold text-right" style={{ color: "#1a2a45" }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Actions ── */}
                <div className="px-6 py-4 flex gap-2">
                    <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11.5px] font-semibold transition-colors"
                        style={{ background: "#eef1f9", color: "#0f2244" }}
                        onClick={() => setViewReceipt(true)}
                    >
                        <ReceiptText size={13} /> View Receipt
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11.5px] font-semibold transition-colors"
                        style={{ background: "#e0f4f4", color: "#065050" }}
                    >
                        <Download size={13} /> Export
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentDetailModal;
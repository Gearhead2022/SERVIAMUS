import Button from "@/components/ui/Button";
import BillingReceiptDocument from "@/components/Modal/BillingReceiptDocument";
import {
  BillingReceiptPreviewPayload,
  BillingBreakdownItem,
  BillingRequestType,
  PaymentMethod,
} from "@/types/BillingTypes";
import { X } from "lucide-react";

interface ReceiptModalProps {
  billingCode: string;
  patientName: string;
  patientCode: string;
  requestType: BillingRequestType;
  requestedBy?: string | null;
  requestedDate: string;
  breakdown: BillingBreakdownItem[];
  subtotal: number;
  discount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string | null;
  paidAt?: string | null;
  onClose: () => void;
}

export default function ReceiptModal({
  billingCode,
  patientName,
  patientCode,
  requestType,
  requestedBy,
  requestedDate,
  breakdown,
  subtotal,
  discount,
  amountPaid,
  paymentMethod,
  referenceNo,
  paidAt,
  onClose,
}: ReceiptModalProps) {
  const receipt: BillingReceiptPreviewPayload = {
    billingCode,
    patientName,
    patientCode,
    requestType,
    requestedBy,
    requestedDate,
    breakdown,
    subtotal,
    discount,
    amountPaid,
    paymentMethod,
    referenceNo,
    paidAt,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 print:hidden">
      <div className="flex max-h-[calc(90vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#eff4f3] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#dce7e4] px-6 py-3" style={{
          background: "linear-gradient(90deg, #0f2244 0%, #1a3560 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Billing Breakdown Preview
            </p>
            <h2 className="font-['DM_Serif_Display'] text-2xl text-white/90">
              Billing Breakdown
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[#cfe2dc] bg-[#e8f5f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0e7c7b]">
              Paid
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 transition hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <BillingReceiptDocument receipt={receipt} />
        </div>

        <div className="flex gap-3 border-t border-[#dce7e4] bg-white px-6 py-5">
          <Button variant="danger" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

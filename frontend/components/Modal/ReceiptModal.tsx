import Button from "@/components/ui/Button";
import BillingReceiptDocument from "@/components/Modal/BillingReceiptDocument";
import {
  BillingBreakdownItem,
  BillingRequestType,
  PaymentMethod,
  PrintableBillingReceiptPayload,
} from "@/types/BillingTypes";
import { Printer, X } from "lucide-react";

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
  onPrint?: () => void;
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
  onPrint,
}: ReceiptModalProps) {
  const receipt: PrintableBillingReceiptPayload = {
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
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#eff4f3] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#dce7e4] bg-white px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5b7c76]">
              Billing Receipt Preview
            </p>
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">
              Payment Receipt
            </h2>
            <p className="text-sm text-[#6b7da0]">
              Cleaner print layout based on the clinic&apos;s existing laboratory document style.
            </p>
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
          <Button variant="danger" onClick={onClose} className="flex-1">
            Close
          </Button>
          {onPrint ? (
            <Button
              variant="primary"
              onClick={onPrint}
              icon={<Printer size={16} />}
              iconPosition="left"
              className="flex-1"
            >
              Print Receipt
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

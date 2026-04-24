import Button from "@/components/ui/Button";
import { CheckCircle2, Printer, X } from "lucide-react";

interface ReceiptModalProps {
  billingCode: string;
  patientName: string;
  amount: number;
  paymentMethod: string;
  onClose: () => void;
  onPrint?: () => void;
}

export default function ReceiptModal({
  billingCode,
  patientName,
  amount,
  paymentMethod,
  onClose,
  onPrint,
}: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0e7c7b] to-[#0d6b6a] px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={32} className="text-white" />
            <div>
              <h2 className="text-white font-['DM_Serif_Display'] text-xl">Payment Successful</h2>
              <p className="text-white/80 text-xs">Cash Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-8 space-y-6">
          {/* Receipt Box */}
          <div className="bg-[#f7f8fc] border-2 border-dashed border-[#dce3ef] rounded-xl p-6 space-y-4">
            {/* Logo/Title */}
            <div className="text-center border-b border-[#dce3ef] pb-4">
              <p className="font-['DM_Serif_Display'] text-[#0f2244] text-lg">SERVIAMUS</p>
              <p className="text-[10px] text-[#6b7da0] uppercase tracking-wider">Medical Clinic & Laboratory</p>
            </div>

            {/* Bill Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b7da0]">Bill Code:</span>
                <span className="font-semibold text-[#0f2244]">{billingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7da0]">Patient:</span>
                <span className="font-semibold text-[#0f2244]">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7da0]">Payment Method:</span>
                <span className="font-semibold text-[#0f2244]">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7da0]">Date:</span>
                <span className="font-semibold text-[#0f2244]">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="border-t border-[#dce3ef] pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[#6b7da0]">Amount Due:</span>
                <span className="text-2xl font-bold text-[#0f2244]">₱{amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Footer Message */}
            <div className="border-t border-[#dce3ef] pt-4 text-center">
              <p className="text-[11px] text-[#6b7da0] font-semibold uppercase">Please proceed to counter for payment processing</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#fff3e0] border-l-4 border-[#f57c00] p-4 rounded-lg">
            <p className="text-[13px] font-semibold text-[#e65100] mb-2">Next Steps:</p>
            <ul className="text-[12px] text-[#ef6c00] space-y-1">
              <li>✓ Proceed to the cashier counter</li>
              <li>✓ Present this receipt</li>
              <li>✓ Pay the amount shown</li>
              <li>✓ Collect official receipt</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {onPrint && (
              <Button
                variant="primary"
                onClick={onPrint}
                icon={<Printer size={16} />}
                iconPosition="left"
                className="flex-1"
              >
                Print
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
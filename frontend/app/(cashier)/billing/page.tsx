"use client";

import { useMemo, useState } from "react";
import RoleGuard from "@/guards/RoleGuard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ReceiptModal from "@/components/Modal/ReceiptModal";
import SweetAlert from "@/utils/SweetAlert";
import { useForm } from "react-hook-form";
import { useBillings, useProcessPayment } from "@/hooks/Billing/useBilling";
import {
  BillingRecord,
  PaymentProps,
  PrintableBillingReceiptPayload,
} from "@/types/BillingTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import { openBillingReceiptPrintPage } from "@/utils/billing-receipt-print";
import {
  FileText,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type BillingFilter = "ALL" | "PENDING" | "DONE";
type ReceiptPreview = {
  amountPaid: number;
  paidAt: string;
  paymentMethod: PaymentProps["method"];
  referenceNo?: string | null;
};

const getBillingDisplayStatus = (billing: BillingRecord) =>
  billing.isPaid ? "DONE" : "PENDING";

const buildReceiptPayload = (
  billing: BillingRecord,
  receiptPreview: ReceiptPreview
): PrintableBillingReceiptPayload => ({
  billingCode: billing.billingCode,
  patientName: billing.patientName,
  patientCode: billing.patientCode,
  requestType: billing.requestType,
  requestedBy: billing.requestedBy,
  requestedDate: billing.requestedDate,
  breakdown: billing.breakdown,
  subtotal: billing.totalPrice,
  discount: billing.discount,
  amountPaid: receiptPreview.amountPaid,
  paymentMethod: receiptPreview.paymentMethod,
  referenceNo: receiptPreview.referenceNo ?? null,
  paidAt: receiptPreview.paidAt,
});

const BillingDashboard = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillingFilter>("ALL");
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<ReceiptPreview | null>(null);

  const {
    data: bills = [],
    error: billingsError,
    isLoading: loading,
    refetch,
  } = useBillings();
  const { mutateAsync: processPayment, isPending: paymentPending } = useProcessPayment();

  const { register, handleSubmit, reset } = useForm<PaymentProps>({
    defaultValues: { method: "CASH" },
  });

  const resetPaymentFlow = () => {
    setSelectedBilling(null);
    setShowReceipt(false);
    setShowPaymentConfirm(false);
    setReceiptPreview(null);
    reset({ method: "CASH", reference_no: "" });
  };

  const handleSelectBilling = (billing: BillingRecord) => {
    setSelectedBilling(billing);
    setShowReceipt(false);
    setShowPaymentConfirm(false);
    setReceiptPreview(null);
    reset({ method: "CASH", reference_no: "" });
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const displayStatus = getBillingDisplayStatus(bill);
      const matchesSearch =
        search === "" ||
        bill.patientName.toLowerCase().includes(search.toLowerCase()) ||
        bill.billingCode.toLowerCase().includes(search.toLowerCase()) ||
        bill.patientCode.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || displayStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  const stats = {
    total: bills.length,
    pending: bills.filter((bill) => !bill.isPaid).length,
    completed: bills.filter((bill) => bill.isPaid).length,
    totalRevenue: bills
      .filter((bill) => bill.isPaid)
      .reduce((sum, bill) => sum + (bill.totalPrice - bill.discount), 0),
  };

  const amountDue = selectedBilling
    ? Math.max(selectedBilling.totalPrice - selectedBilling.discount, 0)
    : 0;

  const onSubmit = async (data: PaymentProps) => {
    if (!selectedBilling) {
      return;
    }

    setIsProcessing(true);

    try {
      const paymentResult = await processPayment({
        ...data,
        billing_id: selectedBilling.billingId,
        amount: amountDue,
      });
      setReceiptPreview({
        amountPaid: paymentResult.payment.amount || amountDue,
        paidAt: paymentResult.payment.payment_date ?? new Date().toISOString(),
        paymentMethod: paymentResult.payment.method,
        referenceNo: paymentResult.payment.reference_no ?? null,
      });
      setShowPaymentConfirm(true);
      return;
    } catch {
      return;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedBilling || !receiptPreview) {
      return;
    }

    try {
      openBillingReceiptPrintPage(
        buildReceiptPayload(selectedBilling, receiptPreview),
        { autoPrint: true }
      );
    } catch (error) {
      SweetAlert.errorAlert(
        "Print Failed",
        error instanceof Error && error.message.trim()
          ? error.message
          : "Unable to open the billing receipt print preview."
      );
    }
  };

  return (
    <RoleGuard allowedRoles={["CASHIER"]}>
      <div
        className="min-h-screen font-['DM_Sans']"
        style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e3d5c 100%)" }}
      >
        <div className="border-b border-white/10 px-8 py-6">
          <h1 className="font-['DM_Serif_Display'] text-3xl text-white tracking-wide mb-2">
            Billing Management
          </h1>
          <p className="text-white/60 text-sm">Process payments and manage patient bills</p>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bills", value: stats.total, icon: FileText, color: "#0f2244", bg: "#eef1f9" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "#c8102e", bg: "#fdf0f2" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#0e7c7b", bg: "#e0f4f4" },
              { label: "Revenue", value: `P${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "#7c4dab", bg: "#f3eefb" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-6">
                <div className="h-[3px] -mx-6 mb-4" style={{ background: color }} />
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={24} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#dce3ef] flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0f2244]">Bills Queue</h2>
                    <p className="text-xs text-[#6b7da0] mt-0.5">{filteredBills.length} bills found</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0bcd4]"
                      />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9 pr-3 py-2 text-xs rounded-lg outline-none border border-[#dce3ef] focus:border-[#0f2244] bg-[#f7f8fc]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as BillingFilter)
                      }
                      className="px-3 py-2 text-xs rounded-lg outline-none border border-[#dce3ef] focus:border-[#0f2244] bg-white"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="DONE">Completed</option>
                    </select>
                    <Button
                      variant="primary"
                      onClick={() => void refetch()}
                      className="!text-xs !px-3"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#dce3ef]" style={{ background: "#f7f8fc" }}>
                        <th className="text-left px-6 py-3 font-semibold text-[#6b7da0] text-xs uppercase">Bill Code</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#6b7da0] text-xs uppercase">Patient</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#6b7da0] text-xs uppercase">Amount</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#6b7da0] text-xs uppercase">Date</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#6b7da0] text-xs uppercase">Status</th>
                        <th className="text-center px-6 py-3 font-semibold text-[#6b7da0] text-xs uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <p className="text-[#6b7da0]">Loading bills...</p>
                          </td>
                        </tr>
                      ) : billingsError ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <AlertCircle size={32} className="mx-auto mb-2 text-[#c8102e]" />
                            <p className="text-[#0f2244] font-semibold">Unable to load billing records</p>
                            <p className="text-[#6b7da0] text-xs mt-1">
                              {getApiErrorMessage(
                                billingsError,
                                "Please try refreshing the billing dashboard."
                              )}
                            </p>
                          </td>
                        </tr>
                      ) : filteredBills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <AlertCircle size={32} className="mx-auto mb-2 text-[#b0bcd4]" />
                            <p className="text-[#6b7da0]">No bills found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredBills.map((bill) => {
                          const displayStatus = getBillingDisplayStatus(bill);

                          return (
                            <tr
                              key={bill.billingId}
                              className="border-b border-[#f0f3fa] hover:bg-[#f7f8fc] transition"
                            >
                              <td className="px-6 py-3">
                                <span className="font-semibold text-[#0f2244]">{bill.billingCode}</span>
                              </td>
                              <td className="px-6 py-3 text-[#1a2a45]">{bill.patientName}</td>
                              <td className="px-6 py-3 font-semibold text-[#0f2244]">
                                P{(bill.totalPrice - bill.discount).toLocaleString()}
                              </td>
                              <td className="px-6 py-3 text-[#6b7da0]">
                                {new Date(bill.requestedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-3">
                                <span
                                  className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                                    bill.isPaid
                                      ? "bg-[#e0f2f1] text-[#0e7c7b]"
                                      : "bg-[#fff3e0] text-[#f57c00]"
                                  }`}
                                >
                                  {displayStatus}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                {!bill.isPaid ? (
                                  <button
                                    onClick={() => handleSelectBilling(bill)}
                                    className="text-[#0f2244] hover:text-[#c8102e] font-semibold text-xs flex items-center gap-1 mx-auto"
                                  >
                                    Process <ChevronRight size={12} />
                                  </button>
                                ) : (
                                  <span className="text-[#6b7da0] text-xs">Completed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              {selectedBilling ? (
                <div className="bg-white rounded-2xl p-6 sticky top-8">
                  <div className="h-[3px] -mx-6 mb-4" style={{ background: "#c8102e" }} />
                  <h3 className="font-['DM_Serif_Display'] text-lg text-[#0f2244] mb-4">
                    {selectedBilling.billingCode}
                  </h3>
                  <div className="space-y-3 mb-6 pb-6 border-b border-[#dce3ef]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b7da0]">Patient</span>
                      <span className="font-semibold text-[#1a2a45]">{selectedBilling.patientName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b7da0]">Request Type</span>
                      <span className="font-semibold text-[#1a2a45]">{selectedBilling.requestType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b7da0]">Requested By</span>
                      <span className="font-semibold text-[#1a2a45]">
                        {selectedBilling.requestedBy || "Clinic"}
                      </span>
                    </div>
                    <div className="space-y-2 rounded-xl bg-[#f7f8fc] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#0f2244]">Bill Breakdown</span>
                        <span className="text-[11px] uppercase tracking-wide text-[#6b7da0]">
                          {selectedBilling.breakdown.length} item
                          {selectedBilling.breakdown.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {selectedBilling.breakdown.length > 0 ? (
                        <div className="space-y-2">
                          {selectedBilling.breakdown.map((lineItem) => (
                            <div
                              key={lineItem.lineId}
                              className="flex items-start justify-between gap-3 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-[#1a2a45]">{lineItem.label}</p>
                                <p className="text-[11px] text-[#6b7da0]">
                                  Qty {lineItem.quantity} x P{lineItem.unitPrice.toFixed(2)}
                                </p>
                              </div>
                              <span className="font-semibold text-[#0f2244]">
                                P{lineItem.totalPrice.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#6b7da0]">
                          No detailed billing line items are available for this record yet.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b7da0]">Subtotal</span>
                      <span className="font-semibold text-[#1a2a45]">
                        P{selectedBilling.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {selectedBilling.discount > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6b7da0]">Discount</span>
                        <span className="font-semibold text-[#c8102e]">
                          -P{selectedBilling.discount.toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-base font-bold">
                      <span>Total Due</span>
                      <span className="text-[#0f2244]">P{amountDue.toFixed(2)}</span>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Select label="Payment Method" {...register("method")}>
                      <option value="CASH">Cash</option>
                      <option value="GCASH">GCash</option>
                      <option value="CARD">Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </Select>
                    <Input
                      label="Reference No. (Optional)"
                      type="text"
                      placeholder="GCash/Bank reference"
                      {...register("reference_no")}
                    />
                    <div className="flex gap-2 pt-4">
                      <Button variant="danger" type="button" onClick={resetPaymentFlow}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        isLoading={paymentPending || isProcessing}
                        className="flex-1"
                      >
                        Process Payment
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center sticky top-8">
                  <FileText size={48} className="mx-auto mb-4 text-[#b0bcd4]" />
                  <p className="text-[#6b7da0] font-semibold mb-1">No Bill Selected</p>
                  <p className="text-sm text-[#b0bcd4]">Click &quot;Process&quot; on a pending bill to begin</p>
                </div>
              )}
            </div>
          </div>

          {showReceipt && selectedBilling && receiptPreview ? (
            <ReceiptModal
              billingCode={selectedBilling.billingCode}
              patientName={selectedBilling.patientName}
              patientCode={selectedBilling.patientCode}
              requestType={selectedBilling.requestType}
              requestedBy={selectedBilling.requestedBy}
              requestedDate={selectedBilling.requestedDate}
              breakdown={selectedBilling.breakdown}
              subtotal={selectedBilling.totalPrice}
              discount={selectedBilling.discount}
              amountPaid={receiptPreview.amountPaid}
              paymentMethod={receiptPreview.paymentMethod}
              referenceNo={receiptPreview.referenceNo}
              paidAt={receiptPreview.paidAt}
              onClose={resetPaymentFlow}
              onPrint={handlePrintReceipt}
            />
          ) : null}
        </div>
      </div>

      {showPaymentConfirm && selectedBilling ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#e0f4f4] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-[#0e7c7b]" />
            </div>
            <div>
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#0f2244] mb-2">Payment Successful</h2>
              <p className="text-[#6b7da0] text-sm">
                Amount: P{amountDue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
              {receiptPreview ? (
                <p className="mt-1 text-xs text-[#8a9ab6]">
                  Method: {receiptPreview.paymentMethod.replaceAll("_", " ")}
                </p>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={resetPaymentFlow}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPaymentConfirm(false);
                  setShowReceipt(true);
                }}
                className="flex-1"
              >
                Show Receipt
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </RoleGuard>
  );
};

export default BillingDashboard;

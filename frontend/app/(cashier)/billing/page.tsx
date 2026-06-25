"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/guards/RoleGuard";
import ReceiptModal from "@/components/Modal/ReceiptModal";
import { useBillings } from "@/hooks/Billing/useBilling";
import { BillingRecord, SortKey } from "@/types/BillingTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  FileText, CheckCircle2, Clock, Search,
  ChevronRight, TrendingUp, AlertCircle,
  RefreshCw, Receipt,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import Pagination from "@/components/Pagination";
import ProcessPaymentModal from "@/components/Modal/ChildModal/ProcessPaymentModal";
import { PaymentProps } from "@/types/BillingTypes";
import Card from "@/components/ui/Card";
import CardLabel from "@/components/ui/CardLabel";
import BillingReviewModal from "@/components/Modal/ChildModal/BillingReviewModal";
import SummaryCards from "@/components/ui/SummaryCards";

// ── Types ──────────────────────────────────────────────────────────────────

type BillingFilter = "ALL" | "PENDING" | "DONE";
type ReceiptPreview = {
  amountPaid: number;
  paidAt: string;
  paymentMethod: PaymentProps["method"];
  referenceNo?: string | null;
};

// ── Main Page ──────────────────────────────────────────────────────────────

const BillingDashboard = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [dateFrom] = useState("");
  const [dateTo] = useState("");
  const [typeFilters] = useState<string>("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [totalEntries, setTotalEntries] = useState(0);
  const [sortKey] = useState<SortKey>("date_desc");
  const [statusFilter, setStatusFilter] = useState<BillingFilter>("ALL");

  // Modal state
  const [reviewBilling, setReviewBilling] = useState<BillingRecord | null>(null);
  const [paymentBilling, setPaymentBilling] = useState<BillingRecord | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<ReceiptPreview | null>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [confirmedBilling, setConfirmedBilling] = useState<BillingRecord | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const { data, error: billingsError, isLoading: loading, refetch } = useBillings({
    page,
    search: debouncedSearch,
    status: statusFilter,
    limit: rowsPerPage,
    type: typeFilters,
    sort: sortKey,
    dateFrom,
    dateTo,
  });

  const bills = data?.data ?? [];
  const meta = data?.pagination;
  const totalPages = meta?.totalPages ?? 1;

  const stats = data?.stats;

  // console.log('stats', data)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalEntries(meta?.total ?? 0);
  }, [meta]);

  const calculateStartIndex = () => totalEntries === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const calculateEndIndex = () => Math.min(page * rowsPerPage, totalEntries);

  const handlePaymentSuccess = (billing: BillingRecord, preview: ReceiptPreview) => {
    setPaymentBilling(null);
    setConfirmedBilling(billing);
    setReceiptPreview(preview);
    setShowPaymentConfirm(true);
    void refetch();
  };

  const resetAll = () => {
    setPaymentBilling(null);
    setConfirmedBilling(null);
    setReceiptPreview(null);
    setShowPaymentConfirm(false);
    setShowReceipt(false);
  };

  const STAT_CONFIG = [
    {
      label: "Total Bills",
      value: stats?.total ?? 0,
      icon: FileText,
      color: "#0f2244",
      bg: "#eef1f9",
      bar: "#0f2244",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "#c8102e",
      bg: "#fdf0f2",
      bar: "#c8102e",
    },
    {
      label: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "#0e7c7b",
      bg: "#e0f4f4",
      bar: "#0e7c7b",
    },
    {
      label: "Revenue",
      value: `₱${(stats?.revenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "#7c4dab",
      bg: "#f3eefb",
      bar: "#7c4dab",
    },
  ];
  const HandleActionButton = (billing: BillingRecord) => {
    if (billing.isPaid === true) {
      return;
    }
    // setShowPaymentModal(true);
    // setPaymentBilling(billing)
    setReviewBilling(billing);
    setShowReviewModal(true);
  }

  const handleReviewSuccess = (
    updatedBilling: BillingRecord
  ) => {
    setShowReviewModal(false);

    setPaymentBilling(updatedBilling);
    setShowPaymentModal(true);
  };

  const HandleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentBilling(null)
    setShowReviewModal(false)
    setReviewBilling(null);
  }

  return (
    <RoleGuard allowedRoles={["CASHIER", "ADMIN"]}>

      {showReviewModal && reviewBilling && (
        <BillingReviewModal
          billing={reviewBilling}
          onClose={HandleCloseModal}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* ── Payment modal ── */}
      {showPaymentModal && paymentBilling && (
        <ProcessPaymentModal
          billing={paymentBilling}
          onClose={HandleCloseModal}
          onSuccess={(preview) => handlePaymentSuccess(paymentBilling, preview)}
        />
      )}

      {/* ── Receipt modal ── */}
      {showReceipt && confirmedBilling && receiptPreview ? (
        <ReceiptModal
          billingCode={confirmedBilling.billingCode}
          patientName={confirmedBilling.patientName}
          patientCode={confirmedBilling.patientCode}
          requestType={confirmedBilling.requestType}
          requestedBy={confirmedBilling.requestedBy}
          requestedDate={confirmedBilling.requestedDate}
          breakdown={confirmedBilling.breakdown}
          subtotal={confirmedBilling.totalPrice}
          discount={confirmedBilling.discount}
          amountPaid={receiptPreview.amountPaid}
          paymentMethod={receiptPreview.paymentMethod}
          referenceNo={receiptPreview.referenceNo}
          paidAt={receiptPreview.paidAt}
          onClose={resetAll}
        />
      ) : null}

      <div
        className="min-h-screen font-['DM_Sans']"
        style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}
      >

        {/* ── Page header ── */}
        <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide leading-tight">
              Billing Management
            </h1>
            <p className="text-black/60 text-sm">Process payments and manage patient bills</p>
          </div>
        </div>

        <div className="px-8 py-2 space-y-5">

          {/* ── Stats row ── */}
          <SummaryCards
            items={STAT_CONFIG}
          />

          {/* ── Bills queue table (full width now) ── */}
          <Card>
            <div className="h-[3px]" style={{ background: "#0f2244" }} />

            {/* Toolbar */}
            <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
              style={{ borderBottom: "1px solid #f0f3fa" }}>
              <div>
                <CardLabel>Bills Queue</CardLabel>
                <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>
                  {totalEntries} bills total
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
                    placeholder="Search patient, bill…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                    style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "190px" }}
                  />
                </div>

                {/* Status tabs */}
                <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid #dce3ef" }}>
                  {(["ALL", "PENDING", "DONE"] as BillingFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setStatusFilter(f); setPage(1); }}
                      className="px-3 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{
                        background: statusFilter === f ? "#0f2244" : "white",
                        color: statusFilter === f ? "white" : "#6b7da0",
                      }}
                    >
                      {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : "Done"}
                    </button>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  onClick={() => void refetch()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#6b7da0" }}
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto" style={{ minHeight: "480px", maxHeight: "580px" }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                    {["Bill Code", "Patient", "Request Type", "Amount", "Date", "Status", "Action"].map((h) => (
                      <th key={h}
                        className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#8a99b8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw size={22} className="animate-spin" style={{ color: "#b0bcd4" }} />
                          <p className="text-[12px]" style={{ color: "#8a99b8" }}>Loading bills…</p>
                        </div>
                      </td>
                    </tr>
                  ) : billingsError ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <AlertCircle size={28} className="mx-auto mb-2" style={{ color: "#c8102e" }} />
                        <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>Unable to load records</p>
                        <p className="text-xs mt-1" style={{ color: "#6b7da0" }}>
                          {getApiErrorMessage(billingsError, "Please try refreshing.")}
                        </p>
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <FileText size={28} className="mx-auto mb-2" style={{ color: "#c0ccd8" }} />
                        <p className="text-sm" style={{ color: "#8a99b8" }}>No bills found</p>
                      </td>
                    </tr>
                  ) : bills.map((bill) => {
                    const net = bill.totalPrice - bill.discount;
                    const isSelected = paymentBilling?.billingId === bill.billingId;
                    return (
                      <tr
                        key={bill.billingId}
                        onClick={() => HandleActionButton(bill)}
                        className={`${isSelected ? 'bg-blue-900/20' : ''} group transition-all hover:bg-blue-900/10 hover:text-white bg-white-100`}
                      >
                        {/* Bill code */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[12px] font-semibold" style={{ color: "#0f2244" }}>
                            {bill.billingCode}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background: "#eef1f9", color: "#0f2244" }}>
                              {bill.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-[12.5px]" style={{ color: "#1a2a45" }}>{bill.patientName}</p>
                              <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>#{bill.patientCode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Request type */}
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              background: bill.requestType === "LABORATORY" ? "#f3eefb"
                                : bill.requestType === "CERTIFICATE" ? "#e0f4f4" : "#eef1f9",
                              color: bill.requestType === "LABORATORY" ? "#7c4dab"
                                : bill.requestType === "CERTIFICATE" ? "#0e7c7b" : "#0f2244",
                            }}>
                            {bill.requestType}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-[13px]" style={{ color: "#0f2244" }}>
                            ₱{net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </p>
                          {bill.discount > 0 && (
                            <p className="text-[10px]" style={{ color: "#c8102e" }}>
                              -₱{bill.discount.toFixed(2)} disc.
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <span className="text-[12px]" style={{ color: "#6b7da0" }}>
                            {new Date(bill.requestedDate).toLocaleDateString("en-PH", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          {bill.isPaid ? (
                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: "#e0f4f4", color: "#065050" }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0e7c7b]" />
                              Done
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: "#fffbeb", color: "#92400e" }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5">
                          {!bill.isPaid ? (
                            <button
                              onClick={() => HandleActionButton(bill)}
                              className="flex items-center gap-1 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                              style={{ background: "#eef1f9", color: "#0f2244" }}
                            >
                              Process <ChevronRight size={11} />
                            </button>
                          ) : (
                            <span className="text-[11px]" style={{ color: "#c0ccd8" }}>Completed</span>
                          )}
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

      {/* ── Payment success modal ── */}
      {showPaymentConfirm && confirmedBilling ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden"
            style={{ boxShadow: "0 32px 96px rgba(15,34,68,0.28)" }}>

            {/* Success hero */}
            <div className="px-8 py-8 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)" }}>
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: "rgba(255,255,255,0.04)" }} />
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center relative z-10"
                style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)" }}>
                <CheckCircle2 size={30} className="text-white" />
              </div>
              <h2 className="font-['DM_Serif_Display'] text-2xl text-white mb-1 relative z-10">
                Payment Successful
              </h2>
              <p className="text-[13px] relative z-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                {confirmedBilling.patientName}
              </p>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-3" style={{ borderBottom: "1px solid #f0f3fa" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8a99b8" }}>Amount Paid</span>
                <span className="font-bold" style={{ color: "#0f2244" }}>
                  ₱{(receiptPreview?.amountPaid ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {receiptPreview && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8a99b8" }}>Method</span>
                  <span className="font-semibold" style={{ color: "#1a2a45" }}>
                    {receiptPreview.paymentMethod.replaceAll("_", " ")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8a99b8" }}>Bill</span>
                <span className="font-mono text-[12px] font-semibold" style={{ color: "#1a2a45" }}>
                  {confirmedBilling.billingCode}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 flex gap-3">
              <button
                onClick={resetAll}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-colors"
                style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
              >
                Close
              </button>
              <button
                onClick={() => { setShowPaymentConfirm(false); setShowReceipt(true); }}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0f2244, #0e7c7b)" }}
              >
                <Receipt size={13} /> View Receipt
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </RoleGuard>
  );
};

export default BillingDashboard;
"use client";

import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  CreditCard,
} from "lucide-react";
import RoleGuard from "@/guards/RoleGuard";
import Button from "@/components/ui/Button";
import { useBillings, usePayBilling } from "@/hooks/Billing/useBilling";
import { BillingRecord } from "@/types/BillingTypes";

type BillingFilter = "all" | "paid" | "unpaid";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const formatCurrency = (value: number) => pesoFormatter.format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not yet paid";

  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClasses = (status: BillingRecord["status"]) =>
  status === "paid"
    ? "bg-[#e8f7ee] text-[#2f7d4b]"
    : "bg-[#fff4df] text-[#9a6a18]";

export default function BillingPage() {
  const [activeFilter, setActiveFilter] = useState<BillingFilter>("all");
  const { data: billings = [], isLoading } = useBillings();
  const { mutateAsync: markBillingPaid, isPending: postingPayment } = usePayBilling();
  const [busyBillingId, setBusyBillingId] = useState<number | null>(null);

  const filteredBillings = useMemo(() => {
    if (activeFilter === "all") {
      return billings;
    }

    return billings.filter((billing) => billing.status === activeFilter);
  }, [activeFilter, billings]);

  const unpaidCount = useMemo(
    () => billings.filter((billing) => billing.status === "unpaid").length,
    [billings]
  );
  const paidCount = useMemo(
    () => billings.filter((billing) => billing.status === "paid").length,
    [billings]
  );
  const totalOutstanding = useMemo(
    () =>
      billings
        .filter((billing) => billing.status === "unpaid")
        .reduce((total, billing) => total + billing.totalPrice, 0),
    [billings]
  );

  const handleMarkPaid = async (billingId: number) => {
    try {
      setBusyBillingId(billingId);
      await markBillingPaid({ billingId, method: "CASH" });
    } finally {
      setBusyBillingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "CASHIER"]}>
      <div className="min-h-full p-6 md:p-7">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-[#d2ebe6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f8a83]">
                  Cashier Billing
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#143a35]">
                  Laboratory billing queue
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-[#5f8a83]">
                  Post payment here before the laboratory can accept a queued test request.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "unpaid", "paid"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeFilter === filter
                        ? "bg-[#143a35] text-white"
                        : "bg-[#eef7f4] text-[#2f5e57] hover:bg-[#e2f1ec]"
                    }`}
                  >
                    {filter === "all"
                      ? "All bills"
                      : filter === "unpaid"
                        ? "Unpaid"
                        : "Paid"}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">All Laboratory Bills</p>
                <BadgeDollarSign size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{billings.length}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Auto-refreshes every 10 seconds</p>
            </div>

            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Unpaid Bills</p>
                <Clock3 size={18} className="text-[#d18c1d]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{unpaidCount}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Still locked in the lab queue</p>
            </div>

            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Paid Bills</p>
                <CheckCircle2 size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">{paidCount}</p>
              <p className="mt-1 text-xs text-[#5f8a83]">Ready for lab acceptance</p>
            </div>

            <div className="rounded-2xl border border-[#d2ebe6] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#2f5e57]">Outstanding Amount</p>
                <CreditCard size={18} className="text-[#2f9f90]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#143a35]">
                {formatCurrency(totalOutstanding)}
              </p>
              <p className="mt-1 text-xs text-[#5f8a83]">Remaining cashier collection</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#c8e4de] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#133d37]">Billing table</h2>
                <p className="mt-1 text-sm text-[#5f8a83]">
                  Use the payment action to unlock the accept button in the lab queue.
                </p>
              </div>
              <div className="rounded-full bg-[#e3f6f2] px-3 py-1 text-xs font-medium text-[#2e6e64]">
                {filteredBillings.length} visible
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84]">
                  Loading billing records...
                </div>
              ) : filteredBillings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbe6e1] bg-[#f5fbfa] px-4 py-6 text-center text-sm text-[#5c8b84]">
                  No billing records matched the current filter.
                </div>
              ) : (
                filteredBillings.map((billing) => (
                  <div
                    key={billing.billingId}
                    className="rounded-2xl border border-[#d5ebe6] bg-[#fbfefe] p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[#e6f7f3] px-2 py-1 text-xs font-semibold text-[#2e7a6e]">
                            {billing.billingCode}
                          </span>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusClasses(
                              billing.status
                            )}`}
                          >
                            {billing.status === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </div>

                        <div>
                          <p className="text-base font-semibold text-[#173f39]">
                            {billing.patientName}
                          </p>
                          <p className="text-xs text-[#63867f]">
                            {billing.patientCode} • Request #{billing.requestId}
                          </p>
                        </div>

                        <div className="text-sm text-[#5f8a83]">
                          <p>
                            <span className="font-semibold text-[#173f39]">Tests:</span>{" "}
                            {billing.tests.join(", ") || "No test details"}
                          </p>
                          <p>
                            <span className="font-semibold text-[#173f39]">Requested by:</span>{" "}
                            {billing.requestedBy || "Doctor"}
                          </p>
                          <p>
                            <span className="font-semibold text-[#173f39]">Requested at:</span>{" "}
                            {formatDateTime(billing.requestedDate)}
                          </p>
                          <p>
                            <span className="font-semibold text-[#173f39]">Paid at:</span>{" "}
                            {formatDateTime(billing.paidAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-[220px] flex-col gap-3 rounded-2xl bg-[#f4faf8] p-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#63867f]">
                            Total bill
                          </p>
                          <p className="mt-1 text-2xl font-bold text-[#143a35]">
                            {formatCurrency(billing.totalPrice)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#63867f]">
                            Payment method
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#173f39]">
                            {billing.paymentMethod ?? "Pending cashier posting"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleMarkPaid(billing.billingId)}
                          disabled={billing.isPaid || postingPayment}
                          className="w-full"
                        >
                          {busyBillingId === billing.billingId
                            ? "Posting payment..."
                            : billing.isPaid
                              ? "Payment Posted"
                              : "Mark as Paid"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </RoleGuard>
  );
}

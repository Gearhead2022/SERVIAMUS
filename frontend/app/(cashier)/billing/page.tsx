"use client"

import RoleGuard from "@/guards/RoleGuard";
import { useState, useMemo } from "react";
import { useProcessPayment } from "@/hooks/Billing/useBilling";
import { PaymentProps, BillingProps } from "@/types/BillingTypes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useForm } from "react-hook-form";
import { 
  FileText, CheckCircle2, Clock, 
  Search, ChevronRight, TrendingUp, AlertCircle 
} from "lucide-react";

interface BillItem {
  billing_id: number;
  billing_code: string;
  patient_name: string;
  amount: number;
  status: "PENDING" | "DONE";
  date: string;
  req_type: string;
}

const BillingDashboard = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "DONE">("ALL");
  const [selectedBilling, setSelectedBilling] = useState<BillingProps | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data - in production, fetch from API
  const [bills] = useState<BillItem[]>([
    {
      billing_id: 1,
      billing_code: "BILL20251001",
      patient_name: "John Doe",
      amount: 1500,
      status: "PENDING",
      date: "2025-10-13",
      req_type: "LABORATORY",
    },
    {
      billing_id: 2,
      billing_code: "BILL20251002",
      patient_name: "Jane Smith",
      amount: 2000,
      status: "DONE",
      date: "2025-10-12",
      req_type: "LABORATORY",
    },
    {
      billing_id: 3,
      billing_code: "BILL20251003",
      patient_name: "Robert Johnson",
      amount: 1200,
      status: "PENDING",
      date: "2025-10-13",
      req_type: "LABORATORY",
    },
  ]);

  const { mutateAsync: processPayment, isPending: paymentPending } = useProcessPayment(() => {
    setSelectedBilling(null);
    setIsProcessing(false);
  });

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<PaymentProps>({
    defaultValues: {
      method: "CASH",
    },
  });

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        search === "" ||
        bill.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        bill.billing_code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || bill.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, bills]);

  const stats = {
    total: bills.length,
    pending: bills.filter((b) => b.status === "PENDING").length,
    completed: bills.filter((b) => b.status === "DONE").length,
    totalRevenue: bills
      .filter((b) => b.status === "DONE")
      .reduce((sum, b) => sum + b.amount, 0),
  };

  const onSubmit = async (data: PaymentProps) => {
    if (!selectedBilling) return;
    setIsProcessing(true);

    try {
      await processPayment({
        ...data,
        billing_id: selectedBilling.billing_id,
        amount: selectedBilling.total_price - selectedBilling.discount,
      });
      reset();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["CASHIER"]}>
      <div
        className="min-h-screen font-['DM_Sans']"
        style={{
          background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e3d5c 100%)",
        }}
      >
        {/* Header */}
        <div className="border-b border-white/10 px-8 py-6">
          <h1 className="font-['DM_Serif_Display'] text-3xl text-white tracking-wide mb-2">
            Billing Management
          </h1>
          <p className="text-white/60 text-sm">Process payments and manage patient bills</p>
        </div>

        <div className="px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bills", value: stats.total, icon: FileText, color: "#0f2244", bg: "#eef1f9" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "#c8102e", bg: "#fdf0f2" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#0e7c7b", bg: "#e0f4f4" },
              { label: "Revenue", value: `₱${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "#7c4dab", bg: "#f3eefb" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-6">
                <div className="h-[3px] -mx-6 mb-4" style={{ background: color }} />
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
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

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-6">
            {/* Bills List */}
            <div className="col-span-2">
              <div className="bg-white rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#dce3ef] flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0f2244]">Bills Queue</h2>
                    <p className="text-xs text-[#6b7da0] mt-0.5">{filteredBills.length} bills found</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0bcd4]" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 text-xs rounded-lg outline-none border border-[#dce3ef] focus:border-[#0f2244] bg-[#f7f8fc]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PENDING" | "DONE")}
                      className="px-3 py-2 text-xs rounded-lg outline-none border border-[#dce3ef] focus:border-[#0f2244] bg-white"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="DONE">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Bills Table */}
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
                      {filteredBills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <AlertCircle size={32} className="mx-auto mb-2 text-[#b0bcd4]" />
                            <p className="text-[#6b7da0]">No bills found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredBills.map((bill) => (
                          <tr
                            key={bill.billing_id}
                            className="border-b border-[#f0f3fa] hover:bg-[#f7f8fc] transition"
                          >
                            <td className="px-6 py-3">
                              <span className="font-semibold text-[#0f2244]">{bill.billing_code}</span>
                            </td>
                            <td className="px-6 py-3 text-[#1a2a45]">{bill.patient_name}</td>
                            <td className="px-6 py-3 font-semibold text-[#0f2244]">₱{bill.amount.toLocaleString()}</td>
                            <td className="px-6 py-3 text-[#6b7da0]">
                              {new Date(bill.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                                  bill.status === "DONE"
                                    ? "bg-[#e0f2f1] text-[#0e7c7b]"
                                    : "bg-[#fff3e0] text-[#f57c00]"
                                }`}
                              >
                                {bill.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              {bill.status === "PENDING" ? (
                                <button
                                  onClick={() => {
                                    setSelectedBilling({
                                      billing_id: bill.billing_id,
                                      billing_code: bill.billing_code,
                                      req_id: 0,
                                      total_price: bill.amount,
                                      discount: 0,
                                      date: bill.date,
                                      status: "PENDING",
                                      services: [],
                                      patient: { name: bill.patient_name, patient_code: "", patient_id: 0 },
                                      request: { req_type: bill.req_type as "LABORATORY" | "CONSULTATION", req_date: bill.date },
                                    });
                                  }}
                                  className="text-[#0f2244] hover:text-[#c8102e] font-semibold text-xs flex items-center gap-1 mx-auto"
                                >
                                  Process <ChevronRight size={12} />
                                </button>
                              ) : (
                                <span className="text-[#6b7da0] text-xs">Completed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Panel */}
            <div>
              {selectedBilling ? (
                <div className="bg-white rounded-2xl p-6 sticky top-8">
                  <div className="h-[3px] -mx-6 mb-4" style={{ background: "#c8102e" }} />
                  <h3 className="font-['DM_Serif_Display'] text-lg text-[#0f2244] mb-4">{selectedBilling.billing_code}</h3>

                  {/* Bill Summary */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-[#dce3ef]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b7da0]">Patient</span>
                      <span className="font-semibold text-[#1a2a45]">{selectedBilling.patient.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b7da0]">Subtotal</span>
                      <span className="font-semibold text-[#1a2a45]">₱{selectedBilling.total_price.toFixed(2)}</span>
                    </div>
                    {selectedBilling.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6b7da0]">Discount</span>
                        <span className="font-semibold text-[#c8102e]">-₱{selectedBilling.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold">
                      <span>Total Due</span>
                      <span className="text-[#0f2244]">
                        ₱{(selectedBilling.total_price - selectedBilling.discount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Select label="Payment Method" {...register("method")}>
                        <option value="CASH">Cash</option>
                        <option value="GCASH">GCash</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                      </Select>
                    </div>

                    <div>
                      <Input
                        label="Reference No. (Optional)"
                        type="text"
                        placeholder="GCash/Bank reference"
                        {...register("reference_no")}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="danger"
                        type="button"
                        onClick={() => setSelectedBilling(null)}
                      >
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
        </div>
      </div>
    </RoleGuard>
  );
};

export default BillingDashboard;
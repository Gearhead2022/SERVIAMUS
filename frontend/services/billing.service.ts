import api from "./axios";
import {
  BillingBreakdownItem,
  BillingRecord,
  BillingRequestType,
  PaymentRecord, PaymentMethod
} from "@/types/BillingTypes";

type BillingBreakdownApiItem = {
  line_id: string;
  label: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
  source: "service" | "lab-test";
};

export type BillingApiResponse = {
  billing_code: string;
  billing_id: number;
  breakdown?: BillingBreakdownApiItem[];
  date: string | Date;
  discount?: number | string | null;
  discount_reason?: string;
  payments?: Array<{
    method?: PaymentMethod | null;
    payment_date?: string | Date | null;
  }>;
  requested_by?: string | null;
  req_id: number;
  request?: {
    patient?: {
      name?: string | null;
      patient_code?: string | null;
      patient_id?: number | null;
    } | null;
    req_date?: string | Date;
    req_type?: BillingRequestType;
  } | null;
  status: "PENDING" | "DONE";
  total_price: number | string;
};

export type PaymentApiResponse = {
  payment_id: number;
  billing_id: number;
  amount: number;
  method: string;
  payment_date: string;
  reference_no?: string | null;
  notes?: string | null;

  billing: BillingApiResponse;
};

export const toFrontendBilling = (billing: BillingApiResponse): BillingRecord => {
  const breakdown: BillingBreakdownItem[] = (billing.breakdown ?? []).map((item) => ({
    lineId: item.line_id,
    label: item.label,
    quantity: Number(item.quantity ?? 1),
    unitPrice: Number(item.unit_price ?? 0),
    totalPrice: Number(item.total_price ?? 0),
    source: item.source,
  }));
  const latestPayment = billing.payments?.[0] ?? null;
  const requestedDate = new Date(
    billing.request?.req_date ?? billing.date
  ).toISOString();

  return {
    billingId: billing.billing_id,
    billingCode: billing.billing_code,
    requestId: billing.req_id,
    requestType: billing.request?.req_type ?? "LABORATORY",
    patientId: billing.request?.patient?.patient_id ?? 0,
    patientCode:
      billing.request?.patient?.patient_code ??
      `PT-${String(billing.request?.patient?.patient_id ?? 0).padStart(4, "0")}`,
    patientName: billing.request?.patient?.name ?? "Unknown",
    requestedBy: billing.requested_by ?? null,
    requestedDate,
    tests: breakdown.map((item) => item.label),
    totalPrice: Number(billing.total_price ?? 0),
    discount: Number(billing.discount ?? 0),
    discountReason: billing.discount_reason ?? null,
    breakdown,
    status: billing.status === "DONE" ? "paid" : "unpaid",
    isPaid: billing.status === "DONE",
    paymentMethod: latestPayment?.method ?? null,
    paidAt: latestPayment?.payment_date
      ? new Date(latestPayment.payment_date).toISOString()
      : null,
  };
};

export const toFrontendPayment = (
  payment: PaymentApiResponse
): PaymentRecord => {
  const billing = toFrontendBilling(payment.billing);

  return {
    paymentId: payment.payment_id,

    billingId: payment.billing_id,

    billingCode: billing.billingCode,

    patientName: billing.patientName,

    patientCode: billing.patientCode,

    requestType: billing.requestType,

    requestedBy: billing.requestedBy ?? "",
    requestedDate: billing.requestedDate,

    amount: Number(payment.amount),

    totalPrice: billing.totalPrice,
    discount: billing.discount,

    discountReason: billing.discountReason,

    breakdown: billing.breakdown,
    amountPaid: Number(payment.amount),

    method: payment.method as PaymentMethod,

    referenceNo: payment.reference_no,

    paidAt: payment.payment_date,

    status: billing.isPaid ? "PAID" : "VOIDED",

    billing,
  };
};
export const fetchBillings = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  type: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {
  const res = await api.get("/api/billing", {
    params: {
      page,
      limit,
      search,
      status,
      type,
      dateFrom,
      dateTo,
      sort
    }
  });

  const items = (res.data.data.data ?? []) as BillingApiResponse[];
  return {
    data: items.map(toFrontendBilling),
    stats: res.data.data.stats,
    pagination: res.data.data.pagination,
  };
};

export const payBilling = async (
  billingId: number,
  method: PaymentMethod = "CASH"
) => {
  const res = await api.patch(`/api/billing/${billingId}/pay`, { method });
  return toFrontendBilling(res.data.data as BillingApiResponse);
};

export const fetchPayment = async (
  search?: string,
  status?: string,
  method?: string,
  type?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string,
) => {
  const res = await api.get("/api/billing/getAllPayments", {
    params: {
      search,
      status,
      method,
      type,
      dateFrom,
      dateTo,
      sort,
    },
  });

  const items = (res.data.data.data ?? []) as PaymentApiResponse[];
  return {
    data: items.map(toFrontendPayment),
    stats: res.data.data.stats,
    pagination: res.data.data.pagination,
  };
};

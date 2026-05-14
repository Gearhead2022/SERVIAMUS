import api from "./axios";
import {
  BillingRecord,
  BillingRequestType,
  PaymentMethod,
} from "@/types/BillingTypes";

type BillingApiResponse = {
  billing_code: string;
  billing_id: number;
  date: string | Date;
  discount?: number | string | null;
  payments?: Array<{
    method?: PaymentMethod | null;
    payment_date?: string | Date | null;
  }>;
  req_id: number;
  request?: {
    laboratory?: {
      req_by?: string | null;
    } | null;
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

const toFrontendBilling = (billing: BillingApiResponse): BillingRecord => {
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
    requestedBy: billing.request?.laboratory?.req_by ?? null,
    requestedDate,
    tests: [],
    totalPrice: Number(billing.total_price ?? 0),
    discount: Number(billing.discount ?? 0),
    status: billing.status === "DONE" ? "paid" : "unpaid",
    isPaid: billing.status === "DONE",
    paymentMethod: latestPayment?.method ?? null,
    paidAt: latestPayment?.payment_date
      ? new Date(latestPayment.payment_date).toISOString()
      : null,
  };
};

export const fetchBillings = async () => {
  const res = await api.get("/api/billing");
  const items = (res.data.data ?? []) as BillingApiResponse[];
  return items.map(toFrontendBilling);
};

export const payBilling = async (
  billingId: number,
  method: PaymentMethod = "CASH"
) => {
  const res = await api.patch(`/api/billing/${billingId}/pay`, { method });
  return toFrontendBilling(res.data.data as BillingApiResponse);
};

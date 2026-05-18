// HAS 400 ERROR WHEN TESTING WITHOUT ACCESS
import api from "./axios";
import { PaymentProps, ProcessedPaymentResult } from "@/types/BillingTypes";
import { BillingApiResponse, toFrontendBilling } from "./billing.service";

export const getBillingByRequestId = async (req_id: number) => {
  const res = await api.get(`/api/billing/request/${req_id}`);
  return res.data.data;
};

export const getBillingById = async (billing_id: number) => {
  const res = await api.get(`/api/billing/${billing_id}`);
  return res.data.data;
};

export const createBilling = async (req_id: number, serviceIds: number[]) => {
  const res = await api.post("/api/billing/create", {
    req_id,
    service_ids: serviceIds,
  });
  return res.data.data;
};

export const processPayment = async (data: PaymentProps) => {
  const res = await api.post("/api/billing/payment", data);
  const result = res.data.data as {
    payment: {
      payment_id?: number;
      amount: number | string;
      method: PaymentProps["method"];
      reference_no?: string | null;
      payment_date?: string | null;
    };
    billing: BillingApiResponse;
  };

  return {
    payment: {
      payment_id: result.payment?.payment_id,
      amount: Number(result.payment?.amount ?? 0),
      method: result.payment?.method ?? data.method,
      reference_no: result.payment?.reference_no ?? null,
      payment_date: result.payment?.payment_date ?? null,
    },
    billing: toFrontendBilling(result.billing),
  } satisfies ProcessedPaymentResult;
};

export const updateBillingStatus = async (
  billing_id: number,
  status: "PENDING" | "DONE"
) => {
  const res = await api.put(`/api/billing/${billing_id}`, { status });
  return res.data.data;
};

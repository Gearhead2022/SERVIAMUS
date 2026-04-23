// HAS 400 ERROR WHEN TESTING WITHOUT ACCESS
import api from "./axios";
import { PaymentProps } from "@/types/BillingTypes";

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
  return res.data.data;
};

export const updateBillingStatus = async (
  billing_id: number,
  status: "PENDING" | "DONE"
) => {
  const res = await api.put(`/api/billing/${billing_id}`, { status });
  return res.data.data;
};
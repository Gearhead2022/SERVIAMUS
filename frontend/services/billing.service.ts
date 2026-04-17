import api from "./axios";
import { BillingRecord, PaymentMethod } from "@/types/BillingTypes";

const toFrontendBilling = (billing: BillingRecord): BillingRecord => ({
  ...billing,
  requestedDate: new Date(billing.requestedDate).toISOString(),
  paidAt: billing.paidAt ? new Date(billing.paidAt).toISOString() : null,
});

export const fetchBillings = async () => {
  const res = await api.get("/api/billing");
  const items = (res.data.data ?? []) as BillingRecord[];
  return items.map(toFrontendBilling);
};

export const payBilling = async (
  billingId: number,
  method: PaymentMethod = "CASH"
) => {
  const res = await api.patch(`/api/billing/${billingId}/pay`, { method });
  return toFrontendBilling(res.data.data as BillingRecord);
};

import { BillingStatus } from "./LabTypes";

export type PaymentMethod = "CASH" | "GCASH" | "CARD" | "BANK_TRANSFER";

export type BillingRecord = {
  billingId: number;
  billingCode: string;
  requestId: number;
  patientId: number;
  patientCode: string;
  patientName: string;
  requestedBy?: string | null;
  requestedDate: string;
  tests: string[];
  totalPrice: number;
  discount: number;
  status: BillingStatus;
  isPaid: boolean;
  paymentMethod?: PaymentMethod | null;
  paidAt?: string | null;
};

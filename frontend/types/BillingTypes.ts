import { BillingStatus } from "./LabTypes";

export type PaymentMethod = "CASH" | "GCASH" | "CARD" | "BANK_TRANSFER";
export type BillingRequestType = "LABORATORY" | "CONSULTATION" | "CERTIFICATE";

export type BillingBreakdownItem = {
  lineId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  source: "service" | "lab-test";
};

export type ProcessedPaymentResult = {
  payment: {
    payment_id?: number;
    amount: number;
    method: PaymentMethod;
    reference_no?: string | null;
    payment_date?: string | null;
  };
  billing: BillingRecord;
};

export type BillingRecord = {
  billingId: number;
  billingCode: string;
  requestId: number;
  requestType: BillingRequestType;
  patientId: number;
  patientCode: string;
  patientName: string;
  requestedBy?: string | null;
  requestedDate: string;
  tests: string[];
  totalPrice: number;
  discount: number;
  breakdown: BillingBreakdownItem[];
  status: BillingStatus;
  isPaid: boolean;
  paymentMethod?: PaymentMethod | null;
  paidAt?: string | null;
};

export type PrintableBillingReceiptPayload = {
  billingCode: string;
  patientName: string;
  patientCode: string;
  requestType: BillingRequestType;
  requestedBy?: string | null;
  requestedDate: string;
  breakdown: BillingBreakdownItem[];
  subtotal: number;
  discount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string | null;
  paidAt?: string | null;
};
export interface BillingItemProps {
  service_list_id: number;
  service_id: number;
  service_code: string;
  description: string;
  price: number;
  quantity?: number;
}

export interface BillingProps {
  billing_id: number;
  billing_code: string;
  req_id: number;
  total_price: number;
  discount: number;
  date: string;
  status: "PENDING" | "DONE";
  services: BillingItemProps[];
  patient: {
    name: string;
    patient_code: string;
    patient_id: number;
  };
  request: {
    req_type: "LABORATORY" | "CONSULTATION";
    req_date: string;
  };
}

export interface PaymentProps {
  payment_id?: number;
  billing_id: number;
  amount: number;
  method: PaymentMethod;
  reference_no?: string;
  payment_date?: string;
}

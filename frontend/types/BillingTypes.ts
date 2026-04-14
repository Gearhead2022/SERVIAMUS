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
  method: "CASH" | "GCASH" | "CARD" | "BANK_TRANSFER";
  reference_no?: string;
  payment_date?: string;
}
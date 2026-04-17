export type LabResultPayload = Record<string, string>;
export type BillingStatus = "paid" | "unpaid";

export type LabCategory =
  | "clinical-chemistry"
  | "hematology"
  | "parasitology"
  | "urinalysis"
  | "other";

export type RequestStatus = "queued" | "pending" | "done";

export type DashboardLabType =
  | LabCategory
  | "serology"
  | "hba1c"
  | "chemistry"
  | "ogtt";

export type LabRequest = {
  labId: number;
  requestId: number;
  laboratoryRequestId: number;
  id: string;
  patientName: string;
  patientId: string;
  rawPatientId: number;
  testType: string;
  category: LabCategory;
  tests: string[];
  completedTests: string[];
  pendingTests: string[];
  totalTests: number;
  completedCount: number;
  requestedAt: string;
  requestedDate: string;
  age: string;
  priority: "Routine" | "Urgent";
  status: RequestStatus;
  requestStatus: RequestStatus;
  billingCode?: string | null;
  billingStatus: BillingStatus;
  billingTotal: number;
  isPaid: boolean;
  paidAt?: string | null;
  schemaKey?: string | null;
  requestedBy: string;
  address: string;
  sex: string;
  resultPayload?: LabResultPayload | null;
};

export type SearchPatientResult = {
  patient_id: number;
  name: string;
  age: number;
  sex: string;
  address: string;
  contact_number?: string | null;
};

export type PatientRecord = SearchPatientResult & {
  patient_code: string;
  birth_date?: string | null;
  religion?: string | null;
  created_at: string;
  lab_requests_count: number;
  medical_records_count: number;
  history_count: number;
  vital_signs_count: number;
};

export type CreateLabRequestPayload = {
  patientId: number;
  tests: string[];
  requestedBy?: string;
};

export type UpdateLabRequestStatusPayload = {
  labId: number;
  status: RequestStatus;
};

export type SaveLabResultPayload = {
  labId: number;
  category: LabCategory;
  form: LabResultPayload;
  pathologistUserId?: number | null;
};

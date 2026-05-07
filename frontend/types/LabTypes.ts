export type LabResultValue = string | number;
export type LabResultPayload = Record<string, LabResultValue>;
export type BillingStatus = "paid" | "unpaid";

export type LabUserRole = {
  roleId: number;
  roleName: string;
  roleDescription?: string | null;
};

export type LabUser = {
  userId: number;
  username: string;
  name: string;
  isActive: boolean;
  licenseNo?: string | null;
  title?: string | null;
  ptrNo?: string | null;
  roles: LabUserRole[];
};

export type LabCategory =
  | "clinical-chemistry"
  | "hematology"
  | "parasitology"
  | "urinalysis"
  | "other";

export type LabSchemaKey =
  | "CBC"
  | "BT"
  | "parasitology"
  | "urinalysis"
  | "clinical_chemistry"
  | "FBS"
  | "RBS"
  | "BUN"
  | "uricacid"
  | "totalcholesterol"
  | "HDL"
  | "LDL"
  | "triglycerides"
  | "SGPT"
  | "sodium"
  | "potassium"
  | "hba1c"
  | "OGTT"
  | "onehOGTT"
  | "twohOGTT"
  | "FOBT"
  | "dengue"
  | "hbsag"
  | "syphilis"
  | "serumPT"
  | "urinePT"
  | "hematology"
  | "serology"
  | "chemistry"
  | "ogtt"
  | "general";

export type LabTemplateKey =
  | "clinical-chemistry-panel"
  | "cbc"
  | "blood-typing"
  | "parasitology"
  | "urinalysis"
  | "serology"
  | "dengue"
  | "pregnancy-test"
  | "fecal-occult-blood"
  | "hba1c"
  | "chemistry-panel"
  | "single-chemistry"
  | "ogtt"
  | "general";

export type RequestStatus = "queued" | "pending" | "done";

export type LabRecordGroup =
  | "clinical-chemistry"
  | "clinical-microscopy"
  | "hematology"
  | "other"
  | "serology";

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
  schemaKey?: LabSchemaKey | null;
  recordGroup: LabRecordGroup;
  requestedBy: string;
  address: string;
  sex: string;
  resultPayload?: LabResultPayload | null;
};

export type LabTestCatalogItem = {
  testId: number;
  name: string;
  displayName: string;
  category: LabCategory;
  schemaKey?: LabSchemaKey | null;
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
  medTechUserId?: number | null;
  pathologistUserId?: number | null;
};

export type PatientLabRecordFilters = {
  dateFrom?: string;
  dateTo?: string;
  recordGroup?: LabRecordGroup | "all";
};

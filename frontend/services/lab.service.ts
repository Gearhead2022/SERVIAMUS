import api from "./axios";

export type LabCategory =
  | "clinical-chemistry"
  | "hematology"
  | "parasitology"
  | "urinalysis"
  | "other";
export type RequestStatus = "queued" | "pending" | "done";

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
  schemaKey?: string | null;
  requestedBy: string;
  address: string;
  sex: string;
  resultPayload?: Record<string, string> | null;
};

type LabRequestApiResponse = {
  labId: number;
  requestId: number;
  laboratoryRequestId: number;
  id: string;
  patientId: string;
  rawPatientId: number;
  patientName: string;
  age: string;
  sex: string;
  address: string;
  requestedBy: string;
  requestedAt: string;
  requestedDate: string;
  status: RequestStatus;
  requestStatus: RequestStatus;
  category: LabCategory;
  schemaKey?: string | null;
  tests: string[];
  completedTests: string[];
  pendingTests: string[];
  totalTests: number;
  completedCount: number;
  testType: string;
  priority: "Routine" | "Urgent";
  resultPayload?: Record<string, string> | null;
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

const toFrontendRequest = (item: LabRequestApiResponse): LabRequest => {
  const requestedAtDate = new Date(item.requestedAt || item.requestedDate);

  return {
    ...item,
    requestedAt: requestedAtDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    requestedDate: requestedAtDate.toISOString(),
  };
};

export const searchPatients = async (search: string) => {
  const res = await api.get("/api/lab/patients", {
    params: { search },
  });

  return (res.data.data ?? []) as SearchPatientResult[];
};

export const createLabRequest = async (payload: { patientId: number; tests: string[]; requestedBy?: string }) => {
  const res = await api.post("/api/lab/requests", payload);
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

export const fetchPatientRecords = async (search: string) => {
  const res = await api.get("/api/lab/records", {
    params: { search },
  });

  return (res.data.data ?? []) as PatientRecord[];
};

export const fetchLabRequests = async () => {
  const res = await api.get("/api/lab/requests");
  const items = (res.data.data ?? []) as LabRequestApiResponse[];
  return items.map(toFrontendRequest);
};

export const updateLabRequestStatus = async (labId: number, status: RequestStatus) => {
  const res = await api.patch(`/api/lab/requests/${labId}/status`, { status });
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

export const saveLabResult = async (payload: {
  labId: number;
  category: LabCategory;
  form: Record<string, string>;
  pathologistUserId?: number | null;
}) => {
  const res = await api.post("/api/lab/results", payload);
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

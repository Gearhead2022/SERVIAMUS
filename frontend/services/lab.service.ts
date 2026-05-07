import api from "./axios";
import {
  CreateLabRequestPayload,
  LabRequest,
  LabTestCatalogItem,
  LabUser,
  PatientLabRecordFilters,
  PatientRecord,
  RequestStatus,
  SaveLabResultPayload,
  SearchPatientResult,
} from "@/types/LabTypes";
import { normalizeLabPayload } from "@/utils/lab";

type LabRequestApiResponse = LabRequest;
type LabUserApiResponse = {
  is_active: boolean;
  license_no?: string | null;
  name: string;
  ptr_no?: string | null;
  roles: Array<{
    role: {
      role_desc?: string | null;
      role_id: number;
      role_name: string;
    };
  }>;
  title?: string | null;
  user_id: number;
  username: string;
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
    resultPayload: normalizeLabPayload(item.resultPayload),
  };
};

const toFrontendLabUser = (user: LabUserApiResponse): LabUser => ({
  isActive: user.is_active,
  licenseNo: user.license_no ?? null,
  name: user.name,
  ptrNo: user.ptr_no ?? null,
  roles: (user.roles ?? []).map(({ role }) => ({
    roleDescription: role.role_desc ?? null,
    roleId: role.role_id,
    roleName: role.role_name,
  })),
  title: user.title ?? null,
  userId: user.user_id,
  username: user.username,
});

export const searchPatients = async (search: string) => {
  const res = await api.get("/api/lab/patients", {
    params: { search },
  });

  return (res.data.data ?? []) as SearchPatientResult[];
};

export const createLabRequest = async (payload: CreateLabRequestPayload) => {
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

export const fetchLabRequest = async (labId: number) => {
  const res = await api.get(`/api/lab/requests/${labId}`);
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

export const fetchLabTests = async () => {
  const res = await api.get("/api/lab/tests");
  return (res.data.data ?? []) as LabTestCatalogItem[];
};

export const fetchLabUsers = async () => {
  const res = await api.get("/api/lab/users");
  const users = (res.data.data ?? []) as LabUserApiResponse[];
  return users.map(toFrontendLabUser);
};

export const updateLabRequestStatus = async (labId: number, status: RequestStatus) => {
  const res = await api.patch(`/api/lab/requests/${labId}/status`, { status });
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

export const saveLabResult = async (payload: SaveLabResultPayload) => {
  const res = await api.post("/api/lab/results", payload);
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

export const fetchPatientLabRecords = async (
  patientId: number,
  filters: PatientLabRecordFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters.recordGroup && filters.recordGroup !== "all") {
    params.set("recordGroup", filters.recordGroup);
  }

  const res = await api.get(`/api/lab/patients/${patientId}/records`, {
    params,
  });
  const items = (res.data.data ?? []) as LabRequestApiResponse[];
  return items.map(toFrontendRequest);
};

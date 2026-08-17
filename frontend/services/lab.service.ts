import api from "./axios";
import {
  CreateLabRequestPayload,
  ExternalLabAttachment,
  LabRequest,
  LabResultPayload,
  LabTestCatalogItem,
  LabUser,
  PatientLabRecordFilters,
  PatientLabRequestResponse,
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

export const fetchPatientLabRequests = async (patientId: number) => {
  const res = await api.get(`/api/lab/patients/${patientId}/requests`);
  const items = (res.data.data ?? []) as PatientLabRequestResponse[];
  return items;
};

export interface LabPreviewResponse {
  request: LabRequest;
  form: LabResultPayload;
}

export const fetchLabResultPreview = async (
  labid: number,
  itemId?: number
) => {

  const res = await api.get(
    `/api/lab/preview/${labid}`,
    {
      params: {
        itemId,
      },
    }
  );

  return res.data.data as {
    request: LabRequest;
    form: LabResultPayload;
  };
};

export const fetchExternalLabAttachments = async (patientId: number) => {
  const res = await api.get(`/api/lab/patients/${patientId}/attachments`);
  return (res.data.data ?? []) as ExternalLabAttachment[];
};

export type UploadExternalLabAttachmentPayload = {
  description?: string;
  file: File;
  labId?: number;
  patientId: number;
  sourceLaboratory?: string;
};

export const uploadExternalLabAttachment = async ({
  description,
  file,
  labId,
  patientId,
  sourceLaboratory,
}: UploadExternalLabAttachmentPayload) => {
  const res = await api.post("/api/lab/attachments", file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "x-description": encodeURIComponent(description?.trim() ?? ""),
      "x-file-name": encodeURIComponent(file.name),
      "x-file-type": file.type,
      "x-source-laboratory": encodeURIComponent(sourceLaboratory?.trim() ?? ""),
    },
    params: { patientId, ...(labId ? { labId } : {}) },
  });

  return res.data.data as ExternalLabAttachment;
};

export const openExternalLabAttachment = async (attachmentId: number) => {
  const res = await api.get(`/api/lab/attachments/${attachmentId}/file`, {
    responseType: "blob",
  });
  const objectUrl = URL.createObjectURL(res.data as Blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

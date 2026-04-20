import api from "./axios";
import {
  CreateLabRequestPayload,
  LabRequest,
  LabTestCatalogItem,
  PatientRecord,
  RequestStatus,
  SaveLabResultPayload,
  SearchPatientResult,
} from "@/types/LabTypes";
import { normalizeLabPayload } from "@/utils/lab";

type LabRequestApiResponse = LabRequest;

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

export const fetchLabTests = async () => {
  const res = await api.get("/api/lab/tests");
  return (res.data.data ?? []) as LabTestCatalogItem[];
};

export const updateLabRequestStatus = async (labId: number, status: RequestStatus) => {
  const res = await api.patch(`/api/lab/requests/${labId}/status`, { status });
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

export const saveLabResult = async (payload: SaveLabResultPayload) => {
  const res = await api.post("/api/lab/results", payload);
  return toFrontendRequest(res.data.data as LabRequestApiResponse);
};

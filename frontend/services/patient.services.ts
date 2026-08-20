import api from "./axios";
import {
  PatientDeletionOutcome,
  PatientDeletionRequest,
  PatientProps,
} from "@/types/PatientTypes";
import { PaginationMeta } from "@/types/RequestTypes";

export type PatientListResponse = { data: PatientProps[]; pagination: PaginationMeta };

export const fetchAllPatient = async (search: string, page = 1, limit = 20): Promise<PatientListResponse> => {
  const res = await api.get("/api/patient/getAllPatients", {
    params: { search, page, limit }
  }
  );
  return { data: res.data.data ?? [], pagination: res.data.pagination };
};

export const createPatient = async (
  data: PatientProps
) => {
  const res = await api.post("/api/patient/patientAdd", data);
  return res.data.data;
};

export const fetchPatientById = async (patientId: number) => {
  const res = await api.get(`/api/patient/${patientId}/patientInfo`);
  return res.data.data;
};

export const updatePatient = async (
  patientId: number,
  data: PatientProps
) => {
  const res = await api.put(`/api/patient/${patientId}/patientUpdate`, data);
  return res.data.data;
};

export const deletePatient = async (patientId: number) => {
  const res = await api.delete(`/api/patient/${patientId}/patientDelete`);
  return res.data.data as PatientDeletionOutcome;
};

export const fetchPatientDeletionRequests = async () => {
  const res = await api.get("/api/patient/deletion-requests");
  return (res.data.data ?? []) as PatientDeletionRequest[];
};

export const reviewPatientDeletionRequest = async (
  requestId: number,
  decision: "APPROVED" | "REJECTED"
) => {
  const res = await api.patch(`/api/patient/deletion-requests/${requestId}`, { decision });
  return res.data.data as PatientDeletionRequest;
};

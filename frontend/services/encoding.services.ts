import api from "./axios";
import type { LabCategory, LabResultPayload, LabSchemaKey } from "@/types/LabTypes";

export type LatestEncodingConsultation = {
  consultation_id: number;
  consultation_date: string;
  chief_complaint?: string | null;
  assessment?: string | null;
  plans?: string | null;
  follow_up_date?: string | null;
};

export type SaveEncodingLabPayload = {
  patientId: number;
  category: LabCategory;
  form: LabResultPayload;
  requestedBy?: string;
  resultDate?: string;
  schemaKey?: LabSchemaKey | null;
  testName: string;
};

export type SaveEncodingFollowUpPayload = {
  patientId: number;
  consultationId?: number | null;
  followupDate: string;
  impression?: string;
  instruction?: string;
  bp?: string;
  temp?: string;
  cr?: string;
  rr?: string;
  wt?: string;
  ht?: string;
};

export const fetchLatestEncodingConsultation = async (patientId: number) => {
  const res = await api.get(
    `/api/encoding/patients/${patientId}/latest-consultation`
  );
  return res.data.data as LatestEncodingConsultation | null;
};

export const saveEncodingLabResult = async (payload: SaveEncodingLabPayload) => {
  const res = await api.post("/api/encoding/lab-results", payload);
  return res.data.data;
};

export const saveEncodingFollowUp = async (
  payload: SaveEncodingFollowUpPayload
) => {
  const res = await api.post("/api/encoding/consultation-follow-ups", payload);
  return res.data.data;
};

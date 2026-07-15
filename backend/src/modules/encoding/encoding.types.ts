import type { LabResultPayload } from "../lab/lab.types";

export type EncodingLabResultPayload = {
  patientId: number;
  category: string;
  form: LabResultPayload;
  requestedBy?: string;
  resultDate?: string;
  schemaKey?: string | null;
  testName: string;
  medTechUserId?: number | null;
  pathologistUserId?: number | null;
  userId?: number;
};

export type EncodingFollowUpPayload = {
  patientId: number;
  consultationId?: number | null;
  followupDate: string;
  impression?: string | null;
  instruction?: string | null;
  bp?: string | null;
  temp?: string | null;
  cr?: string | null;
  rr?: string | null;
  wt?: string | null;
  ht?: string | null;
};

export type EncodingConsultationPayload = {
  patientId: number;
  consultationDate: string;
  userId?: number;
  fields: Record<string, string | undefined>;
};

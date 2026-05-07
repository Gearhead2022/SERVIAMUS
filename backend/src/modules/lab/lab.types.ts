import { ApiLabCategory, ApiLabRequestStatus } from "./lab.utils";

export type LabResultValue = string | number;
export type LabResultPayload = Record<string, LabResultValue>;

export type CreateLabRequestInput = {
  patientId: number;
  userId: number;
  requestedBy?: string;
  tests: string[];
  requestedDate?: string;
};

export type SaveLabResultInput = {
  labId: number;
  category: ApiLabCategory;
  form: LabResultPayload;
  medTechUserId?: number | null;
  userId?: number;
  pathologistUserId?: number | null;
};

export type UpdateLabRequestStatusInput = {
  labId: number;
  status: ApiLabRequestStatus;
};

import { ApiLabCategory, ApiLabRequestStatus } from "./lab.utils";

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
  form: Record<string, string>;
};

export type UpdateLabRequestStatusInput = {
  labId: number;
  status: ApiLabRequestStatus;
};

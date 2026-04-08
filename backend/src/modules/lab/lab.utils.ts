import {
  LaboratoryCategory,
  LaboratoryRequestItemStatus,
  RequestStatus,
} from "@prisma/client";

export type ApiLabCategory =
  | "clinical-chemistry"
  | "hematology"
  | "parasitology"
  | "urinalysis"
  | "other";

export type ApiLabRequestStatus = "queued" | "pending" | "done";

const normalizeTestLabel = (value: string) => value.trim().replace(/\s+/g, " ");

export const splitLabTests = (rawValue: string) => {
  return rawValue
    .split(/[\n,]+/)
    .map(normalizeTestLabel)
    .filter(Boolean);
};

export const categorizeLabTest = (testName: string): LaboratoryCategory => {
  const value = testName.trim().toLowerCase();

  if (value.includes("urinalysis")) return "URINALYSIS";

  if (
    value.includes("blood count") ||
    value.includes("cbc") ||
    value.includes("hematology") ||
    value.includes("blood typing")
  ) {
    return "HEMATOLOGY";
  }

  if (
    value.includes("fecal") ||
    value.includes("stool") ||
    value.includes("parasit")
  ) {
    return "PARASITOLOGY";
  }

  if (
    value.includes("blood chemistry") ||
    value.includes("fbs") ||
    value.includes("rbs") ||
    value.includes("bun") ||
    value.includes("creatinine") ||
    value.includes("uric acid") ||
    value.includes("cholesterol") ||
    value.includes("triglycerides") ||
    value.includes("sgpt")
  ) {
    return "CLINICAL_CHEMISTRY";
  }

  return "OTHER";
};

export const toApiLabCategory = (category: LaboratoryCategory): ApiLabCategory => {
  if (category === "HEMATOLOGY") return "hematology";
  if (category === "PARASITOLOGY") return "parasitology";
  if (category === "URINALYSIS") return "urinalysis";
  if (category === "CLINICAL_CHEMISTRY") return "clinical-chemistry";
  return "other";
};

export const toDbLabCategory = (category: ApiLabCategory): LaboratoryCategory => {
  if (category === "hematology") return "HEMATOLOGY";
  if (category === "parasitology") return "PARASITOLOGY";
  if (category === "urinalysis") return "URINALYSIS";
  if (category === "clinical-chemistry") return "CLINICAL_CHEMISTRY";
  return "OTHER";
};

export const toApiLabStatus = (
  status: LaboratoryRequestItemStatus | RequestStatus
): ApiLabRequestStatus => {
  if (status === "DONE") return "done";
  if (status === "PENDING" || status === "SERVING") return "pending";
  return "queued";
};

export const toDbLabStatus = (status: ApiLabRequestStatus): LaboratoryRequestItemStatus => {
  if (status === "done") return "DONE";
  if (status === "pending") return "PENDING";
  return "QUEUED";
};

export const requestStatusFromItemStatuses = (
  statuses: LaboratoryRequestItemStatus[]
): RequestStatus => {
  if (!statuses.length) return "WAITING";
  if (statuses.every((status) => status === "DONE")) return "DONE";
  if (statuses.some((status) => status === "PENDING" || status === "DONE")) {
    return "SERVING";
  }
  return "WAITING";
};

export const seedItemStatusFromRequestStatus = (
  status: RequestStatus
): LaboratoryRequestItemStatus => {
  if (status === "DONE") return "DONE";
  if (status === "SERVING") return "PENDING";
  return "QUEUED";
};

export const normalizeLabForm = (form: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : "",
    ])
  );
};

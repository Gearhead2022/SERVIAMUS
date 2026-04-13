import {
  LaboratoryCategory,
  LaboratoryRequestItemStatus,
  Prisma,
  RequestStatus,
} from "@prisma/client";

export type ApiLabCategory =
  | "clinical-chemistry"
  | "hematology"
  | "parasitology"
  | "urinalysis"
  | "other";

export type ApiLabRequestStatus = "queued" | "pending" | "done";

export type LabSchemaKey =
  | "hematology"
  | "serology"
  | "parasitology"
  | "urinalysis"
  | "clinical_chemistry"
  | "hba1c"
  | "chemistry"
  | "ogtt"
  | "general";

const normalizeTestLabel = (value: string) => value.trim().replace(/\s+/g, " ");

export const splitLabTests = (rawValue: string) => {
  return rawValue
    .split(/[\n,]+/)
    .map(normalizeTestLabel)
    .filter(Boolean);
};

export const resolveLabSchemaKey = (testName: string): LabSchemaKey => {
  const value = testName.trim().toLowerCase();

  if (
    value.includes("blood count") ||
    value.includes("cbc") ||
    value.includes("hematology") ||
    value.includes("blood typing")
  ) {
    return "hematology";
  }

  if (value.includes("hba1c") || value.includes("hb a1c") || value.includes("glycated")) {
    return "hba1c";
  }

  if (value.includes("ogtt") || value.includes("glucose load")) {
    return "ogtt";
  }

  if (
    value.includes("sodium") ||
    value.includes("potassium") ||
    value.includes("chloride") ||
    value.includes("ionized calcium")
  ) {
    return "chemistry";
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
    return "clinical_chemistry";
  }

  if (
    value.includes("fecal") ||
    value.includes("stool") ||
    value.includes("parasit")
  ) {
    return "parasitology";
  }

  if (value.includes("urinalysis")) {
    return "urinalysis";
  }

  if (
    value.includes("serology") ||
    value.includes("ns1") ||
    value.includes("igg") ||
    value.includes("igm") ||
    value.includes("dengue") ||
    value.includes("widal")
  ) {
    return "serology";
  }

  return "general";
};

export const toSchemaKey = (testName: string) => resolveLabSchemaKey(testName);

export const categorizeLabTest = (testName: string): LaboratoryCategory => {
  const schemaKey = resolveLabSchemaKey(testName);

  if (schemaKey === "hematology") return "HEMATOLOGY";
  if (schemaKey === "parasitology") return "PARASITOLOGY";
  if (schemaKey === "urinalysis") return "URINALYSIS";
  if (
    schemaKey === "clinical_chemistry" ||
    schemaKey === "hba1c" ||
    schemaKey === "chemistry" ||
    schemaKey === "ogtt"
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
  if (status === "PROCESSING" || status === "SERVING") return "pending";
  return "queued";
};

export const toDbLabStatus = (status: ApiLabRequestStatus): LaboratoryRequestItemStatus => {
  if (status === "done") return "DONE";
  if (status === "pending") return "PROCESSING";
  return "QUEUED";
};

export const requestStatusFromItemStatuses = (
  statuses: LaboratoryRequestItemStatus[]
): RequestStatus => {
  if (!statuses.length) return "WAITING";
  if (statuses.every((status) => status === "DONE")) return "DONE";
  if (statuses.every((status) => status === "CANCELLED")) return "CANCELED";

  if (statuses.some((status) => status === "PROCESSING" || status === "DONE")) {
    return "SERVING";
  }

  return "WAITING";
};

export const seedItemStatusFromRequestStatus = (
  status: RequestStatus
): LaboratoryRequestItemStatus => {
  if (status === "DONE") return "DONE";
  if (status === "SERVING") return "PROCESSING";
  if (status === "CANCELED") return "CANCELLED";
  return "QUEUED";
};

export const normalizeLabForm = (form: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : "",
    ])
  ) as Prisma.InputJsonValue;
};

export const serializeLabResultPayload = (value: Prisma.JsonValue | null) => {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, itemValue]) => [
      key,
      typeof itemValue === "string" ? itemValue : String(itemValue ?? ""),
    ])
  );
};

export const trimFormValue = (
  form: Record<string, string>,
  ...keys: string[]
) => {
  for (const key of keys) {
    const value = form[key];

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
};

export const toNullableDate = (value?: string | null) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

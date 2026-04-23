import {
  LaboratoryCategory,
  LaboratoryRequestItemStatus,
  Prisma,
  RequestStatus,
} from "@prisma/client";
import type { LabResultPayload, LabResultValue } from "./lab.types";

export type ApiLabCategory =
  | "clinical-chemistry"
  | "hematology"
  | "parasitology"
  | "urinalysis"
  | "other";

export type ApiLabRequestStatus = "queued" | "pending" | "done";

export type LabRecordGroup =
  | "clinical-chemistry"
  | "clinical-microscopy"
  | "hematology"
  | "other"
  | "serology";

export type LabSchemaKey =
  | "CBC"
  | "BT"
  | "parasitology"
  | "urinalysis"
  | "clinical_chemistry"
  | "FBS"
  | "RBS"
  | "BUN"
  | "uricacid"
  | "totalcholesterol"
  | "HDL"
  | "LDL"
  | "triglycerides"
  | "SGPT"
  | "sodium"
  | "potassium"
  | "hba1c"
  | "OGTT"
  | "onehOGTT"
  | "twohOGTT"
  | "FOBT"
  | "dengue"
  | "hbsag"
  | "syphilis"
  | "serumPT"
  | "urinePT"
  | "hematology"
  | "serology"
  | "chemistry"
  | "ogtt"
  | "general";

export type CombinedLabResultFamily =
  | "chemistry-panel"
  | "clinical-chemistry-panel";

type KnownLabSchemaDefinition = {
  apiCategory: ApiLabCategory;
  category: LaboratoryCategory;
  aliases: string[];
};

const normalizeLookupValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeTestLabel = (value: string) => value.trim().replace(/\s+/g, " ");

const knownLabSchemaDefinitions: Record<LabSchemaKey, KnownLabSchemaDefinition> = {
  CBC: {
    apiCategory: "hematology",
    category: "Hematology",
    aliases: [
      "cbc",
      "complete blood count",
      "complete blood count w platelet count",
      "complete blood count with platelet count",
    ],
  },
  BT: {
    apiCategory: "hematology",
    category: "Hematology",
    aliases: ["blood typing", "blood type"],
  },
  parasitology: {
    apiCategory: "parasitology",
    category: "Clinical_Microscopy",
    aliases: [
      "routine fecalysis",
      "fecalysis",
      "fecal exam",
      "routine stool exam",
      "parasitology",
    ],
  },
  urinalysis: {
    apiCategory: "urinalysis",
    category: "Clinical_Microscopy",
    aliases: ["routine urinalysis", "urinalysis"],
  },
  clinical_chemistry: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["creatinine", "clinical chemistry", "blood chemistry"],
  },
  FBS: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["fbs", "fasting blood sugar", "fasting blood sugar fbs"],
  },
  RBS: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["rbs", "random blood sugar", "random blood sugar rbs"],
  },
  BUN: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["bun", "urea bun", "urea", "urea blood urea nitrogen"],
  },
  uricacid: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["uric acid", "uricacid"],
  },
  totalcholesterol: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["total cholesterol", "cholesterol"],
  },
  HDL: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["hdl", "hdl cholesterol", "hdl cholesterol"],
  },
  LDL: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["ldl", "ldl cholesterol", "ldl cholesterol"],
  },
  triglycerides: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["triglycerides", "triglyceride"],
  },
  SGPT: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["sgpt", "serum glutamic pyruvic transaminase"],
  },
  sodium: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["sodium"],
  },
  potassium: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["potassium"],
  },
  hba1c: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: [
      "hba1c",
      "hb a1c",
      "glycosylated hemoglobin",
      "glycated hemoglobin",
    ],
  },
  OGTT: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["ogtt", "oral glucose tolerance test", "100g ogtt", "ogtt 100g", "100g-ogtt"],
  },
  onehOGTT: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: [
      "1h ogtt",
      "1h-ogtt",
      "1 hour ogtt",
      "1h oral glucose tolerance test",
      "50g ogtt",
      "50g-ogtt",
      "50 grams ogtt",
    ],
  },
  twohOGTT: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: [
      "2h ogtt",
      "2h-ogtt",
      "2 hour ogtt",
      "2h oral glucose tolerance test",
      "75g ogtt",
      "75g-ogtt",
      "75 grams ogtt",
    ],
  },
  FOBT: {
    apiCategory: "other",
    category: "Clinical_Microscopy",
    aliases: ["fobt", "fecal occult blood test", "faecal occult blood test"],
  },
  dengue: {
    apiCategory: "other",
    category: "Serology",
    aliases: ["dengue", "dengue ns1", "ns1"],
  },
  hbsag: {
    apiCategory: "other",
    category: "Serology",
    aliases: [
      "hbsag",
      "hepatitis b surface antigen",
      "hepatitis b",
    ],
  },
  syphilis: {
    apiCategory: "other",
    category: "Serology",
    aliases: ["syphilis", "vdrl", "rpr"],
  },
  serumPT: {
    apiCategory: "other",
    category: "Serology",
    aliases: ["pregnancy test serum", "serum pregnancy test", "serum pt"],
  },
  urinePT: {
    apiCategory: "other",
    category: "Serology",
    aliases: ["pregnancy test urine", "urine pregnancy test", "urine pt"],
  },
  hematology: {
    apiCategory: "hematology",
    category: "Hematology",
    aliases: ["hematology"],
  },
  serology: {
    apiCategory: "other",
    category: "Serology",
    aliases: ["serology"],
  },
  chemistry: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: [
      "chemistry",
      "electrolytes",
      "electrolyte panel",
      "chloride",
      "ionized calcium",
      "calcium ionized",
    ],
  },
  ogtt: {
    apiCategory: "clinical-chemistry",
    category: "Clinical_Chemistry",
    aliases: ["glucose load", "glucose tolerance"],
  },
  general: {
    apiCategory: "other",
    category: "OTHER",
    aliases: [],
  },
};

const exactAliasToSchemaKey = new Map<string, LabSchemaKey>();

Object.entries(knownLabSchemaDefinitions).forEach(([schemaKey, definition]) => {
  definition.aliases.forEach((alias) => {
    exactAliasToSchemaKey.set(normalizeLookupValue(alias), schemaKey as LabSchemaKey);
  });
});

export const splitLabTests = (rawValue: string) => {
  return rawValue
    .split(/[\n,]+/)
    .map(normalizeTestLabel)
    .filter(Boolean);
};

export const isKnownLabSchemaKey = (value?: string | null): value is LabSchemaKey => {
  if (!value) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(knownLabSchemaDefinitions, value);
};

const findSchemaKeyByAlias = (testName: string) => {
  const normalizedName = normalizeLookupValue(testName);
  const exactMatch = exactAliasToSchemaKey.get(normalizedName);

  if (exactMatch) {
    return exactMatch;
  }

  for (const [schemaKey, definition] of Object.entries(knownLabSchemaDefinitions)) {
    if (
      definition.aliases.some((alias) =>
        normalizedName.includes(normalizeLookupValue(alias))
      )
    ) {
      return schemaKey as LabSchemaKey;
    }
  }

  return null;
};

const inferLabSchemaKey = (testName: string): LabSchemaKey => {
  const aliasMatch = findSchemaKeyByAlias(testName);

  if (aliasMatch) {
    return aliasMatch;
  }

  const value = normalizeLookupValue(testName);

  if (
    value.includes("blood count") ||
    value.includes("cbc") ||
    value.includes("hematology")
  ) {
    return "CBC";
  }

  if (value.includes("blood typing") || value.includes("blood type")) {
    return "BT";
  }

  if (value.includes("urinalysis")) {
    return "urinalysis";
  }

  if (value.includes("fecal") || value.includes("stool") || value.includes("parasit")) {
    return "parasitology";
  }

  if (
    value.includes("dengue") ||
    value.includes("ns1") ||
    value.includes("syphilis") ||
    value.includes("hepatitis")
  ) {
    return "serology";
  }

  if (
    value.includes("ogtt") ||
    value.includes("glucose tolerance") ||
    value.includes("glucose load")
  ) {
    if (value.includes("50g") || value.includes("50 grams") || value.includes("1h")) {
      return "onehOGTT";
    }

    if (value.includes("75g") || value.includes("75 grams") || value.includes("2h")) {
      return "twohOGTT";
    }

    return "OGTT";
  }

  if (
    value.includes("sodium") ||
    value.includes("potassium") ||
    value.includes("chloride") ||
    value.includes("ionized calcium") ||
    value.includes("calcium ionized")
  ) {
    return "chemistry";
  }

  if (
    value.includes("blood sugar") ||
    value.includes("bun") ||
    value.includes("creatinine") ||
    value.includes("uric acid") ||
    value.includes("cholesterol") ||
    value.includes("triglycerides") ||
    value.includes("sgpt") ||
    value.includes("hba1c")
  ) {
    return "clinical_chemistry";
  }

  return "general";
};

export const resolveLabSchemaKey = (
  testName: string,
  existingSchemaKey?: string | null
): LabSchemaKey => {
  if (isKnownLabSchemaKey(existingSchemaKey)) {
    return existingSchemaKey;
  }

  return inferLabSchemaKey(testName);
};

export const toSchemaKey = (testName: string, existingSchemaKey?: string | null) =>
  resolveLabSchemaKey(testName, existingSchemaKey);

export const categorizeLabTest = (
  testName: string,
  existingSchemaKey?: string | null
): LaboratoryCategory => {
  const resolvedSchemaKey = resolveLabSchemaKey(testName, existingSchemaKey);
  return knownLabSchemaDefinitions[resolvedSchemaKey].category;
};

export const resolveApiLabCategory = ({
  category,
  schemaKey,
  testName,
}: {
  category: LaboratoryCategory;
  schemaKey?: string | null;
  testName: string;
}): ApiLabCategory => {
  const resolvedSchemaKey = resolveLabSchemaKey(testName, schemaKey);
  const schemaDefinition = knownLabSchemaDefinitions[resolvedSchemaKey];

  if (schemaDefinition) {
    return schemaDefinition.apiCategory;
  }

  if (category === "Hematology") return "hematology";
  if (category === "Clinical_Chemistry") return "clinical-chemistry";
  return "other";
};

const hematologySchemaKeys = new Set<LabSchemaKey>(["BT", "CBC", "hematology"]);
const clinicalChemistrySchemaKeys = new Set<LabSchemaKey>([
  "BUN",
  "FBS",
  "HDL",
  "LDL",
  "OGTT",
  "RBS",
  "SGPT",
  "clinical_chemistry",
  "chemistry",
  "hba1c",
  "ogtt",
  "onehOGTT",
  "potassium",
  "sodium",
  "totalcholesterol",
  "triglycerides",
  "twohOGTT",
  "uricacid",
]);
const combinedClinicalChemistrySchemaKeys = new Set<LabSchemaKey>([
  "BUN",
  "FBS",
  "HDL",
  "LDL",
  "RBS",
  "SGPT",
  "clinical_chemistry",
  "totalcholesterol",
  "triglycerides",
  "uricacid",
]);
const combinedChemistrySchemaKeys = new Set<LabSchemaKey>([
  "chemistry",
  "potassium",
  "sodium",
]);
const clinicalMicroscopySchemaKeys = new Set<LabSchemaKey>([
  "FOBT",
  "parasitology",
  "urinalysis",
]);
const serologySchemaKeys = new Set<LabSchemaKey>([
  "dengue",
  "hbsag",
  "serology",
  "serumPT",
  "syphilis",
  "urinePT",
]);

export const resolveLabRecordGroup = ({
  category,
  schemaKey,
  testName,
}: {
  category: LaboratoryCategory;
  schemaKey?: string | null;
  testName: string;
}): LabRecordGroup => {
  const resolvedSchemaKey = resolveLabSchemaKey(testName, schemaKey);

  if (hematologySchemaKeys.has(resolvedSchemaKey)) {
    return "hematology";
  }

  if (clinicalChemistrySchemaKeys.has(resolvedSchemaKey)) {
    return "clinical-chemistry";
  }

  if (clinicalMicroscopySchemaKeys.has(resolvedSchemaKey)) {
    return "clinical-microscopy";
  }

  if (serologySchemaKeys.has(resolvedSchemaKey)) {
    return "serology";
  }

  if (category === "Hematology") {
    return "hematology";
  }

  if (category === "Clinical_Chemistry") {
    return "clinical-chemistry";
  }

  if (category === "Clinical_Microscopy") {
    return "clinical-microscopy";
  }

  if (category === "Serology") {
    return "serology";
  }

  return "other";
};

export const resolveCombinedLabResultFamily = ({
  schemaKey,
  testName,
}: {
  schemaKey?: string | null;
  testName: string;
}): CombinedLabResultFamily | null => {
  const resolvedSchemaKey = resolveLabSchemaKey(testName, schemaKey);

  if (combinedClinicalChemistrySchemaKeys.has(resolvedSchemaKey)) {
    return "clinical-chemistry-panel";
  }

  if (combinedChemistrySchemaKeys.has(resolvedSchemaKey)) {
    return "chemistry-panel";
  }

  return null;
};

export const toApiLabCategory = (category: LaboratoryCategory): ApiLabCategory => {
  if (category === "Hematology") return "hematology";
  if (category === "Clinical_Chemistry") return "clinical-chemistry";
  return "other";
};

export const toDbLabCategory = (category: ApiLabCategory): LaboratoryCategory => {
  if (category === "hematology") return "Hematology";
  if (category === "parasitology" || category === "urinalysis") {
    return "Clinical_Microscopy";
  }
  if (category === "clinical-chemistry") return "Clinical_Chemistry";
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

const normalizeLabResultValue = (value: unknown): LabResultValue => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value ?? "");
};

export const normalizeLabForm = (form: LabResultPayload) => {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      normalizeLabResultValue(value),
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
      normalizeLabResultValue(itemValue),
    ])
  ) as LabResultPayload;
};

export const trimFormValue = (form: LabResultPayload, ...keys: string[]) => {
  for (const key of keys) {
    const value = form[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

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
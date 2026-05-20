import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import { formatLabResultValue, hasDisplayableLabResultValue } from "@/utils/lab";
import { isLabResultMetaField } from "@/utils/lab-personnel";

const remarkKeys = [
  "remarks",
  "result_interpretation",
  "others2",
  "others1",
  "others",
] as const;

const summaryPriorityKeys = ["result_summary", "result"] as const;

const hiddenSummaryKeys = new Set([
  ...remarkKeys,
  "day_of_fever",
  "last_meal",
  "method",
  "specimen",
  "test",
  "test_type",
  "time_collected",
  "time_received",
  "time_recieved",
  "time_taken",
]);

const fieldLabels: Record<string, string> = {
  abo_type: "ABO Type",
  ascaris: "Ascaris",
  bacteria: "Bacteria",
  basophils: "Basophils",
  blood: "Blood",
  bun: "BUN",
  casts: "Casts",
  chloride: "Chloride",
  cholesterol: "Total Cholesterol",
  coli_cyst: "E. Coli (Cyst)",
  coli_trophozoite: "E. Coli (Trophozoite)",
  consistency: "Consistency",
  creatinine: "Creatinine",
  crystals: "Crystals",
  day_of_fever: "Day of Fever",
  eosinophils: "Eosinophils",
  fbs: "FBS",
  glucose: "Glucose",
  hba1c: "HbA1c",
  hdl_cholesterol: "HDL Cholesterol",
  hemoglobin: "Hemoglobin",
  histolytica_cyst: "E. Histolytica (Cyst)",
  histolytica_trophozoite: "E. Histolytica (Trophozoite)",
  hookworm: "Hookworm",
  ionized_calcium: "Ionized Calcium",
  ketones: "Ketones",
  ldl_cholesterol: "LDL Cholesterol",
  leukocytes: "Leukocytes",
  lymphocytes: "Lymphocytes",
  mchc: "MCHC",
  monocytes: "Monocytes",
  mucous: "Mucous",
  nitrite: "Nitrite",
  nss_1: "Neutrophils (Seg)",
  nss_2: "Neutrophils (Stab)",
  nss_3: "NSS 3",
  onehagl: "1 Hour After Glucose Load",
  others_mcv: "MCV",
  ph_result: "pH",
  platelet_count: "Platelet Count",
  potassium: "Potassium",
  protein: "Protein",
  pus_cells: "Pus Cells",
  rbc: "RBC",
  rbc_count: "RBC Count",
  rbs: "RBS",
  result: "Result",
  result_summary: "Result Summary",
  reticulocyte_count: "Reticulocyte Count",
  rh_type: "Rh Type",
  round_cell: "Round Cell",
  sgpt: "SGPT",
  sodium: "Sodium",
  spec_grav_result: "Specific Gravity",
  squamous_cell: "Squamous Cell",
  strongloides: "Strongyloides",
  threehagl: "3 Hours After Glucose Load",
  transparency: "Transparency",
  triglycerides: "Triglycerides",
  trichuris: "Trichuris",
  twohagl: "2 Hours After Glucose Load",
  uric_acid: "Uric Acid",
  wbc_count: "WBC Count",
};

const readPayloadValue = (
  payload: LabResultPayload | null | undefined,
  keys: readonly string[]
) => {
  if (!payload) {
    return "";
  }

  for (const key of keys) {
    const value = payload[key];

    if (hasDisplayableLabResultValue(value)) {
      return formatLabResultValue(value, "");
    }
  }

  return "";
};

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const humanizeLabFieldKey = (key: string) => {
  const normalizedKey = key.toLowerCase();
  const mappedLabel = fieldLabels[normalizedKey];

  if (mappedLabel) {
    return mappedLabel;
  }

  return toTitleCase(
    key
      .replace(/_conv$/i, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
  );
};

export const formatLabRecordDate = (value: string) =>
  new Date(value).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const getLabRecordRemarks = (payload?: LabResultPayload | null) => {
  const remarks = readPayloadValue(payload, remarkKeys);
  return remarks || "No additional remarks.";
};

export const getLabResultSummary = (
  payload?: LabResultPayload | null,
  maxItems = 3
) => {
  const explicitSummary = readPayloadValue(payload, summaryPriorityKeys);

  if (explicitSummary) {
    return explicitSummary;
  }

  if (!payload) {
    return "Awaiting released result values.";
  }

  const summaryEntries = Object.entries(payload)
    .filter(
      ([key, value]) =>
        !isLabResultMetaField(key) &&
        !hiddenSummaryKeys.has(key) &&
        !key.endsWith("_conv") &&
        hasDisplayableLabResultValue(value)
    )
    .map(
      ([key, value]) => `${humanizeLabFieldKey(key)}: ${formatLabResultValue(value)}`
    );

  if (!summaryEntries.length) {
    return "Released result available.";
  }

  const visibleEntries = summaryEntries.slice(0, maxItems);
  const hiddenCount = summaryEntries.length - visibleEntries.length;

  return hiddenCount > 0
    ? `${visibleEntries.join(", ")}, +${hiddenCount} more`
    : visibleEntries.join(", ");
};

export const getPendingLabRecordsCount = (records: LabRequest[]) =>
  records.filter((record) => record.status !== "done" || !record.resultPayload).length;

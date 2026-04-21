import {
  LabCategory,
  LabRecordGroup,
  LabRequest,
  LabSchemaKey,
  LabTemplateKey,
} from "@/types/LabTypes";

type SerologyTemplateConfig = {
  defaultMethod?: string;
  defaultSpecimen?: string;
  defaultTestName?: string;
  lockedFields?: Array<"method" | "specimen" | "test">;
  requireDayOfFever?: boolean;
  resultLabel?: string;
  resultPlaceholder?: string;
  showDayOfFever?: boolean;
};

type SingleChemistryTemplateConfig = {
  conversionFactor?: number;
  conversionFieldName?: string;
  conversionLabel?: string;
  fieldLabel: string;
  fieldName: string;
  showMealFields?: boolean;
};

type OgttPhaseConfig = {
  conversionFieldName: string;
  fieldName: string;
  label: string;
};

type OgttTemplateConfig = {
  defaultTestType: string;
  phases: OgttPhaseConfig[];
};

export type LabTemplateDefinition = {
  apiCategory: LabCategory;
  key: LabTemplateKey;
  label: string;
  ogtt?: OgttTemplateConfig;
  serology?: SerologyTemplateConfig;
  singleChemistry?: SingleChemistryTemplateConfig;
};

const createSingleChemistryTemplate = (
  label: string,
  fieldName: string,
  options?: Omit<SingleChemistryTemplateConfig, "fieldLabel" | "fieldName">
): LabTemplateDefinition => ({
  apiCategory: "clinical-chemistry",
  key: "single-chemistry",
  label,
  singleChemistry: {
    fieldLabel: label,
    fieldName,
    ...options,
  },
});

const ogttFastingPhase: OgttPhaseConfig = {
  conversionFieldName: "FBS_conv",
  fieldName: "FBS",
  label: "Fasting Blood Sugar",
};

const templateBySchemaKey: Partial<Record<LabSchemaKey, LabTemplateDefinition>> = {
  CBC: {
    apiCategory: "hematology",
    key: "cbc",
    label: "Complete Blood Count",
  },
  BT: {
    apiCategory: "hematology",
    key: "blood-typing",
    label: "Blood Typing",
  },
  parasitology: {
    apiCategory: "parasitology",
    key: "parasitology",
    label: "Routine Fecalysis",
  },
  urinalysis: {
    apiCategory: "urinalysis",
    key: "urinalysis",
    label: "Routine Urinalysis",
  },
  FBS: createSingleChemistryTemplate("Fasting Blood Sugar (FBS)", "FBS", {
    conversionFactor: 0.055,
    conversionFieldName: "FBS_conv",
    conversionLabel: "mmol/L",
    showMealFields: true,
  }),
  RBS: createSingleChemistryTemplate("Random Blood Sugar (RBS)", "RBS", {
    conversionFactor: 0.055,
    conversionFieldName: "RBS_conv",
    conversionLabel: "mmol/L",
    showMealFields: true,
  }),
  BUN: createSingleChemistryTemplate("Urea (BUN)", "BUN", {
    conversionFactor: 0.357,
    conversionFieldName: "BUN_conv",
    conversionLabel: "mmol/L",
  }),
  uricacid: createSingleChemistryTemplate("Uric Acid", "uric_acid", {
    conversionFactor: 0.059,
    conversionFieldName: "uric_acid_conv",
    conversionLabel: "mmol/L",
  }),
  totalcholesterol: createSingleChemistryTemplate("Total Cholesterol", "cholesterol", {
    conversionFactor: 0.026,
    conversionFieldName: "cholesterol_conv",
    conversionLabel: "mmol/L",
  }),
  HDL: createSingleChemistryTemplate("HDL-Cholesterol", "hdl_cholesterol", {
    conversionFactor: 0.026,
    conversionFieldName: "hdl_cholesterol_conv",
    conversionLabel: "mmol/L",
  }),
  LDL: createSingleChemistryTemplate("LDL-Cholesterol", "ldl_cholesterol", {
    conversionFactor: 0.026,
    conversionFieldName: "ldl_cholesterol_conv",
    conversionLabel: "mmol/L",
  }),
  triglycerides: createSingleChemistryTemplate("Triglycerides", "triglycerides", {
    conversionFactor: 0.011,
    conversionFieldName: "triglycerides_conv",
    conversionLabel: "mmol/L",
  }),
  SGPT: createSingleChemistryTemplate(
    "Serum Glutamic Pyruvic Transaminase",
    "sgpt"
  ),
  sodium: createSingleChemistryTemplate("Sodium", "sodium"),
  potassium: createSingleChemistryTemplate("Potassium", "potassium"),
  hba1c: {
    apiCategory: "clinical-chemistry",
    key: "hba1c",
    label: "Glycosylated Hemoglobin",
  },
  OGTT: {
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "OGTT",
    ogtt: {
      defaultTestType: "OGTT",
      phases: [
        ogttFastingPhase,
        {
          conversionFieldName: "onehagl_conv",
          fieldName: "onehagl",
          label: "1 Hour After Glucose Load",
        },
        {
          conversionFieldName: "twohagl_conv",
          fieldName: "twohagl",
          label: "2 Hours After Glucose Load",
        },
        {
          conversionFieldName: "threehagl_conv",
          fieldName: "threehagl",
          label: "3 Hours After Glucose Load",
        },
      ],
    },
  },
  onehOGTT: {
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "1H-OGTT",
    ogtt: {
      defaultTestType: "1H-OGTT",
      phases: [
        ogttFastingPhase,
        {
          conversionFieldName: "onehagl_conv",
          fieldName: "onehagl",
          label: "1 Hour After Glucose Load",
        },
      ],
    },
  },
  twohOGTT: {
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "2H-OGTT",
    ogtt: {
      defaultTestType: "2H-OGTT",
      phases: [
        ogttFastingPhase,
        {
          conversionFieldName: "twohagl_conv",
          fieldName: "twohagl",
          label: "2 Hours After Glucose Load",
        },
      ],
    },
  },
  FOBT: {
    apiCategory: "other",
    key: "fecal-occult-blood",
    label: "Fecal Occult Blood Test",
  },
  dengue: {
    apiCategory: "other",
    key: "dengue",
    label: "Dengue NS1",
    serology: {
      defaultSpecimen: "Serum",
      defaultTestName: "Dengue NS1",
      lockedFields: ["test"],
      requireDayOfFever: true,
      resultPlaceholder: "Enter dengue result",
      showDayOfFever: true,
    },
  },
  hbsag: {
    apiCategory: "other",
    key: "serology",
    label: "Hepatitis B Surface Antigen",
    serology: {
      defaultSpecimen: "Serum",
      defaultTestName: "Hepatitis B Surface Antigen",
      lockedFields: ["test"],
      resultPlaceholder: "Enter HBsAg result",
    },
  },
  syphilis: {
    apiCategory: "other",
    key: "serology",
    label: "Syphilis",
    serology: {
      defaultSpecimen: "Serum",
      defaultTestName: "Syphilis",
      lockedFields: ["test"],
      resultPlaceholder: "Enter syphilis result",
    },
  },
  serumPT: {
    apiCategory: "other",
    key: "pregnancy-test",
    label: "Pregnancy Test (Serum)",
    serology: {
      defaultSpecimen: "Serum",
      defaultTestName: "Pregnancy Test",
      lockedFields: ["specimen", "test"],
      resultPlaceholder: "Enter serum pregnancy test result",
    },
  },
  urinePT: {
    apiCategory: "other",
    key: "pregnancy-test",
    label: "Pregnancy Test (Urine)",
    serology: {
      defaultSpecimen: "Urine",
      defaultTestName: "Pregnancy Test",
      lockedFields: ["specimen", "test"],
      resultPlaceholder: "Enter urine pregnancy test result",
    },
  },
  hematology: {
    apiCategory: "hematology",
    key: "cbc",
    label: "Hematology",
  },
  serology: {
    apiCategory: "other",
    key: "serology",
    label: "Serology",
    serology: {},
  },
  chemistry: {
    apiCategory: "clinical-chemistry",
    key: "chemistry-panel",
    label: "Chemistry",
  },
  ogtt: {
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "OGTT",
    ogtt: {
      defaultTestType: "OGTT",
      phases: [
        ogttFastingPhase,
        {
          conversionFieldName: "onehagl_conv",
          fieldName: "onehagl",
          label: "1 Hour After Glucose Load",
        },
        {
          conversionFieldName: "twohagl_conv",
          fieldName: "twohagl",
          label: "2 Hours After Glucose Load",
        },
        {
          conversionFieldName: "threehagl_conv",
          fieldName: "threehagl",
          label: "3 Hours After Glucose Load",
        },
      ],
    },
  },
  general: {
    apiCategory: "other",
    key: "general",
    label: "General Result",
  },
};

const toKnownSchemaKey = (value?: string | null): LabSchemaKey | null => {
  if (!value) {
    return null;
  }

  return value in templateBySchemaKey ? (value as LabSchemaKey) : null;
};

const normalizeTestType = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const resolveLabTemplate = (
  request: Pick<LabRequest, "category" | "schemaKey" | "testType">
): LabTemplateDefinition => {
  const schemaKey = toKnownSchemaKey(request.schemaKey);

  if (schemaKey === "clinical_chemistry") {
    const normalizedTestType = normalizeTestType(request.testType);

    if (normalizedTestType.includes("creatinine")) {
      return createSingleChemistryTemplate("Creatinine", "creatinine", {
        conversionFactor: 88.4,
        conversionFieldName: "creatinine_conv",
        conversionLabel: "umol/L",
      });
    }

    return {
      apiCategory: "clinical-chemistry",
      key: "clinical-chemistry-panel",
      label: "Clinical Chemistry",
    };
  }

  if (schemaKey) {
    return templateBySchemaKey[schemaKey] ?? templateBySchemaKey.general!;
  }

  const normalizedTestType = normalizeTestType(request.testType);

  if (normalizedTestType.includes("blood typing")) {
    return templateBySchemaKey.BT ?? templateBySchemaKey.general!;
  }

  if (
    normalizedTestType.includes("blood count") ||
    normalizedTestType.includes("cbc") ||
    normalizedTestType.includes("hematology")
  ) {
    return templateBySchemaKey.CBC ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("urinalysis")) {
    return templateBySchemaKey.urinalysis ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("fecal occult")) {
    return templateBySchemaKey.FOBT ?? templateBySchemaKey.general!;
  }

  if (
    normalizedTestType.includes("fecal") ||
    normalizedTestType.includes("parasit") ||
    normalizedTestType.includes("stool")
  ) {
    return templateBySchemaKey.parasitology ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("dengue")) {
    return templateBySchemaKey.dengue ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("pregnancy") && normalizedTestType.includes("serum")) {
    return templateBySchemaKey.serumPT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("pregnancy") && normalizedTestType.includes("urine")) {
    return templateBySchemaKey.urinePT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("syphilis")) {
    return templateBySchemaKey.syphilis ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("hepatitis")) {
    return templateBySchemaKey.hbsag ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("hba1c") || normalizedTestType.includes("glycosylated")) {
    return templateBySchemaKey.hba1c ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("1h") && normalizedTestType.includes("ogtt")) {
    return templateBySchemaKey.onehOGTT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("2h") && normalizedTestType.includes("ogtt")) {
    return templateBySchemaKey.twohOGTT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("ogtt")) {
    return templateBySchemaKey.OGTT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("fbs")) {
    return templateBySchemaKey.FBS ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("rbs")) {
    return templateBySchemaKey.RBS ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("bun") || normalizedTestType.includes("urea")) {
    return templateBySchemaKey.BUN ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("creatinine")) {
    return createSingleChemistryTemplate("Creatinine", "creatinine", {
      conversionFactor: 88.4,
      conversionFieldName: "creatinine_conv",
      conversionLabel: "umol/L",
    });
  }

  if (normalizedTestType.includes("uric acid")) {
    return templateBySchemaKey.uricacid ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("hdl")) {
    return templateBySchemaKey.HDL ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("ldl")) {
    return templateBySchemaKey.LDL ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("triglyceride")) {
    return templateBySchemaKey.triglycerides ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("cholesterol")) {
    return templateBySchemaKey.totalcholesterol ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("sgpt")) {
    return templateBySchemaKey.SGPT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("sodium")) {
    return templateBySchemaKey.sodium ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("potassium")) {
    return templateBySchemaKey.potassium ?? templateBySchemaKey.general!;
  }

  if (request.category === "hematology") {
    return templateBySchemaKey.CBC ?? templateBySchemaKey.general!;
  }

  if (request.category === "parasitology") {
    return templateBySchemaKey.parasitology ?? templateBySchemaKey.general!;
  }

  if (request.category === "urinalysis") {
    return templateBySchemaKey.urinalysis ?? templateBySchemaKey.general!;
  }

  if (request.category === "clinical-chemistry") {
    return {
      apiCategory: "clinical-chemistry",
      key: "clinical-chemistry-panel",
      label: "Clinical Chemistry",
    };
  }

  return templateBySchemaKey.general!;
};

export const getLabTemplateLabel = (request: Pick<LabRequest, "category" | "schemaKey" | "testType">) =>
  resolveLabTemplate(request).label;

export const getLabRecordGroupLabel = (recordGroup: LabRecordGroup) => {
  if (recordGroup === "hematology") {
    return "Hematology";
  }

  if (recordGroup === "serology") {
    return "Serology";
  }

  if (recordGroup === "clinical-chemistry") {
    return "Clinical Chemistry";
  }

  if (recordGroup === "clinical-microscopy") {
    return "Clinical Microscopy";
  }

  return "Other Tests";
};

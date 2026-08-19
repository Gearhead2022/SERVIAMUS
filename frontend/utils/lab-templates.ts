import {
  LabCategory,
  LabRecordGroup,
  LabRequest,
  LabSchemaKey,
  LabTemplateKey,
} from "@/types/LabTypes";

type ReferenceValue = {
  label?: string;
  conventional: string;
  si: string;
};

type SerologyTemplateConfig = {
  defaultMethod?: string;
  defaultSpecimen?: string;
  defaultTestName?: string;
  lockedFields?: Array<"method" | "specimen" | "test">;
  requireDayOfFever?: boolean;
  resultLabel?: string;
  resultPlaceholder?: string;
  showDayOfFever?: boolean;
  specimenPlaceHolder?: string;
};

type SingleChemistryTemplateConfig = {
  conversionFactor?: number;
  conversionFieldName?: string;
  conversionLabel?: string;
  fieldLabel: string;
  fieldName: string;
  showMealFields?: boolean;
  referenceValues: ReferenceValue[];
};

type OgttPhaseConfig = {
  conversionFieldName: string;
  fieldName: string;
  label: string;
};

type OgttTemplateConfig = {
  defaultTestType: string;
  phases: OgttPhaseConfig[];
  referenceValues: ReferenceValue[];
};

export type ClinicalChemistryRow = {
  conversionFieldName?: string;
  fieldName: string;
  label: string;
  showMealFields?: boolean;
  referenceValues?: ReferenceValue[];
};

export type ChemistryPanelFieldName =
  | "chloride"
  | "ionized_calcium"
  | "potassium"
  | "sodium"
  | "ionized_calcium_conv";

export type ChemistryPanelRow = {
  fieldName: ChemistryPanelFieldName;
  label: string;
  unit?: string;
  referenceValues?: string;
};

export type LabTemplateDefinition = {
  apiCategory: LabCategory;
  key: LabTemplateKey;
  label: string;
  ogtt?: OgttTemplateConfig;
  serology?: SerologyTemplateConfig;
  singleChemistry?: SingleChemistryTemplateConfig;
};

type LabTemplateRequestContext = Pick<LabRequest, "category" | "schemaKey" | "testType"> & {
  tests?: string[];
};

const createSingleChemistryTemplate = (
  label: string,
  fieldName: string,
  options?: Omit<SingleChemistryTemplateConfig, "fieldLabel" | "fieldName">,
): LabTemplateDefinition => ({
  apiCategory: "clinical-chemistry",
  key: "single-chemistry",
  label,
  singleChemistry: {
    fieldLabel: label,
    fieldName,
    referenceValues: [],
    ...options,
  },
});

const clinicalChemistryRows: ClinicalChemistryRow[] = [
  {
    label: "FBS (Fasting Blood Sugar)",
    fieldName: "FBS",
    conversionFieldName: "FBS_conv",
    showMealFields: true,
    referenceValues: [
      {
        conventional: "75-115",
        si: "4.13-6.33",
      },
    ],
  },
  {
    label: "RBS (Random Blood Sugar)",
    fieldName: "RBS",
    conversionFieldName: "RBS_conv",
    showMealFields: true,
    referenceValues: [
      {
        conventional: "",
        si: "",
      },
    ],

  },
  {
    label: "BUN (Blood Urea Nitrogen)",
    fieldName: "BUN",
    conversionFieldName: "BUN_conv",
    referenceValues: [
      {
        conventional: "5-24",
        si: "2.78-8.57",
      },
    ],
  },
  {
    label: "Creatinine",
    fieldName: "creatinine",
    conversionFieldName: "creatinine_conv",
    referenceValues: [
      {
        conventional: "0.6-1.4",
        si: "53.04-123.76",
      },
    ],
  },
  {
    label: "Uric Acid",
    fieldName: "uric_acid",
    conversionFieldName: "uric_acid_conv",
    referenceValues: [
      {
        conventional: "2.5-7.0",
        si: "0.15-0.41",
      },
    ],
  },
  {
    label: "Total Cholesterol",
    fieldName: "cholesterol",
    conversionFieldName: "cholesterol_conv",
    referenceValues: [
      {
        conventional: "150-220",
        si: "3.9-5.72",
      },
    ],
  },
  {
    label: "HDL Cholesterol",
    fieldName: "hdl_cholesterol",
    conversionFieldName: "hdl_cholesterol_conv",
    referenceValues: [
      {
        conventional: "30-85",
        si: "0.78-2.21",
      },
    ],
  },
  {
    label: "LDL Cholesterol",
    fieldName: "ldl_cholesterol",
    conversionFieldName: "ldl_cholesterol_conv",
    referenceValues: [
      {
        label: "Suspicious :",
        conventional: "150",
        si: "3.9",
      },
      {
        label: "Elevated :",
        conventional: "190",
        si: "4.9",
      },
    ],
  },
  {
    label: "Triglycerides",
    fieldName: "triglycerides",
    conversionFieldName: "triglycerides_conv",
    referenceValues: [
      {
        label: "Male :",
        conventional: "60-165",
        si: "0.68-1.88",
      },
      {
        label: "Female :",
        conventional: "40=140",
        si: "0.46-1.60",
      },
    ],
  },
  {
    label: "SGPT",
    fieldName: "sgpt",
    referenceValues: [
      {
        label: "Male : Up to",
        conventional: "40",
        si: "",
      },
      {
        label: "Female : Up to",
        conventional: "31",
        si: "",
      },
    ],
  },
];

const clinicalChemistryMatchers: Array<{
  fieldName: ClinicalChemistryRow["fieldName"];
  matchers: string[];
}> = [
    { fieldName: "FBS", matchers: ["fbs", "fasting blood sugar"] },
    { fieldName: "RBS", matchers: ["rbs", "random blood sugar"] },
    { fieldName: "BUN", matchers: ["bun", "blood urea nitrogen", "urea"] },
    { fieldName: "creatinine", matchers: ["creatinine"] },
    { fieldName: "uric_acid", matchers: ["uric acid", "uricacid"] },
    { fieldName: "hdl_cholesterol", matchers: ["hdl cholesterol", "hdl"] },
    { fieldName: "ldl_cholesterol", matchers: ["ldl cholesterol", "ldl"] },
    { fieldName: "cholesterol", matchers: ["total cholesterol", "cholesterol"] },
    { fieldName: "triglycerides", matchers: ["triglycerides", "triglyceride"] },
    {
      fieldName: "sgpt",
      matchers: ["sgpt", "serum glutamic pyruvic transaminase"],
    },
  ];

const chemistryPanelRows: ChemistryPanelRow[] = [
  { fieldName: "sodium", label: "Sodium (Na)", unit: "mmol/L", referenceValues: "135-150" },
  { fieldName: "potassium", label: "Potassium (K)", unit: "mmol/L", referenceValues: "3.5-5.0" },
  { fieldName: "chloride", label: "Chloride (Cl)", unit: "mmol/L", referenceValues: "94-110" },
  { fieldName: "ionized_calcium", label: "Ionized Calcium (lCa )", unit: "mg/dL", referenceValues: "1.10-1.35" },
  { fieldName: "ionized_calcium_conv", label: "Ionized Calcium Converted", unit: "mg/dL", referenceValues: "4.4-5.4" },
];

const chemistryPanelMatchers: Array<{
  fieldName: ChemistryPanelRow["fieldName"];
  matchers: string[];
}> = [
    { fieldName: "sodium", matchers: ["sodium"] },
    { fieldName: "potassium", matchers: ["potassium"] },
    { fieldName: "chloride", matchers: ["chloride"] },
    {
      fieldName: "ionized_calcium",
      matchers: ["ionized calcium", "ionized ca", "calcium ionized", "ionized"],
    },
    { fieldName: "ionized_calcium_conv", matchers: ["ionized_calcium_conv"] },
  ];

const ogttFastingPhase: OgttPhaseConfig = {
  conversionFieldName: "FBS_conv",
  fieldName: "FBS",
  label: "Fasting Blood Sugar",
};

const ogttOneHourPhase: OgttPhaseConfig = {
  conversionFieldName: "onehagl_conv",
  fieldName: "onehagl",
  label: "1 Hour After Glucose Load",
};

const ogttTwoHourPhase: OgttPhaseConfig = {
  conversionFieldName: "twohagl_conv",
  fieldName: "twohagl",
  label: "2 Hours After Glucose Load",
};

const ogttThreeHourPhase: OgttPhaseConfig = {
  conversionFieldName: "threehagl_conv",
  fieldName: "threehagl",
  label: "3 Hours After Glucose Load",
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
    referenceValues: [
      {
        conventional: "75-115",
        si: "4.13-6.33",
      },
    ],
  }),
  RBS: createSingleChemistryTemplate("Random Blood Sugar (RBS)", "RBS", {
    conversionFactor: 0.055,
    conversionFieldName: "RBS_conv",
    conversionLabel: "mmol/L",
    showMealFields: true,
    referenceValues: [
      {
        conventional: "75-115",
        si: "4.13-6.33",
      },
    ],
  }),
  BUN: createSingleChemistryTemplate("Urea (BUN)", "BUN", {
    conversionFactor: 0.357,
    conversionFieldName: "BUN_conv",
    conversionLabel: "mmol/L",
    referenceValues: [
      {
        conventional: "5-24",
        si: "2.78-8.57",
      },
    ],
  },
  ),
  uricacid: createSingleChemistryTemplate("Uric Acid", "uric_acid",
    {
      conversionFactor: 0.059,
      conversionFieldName: "uric_acid_conv",
      conversionLabel: "mmol/L",
      referenceValues: [
        {
          conventional: "2.5-7.0",
          si: "0.15-0.41",
        },
      ],
    },
  ),
  totalcholesterol: createSingleChemistryTemplate("Total Cholesterol", "cholesterol", {
    conversionFactor: 0.026,
    conversionFieldName: "cholesterol_conv",
    conversionLabel: "mmol/L",
    referenceValues: [
      {
        conventional: "150-220",
        si: "3.9-5.72",
      },
    ],
  }),
  HDL: createSingleChemistryTemplate("HDL-Cholesterol", "hdl_cholesterol", {
    conversionFactor: 0.026,
    conversionFieldName: "hdl_cholesterol_conv",
    conversionLabel: "mmol/L",
    referenceValues: [
      {
        conventional: "30-85",
        si: "0.78-2.21",
      },
    ],
  }),
  LDL: createSingleChemistryTemplate("LDL-Cholesterol", "ldl_cholesterol", {
    conversionFactor: 0.026,
    conversionFieldName: "ldl_cholesterol_conv",
    conversionLabel: "mmol/L",
    referenceValues: [
      {
        label: "Suspicious",
        conventional: "150",
        si: "3.9",
      },
      {
        label: "Elevated",
        conventional: "190",
        si: "4.9",
      },
    ],
  }),
  triglycerides: createSingleChemistryTemplate("Triglycerides", "triglycerides", {
    conversionFactor: 0.011,
    conversionFieldName: "triglycerides_conv",
    conversionLabel: "mmol/L",
    referenceValues: [
      {
        label: "Male",
        conventional: "60-165",
        si: "0.68-1.88",
      },
      {
        label: "Female",
        conventional: "40-140",
        si: "0.46-1.60",
      },
    ],
  }),
  SGPT: createSingleChemistryTemplate(
    "Serum Glutamic Pyruvic Transaminase",
    "sgpt", {
    referenceValues: [
      {
        label: "Male",
        conventional: "40",
        si: "",
      },
      {
        label: "Female",
        conventional: "31",
        si: "",
      },
    ],
  }
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
    label: "100G-OGTT",
    ogtt: {
      defaultTestType: "100G-OGTT",
      phases: [
        ogttFastingPhase,
        ogttOneHourPhase,
        ogttTwoHourPhase,
        ogttThreeHourPhase,
      ],
      referenceValues: [
        {
          conventional: "95",
          si: "5.23",
        },
        {
          conventional: "180",
          si: "9.90",
        },
        {
          conventional: "155",
          si: "8.53",
        },
        {
          conventional: "140",
          si: "7.70",
        },
      ],
    },
  },
  onehOGTT: {
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "50G-OGTT",
    ogtt: {
      defaultTestType: "50G-OGTT",
      phases: [ogttOneHourPhase],
      referenceValues: [
        {
          conventional: "140",
          si: "7.7",
        },
      ],
    },
  },
  twohOGTT: { // non gestational
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "75G-OGTT",
    ogtt: {
      defaultTestType: "75G-OGTT",
      phases: [ogttFastingPhase, ogttOneHourPhase, ogttTwoHourPhase],
      referenceValues: [
        {
          conventional: "92",
          si: "5.06",
        },
        {
          conventional: "180",
          si: "9.9",
        },
        {
          conventional: "153",
          si: "8.4",
        },
      ],
    },
  },
  twohOGTTv2: { // gestational
    apiCategory: "clinical-chemistry",
    key: "ogtt",
    label: "75G-OGTTv2",
    ogtt: {
      defaultTestType: "75G-OGTT",
      phases: [ogttFastingPhase, ogttOneHourPhase, ogttTwoHourPhase],
      referenceValues: [
        {
          conventional: "92",
          si: "5.06",
        },
        {
          conventional: "180",
          si: "9.9",
        },
        {
          conventional: "153",
          si: "8.4",
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
      defaultMethod: "Qualitative Lateral Flow  Chromatographic Immuno Assay (Dengue NS1 antigens)",
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
    label: "Hepatitis B Surface Antigen (HBS Ag)",
    serology: {
      defaultSpecimen: "Serum",
      defaultMethod: "Rapid Qualitative Immunochromatographic Assay",
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
      defaultMethod: "Rapid Qualitative Immunochromatographic Assay",
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
      defaultMethod: "Rapid Qualitative Immunochromatographic Assay",
      defaultTestName: "Pregnancy Test (HCG)",
      lockedFields: ["specimen", "test"],
      resultPlaceholder: "Enter serum pregnancy test result",
      specimenPlaceHolder: "Min. Detection level Serum/Plasma: 10mlU/mL"
    },
  },
  urinePT: {
    apiCategory: "other",
    key: "pregnancy-test",
    label: "Pregnancy Test (Urine)",
    serology: {
      defaultSpecimen: "Urine",
      defaultMethod: "Rapid Qualitative Immunochromatographic Assay",
      defaultTestName: "Pregnancy Test (HCG)",
      lockedFields: ["specimen", "test"],
      resultPlaceholder: "Enter urine pregnancy test result",
      specimenPlaceHolder: "Min. Detection level Urine: 25mlU/mL"
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
    label: "100G-OGTT",
    ogtt: {
      defaultTestType: "100G-OGTT",
      phases: [
        ogttFastingPhase,
        ogttOneHourPhase,
        ogttTwoHourPhase,
        ogttThreeHourPhase,
      ],
      referenceValues: [
        {
          conventional: "<95",
          si: "<5.23",
        },
        {
          conventional: "<180",
          si: "<9.98",
        },
        {
          conventional: "<155",
          si: "<8.59",
        },
        {
          conventional: "<140",
          si: "<7.77",
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

const uniqueRows = <T extends { fieldName: string }>(rows: T[]) => {
  const seen = new Set<string>();

  return rows.filter((row) => {
    if (seen.has(row.fieldName)) {
      return false;
    }

    seen.add(row.fieldName);
    return true;
  });
};

const resolveClinicalChemistryRowByTestName = (testName: string) => {
  const normalizedTestName = normalizeTestType(testName);
  const matchedFieldName = clinicalChemistryMatchers.find(({ matchers }) =>
    matchers.some((matcher) => normalizedTestName.includes(matcher))
  )?.fieldName;

  // if (!matchedFieldName) {
  //   console.warn(
  //     "No chemistry matcher found for:",
  //     normalizedTestName
  //   );

  //   return null;
  // }

  if (!matchedFieldName) {
    return null;
  }

  return clinicalChemistryRows.find((row) => row.fieldName === matchedFieldName) ?? null;
};

const resolveChemistryPanelRowByTestName = (testName: string) => {
  const normalizedTestName = normalizeTestType(testName);
  const matchedFieldName = chemistryPanelMatchers.find(({ matchers }) =>
    matchers.some((matcher) => normalizedTestName.includes(matcher))
  )?.fieldName;

  if (!matchedFieldName) {
    return null;
  }

  return chemistryPanelRows.find((row) => row.fieldName === matchedFieldName) ?? null;
};

export const getClinicalChemistryRows = (fieldNames?: string[]) => {
  if (!fieldNames?.length) {
    return clinicalChemistryRows;
  }

  return clinicalChemistryRows.filter((row) => fieldNames.includes(row.fieldName));
};

export const getChemistryPanelRows = (fieldNames?: string[]) => {
  if (!fieldNames?.length) {
    return chemistryPanelRows;
  }

  return chemistryPanelRows.filter((row) => fieldNames.includes(row.fieldName));
};

export const resolveClinicalChemistryFieldNames = (
  request: Pick<LabRequest, "schemaKey" | "testType"> & { tests?: string[] }
) => {
  const normalizedTestType = normalizeTestType(request.testType);
  const schemaKey = toKnownSchemaKey(request.schemaKey);
  // When a backend item represents a morphed workflow entry, `tests` contains
  // the full ordered test list so the editor can light up every matching row.
  const sourceTests = request.tests?.length ? request.tests : [request.testType];
  const matchedRows = uniqueRows(
    sourceTests
      .map((testName) => resolveClinicalChemistryRowByTestName(testName))
      .filter((row): row is ClinicalChemistryRow => Boolean(row))
  );

  if (matchedRows.length) {
    return matchedRows.map((row) => row.fieldName);
  }

  if (
    schemaKey === "clinical_chemistry" &&
    (normalizedTestType.includes("blood chemistry") ||
      normalizedTestType.includes("clinical chemistry"))
  ) {
    return clinicalChemistryRows.map((row) => row.fieldName);
  }

  return [];
};

export const resolveChemistryPanelFieldNames = (
  request: Pick<LabRequest, "schemaKey" | "testType"> & { tests?: string[] }
) => {
  const normalizedTestType = normalizeTestType(request.testType);
  const schemaKey = toKnownSchemaKey(request.schemaKey);
  // The chemistry panel follows the same morphing contract as clinical chemistry:
  // one workflow item can fan out to several visible result rows.
  const sourceTests = request.tests?.length ? request.tests : [request.testType];
  const matchedRows = uniqueRows(
    sourceTests
      .map((testName) => resolveChemistryPanelRowByTestName(testName))
      .filter((row): row is ChemistryPanelRow => Boolean(row))
  );

  if (matchedRows.length) {
    return matchedRows.map((row) => row.fieldName);
  }

  if (
    schemaKey === "chemistry" &&
    (normalizedTestType.includes("chemistry") ||
      normalizedTestType.includes("electrolyte"))
  ) {
    return chemistryPanelRows.map((row) => row.fieldName);
  }

  return [];
};

export const shouldShowClinicalChemistryMealFields = (
  request: Pick<LabRequest, "schemaKey" | "testType"> & { tests?: string[] }
) =>
  getClinicalChemistryRows(resolveClinicalChemistryFieldNames(request)).some(
    (row) => row.showMealFields
  );

const shouldUseCombinedClinicalChemistryTemplate = (request: LabTemplateRequestContext) => {
  const allFieldNames = resolveClinicalChemistryFieldNames(request);
  const currentItemFieldNames = resolveClinicalChemistryFieldNames({
    schemaKey: request.schemaKey,
    testType: request.testType,
    tests: [request.testType],
  });

  // We only morph into the combined template when the request contains more
  // than the current item's own field set; otherwise single-test chemistry
  // requests would incorrectly open the consolidated form.
  return currentItemFieldNames.length > 0 && allFieldNames.length > 1;
};

const shouldUseChemistryPanelTemplate = (request: LabTemplateRequestContext) => {
  const allFieldNames = resolveChemistryPanelFieldNames(request);
  const currentItemFieldNames = resolveChemistryPanelFieldNames({
    schemaKey: request.schemaKey,
    testType: request.testType,
    tests: [request.testType],
  });

  // Electrolyte-style chemistry requests always use the shared panel once the
  // request resolves to at least one known chemistry panel row.
  return currentItemFieldNames.length > 0 && allFieldNames.length > 0;
};

const shouldUseCombinedHematologyTemplate = (request: LabTemplateRequestContext) => {
  const sourceTests = request.tests?.length ? request.tests : [request.testType];
  const schemaKey = toKnownSchemaKey(request.schemaKey);
  const hasCbc =
    schemaKey === "CBC" ||
    sourceTests.some((testName) => {
      const normalizedTestName = normalizeTestType(testName);
      return (
        normalizedTestName.includes("cbc") ||
        normalizedTestName.includes("complete blood count") ||
        normalizedTestName.includes("blood count")
      );
    });
  const hasBloodTyping =
    schemaKey === "BT" ||
    sourceTests.some((testName) => {
      const normalizedTestName = normalizeTestType(testName);
      return (
        normalizedTestName.includes("blood typing") ||
        normalizedTestName.includes("blood type")
      );
    });

  return hasCbc && hasBloodTyping;
};

export const resolveLabTemplate = (request: LabTemplateRequestContext): LabTemplateDefinition => {
  const schemaKey = toKnownSchemaKey(request.schemaKey);

  if (shouldUseCombinedHematologyTemplate(request)) {
    return {
      apiCategory: "hematology",
      key: "hematology-panel",
      label: "Hematology",
    };
  }

  // Frontend morphing starts here: backend groups the workflow entry, then the
  // template resolver decides which result form component should render for it.
  if (shouldUseChemistryPanelTemplate(request)) {
    return {
      apiCategory: "clinical-chemistry",
      key: "chemistry-panel",
      label: "Chemistry",
    };
  }

  if (schemaKey === "clinical_chemistry") {
    const normalizedTestType = normalizeTestType(request.testType);

    if (
      normalizedTestType.includes("creatinine") &&
      !shouldUseCombinedClinicalChemistryTemplate(request)
    ) {
      return createSingleChemistryTemplate("Creatinine", "creatinine", {
        conversionFactor: 88.4,
        conversionFieldName: "creatinine_conv",
        conversionLabel: "umol/L",
        referenceValues: [
          {
            conventional: "0.6-1.4",
            si: "53.04-123.76",
          },
        ],
      });
    }

    return {
      apiCategory: "clinical-chemistry",
      key: "clinical-chemistry-panel",
      label: "Clinical Chemistry",
    };
  }

  if (shouldUseCombinedClinicalChemistryTemplate(request)) {
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

  if (
    (normalizedTestType.includes("50g") || normalizedTestType.includes("50 grams")) &&
    normalizedTestType.includes("ogtt")
  ) {
    return templateBySchemaKey.onehOGTT ?? templateBySchemaKey.general!;
  }

  if (
    (normalizedTestType.includes("75g") || normalizedTestType.includes("75 grams")) &&
    normalizedTestType.includes("ogtt")
  ) {
    return templateBySchemaKey.twohOGTT ?? templateBySchemaKey.general!; // non gestational
  }

  if (normalizedTestType.includes("1h") && normalizedTestType.includes("ogtt")) {
    return templateBySchemaKey.onehOGTT ?? templateBySchemaKey.general!;
  }

  if (normalizedTestType.includes("2h") && normalizedTestType.includes("ogtt")) {
    return templateBySchemaKey.twohOGTTv2 ?? templateBySchemaKey.general!; // gestational
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
      referenceValues: [
        {
          conventional: "0.6-1.4",
          si: "53.04-123.76",
        },
      ],
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

export const getLabTemplateLabel = (
  request: Pick<LabRequest, "category" | "schemaKey" | "testType"> & { tests?: string[] }
) => resolveLabTemplate(request).label;

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

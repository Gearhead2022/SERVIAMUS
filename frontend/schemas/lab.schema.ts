import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = () => z.string().trim();
const numericResult = (label = "Result") =>
  z
    .number()
    .finite(`${label} must be a valid number.`);

type DynamicSchemaField =
  | { name: string; type: "number"; label?: string }
  | { name: string; type: "text"; label?: string; required?: boolean };

const createDynamicSchema = (fields: DynamicSchemaField[]) =>
  z.object(
    Object.fromEntries(
      fields.map((field) => {
        if (field.type === "number") {
          return [field.name, numericResult(field.label ?? field.name)];
        }

        if (field.required) {
          return [
            field.name,
            requiredText(`${field.label ?? field.name} is required`),
          ];
        }

        return [field.name, optionalText()];
      })
    )
  );

  

export const clinicalChemistrySchema = z.object({
  FBS: numericResult("FBS"),
  FBS_conv: numericResult("FBS conversion"),
  RBS: numericResult("RBS"),
  RBS_conv: numericResult("RBS conversion"),
  BUN: numericResult("BUN"),
  BUN_conv: numericResult("BUN conversion"),
  creatinine: numericResult("Creatinine"),
  creatinine_conv: numericResult("Creatinine conversion"),
  uric_acid: numericResult("Uric acid"),
  uric_acid_conv: numericResult("Uric acid conversion"),
  cholesterol: numericResult("Total cholesterol"),
  cholesterol_conv: numericResult("Total cholesterol conversion"),
  hdl_cholesterol: numericResult("HDL cholesterol"),
  hdl_cholesterol_conv: numericResult("HDL cholesterol conversion"),
  ldl_cholesterol: z.union([
  z.number().finite("LDL cholesterol"),
  z.literal("N/A"),
  ]),
  ldl_cholesterol_conv: z.union([
  z.number().finite("LDL cholesterol conversion"),
  z.literal("N/A"),
  ]),
  triglycerides: numericResult("Triglycerides"),
  triglycerides_conv: numericResult("Triglycerides conversion"),
  sgpt: numericResult("SGPT"),
  last_meal: optionalText(),
  time_taken: optionalText(),
  note: optionalText(),
  remarks: optionalText(),
}
);


export type ClinicalChemistryFormValues = z.infer<typeof clinicalChemistrySchema>;

export const clinicalChemistryDefaultValues: ClinicalChemistryFormValues = {
  FBS: 0,
  FBS_conv: 0,
  RBS: 0,
  RBS_conv: 0,
  BUN: 0,
  BUN_conv: 0,
  creatinine: 0,
  creatinine_conv: 0,
  uric_acid: 0,
  uric_acid_conv: 0,
  cholesterol: 0,
  cholesterol_conv: 0,
  hdl_cholesterol: 0,
  hdl_cholesterol_conv: 0,
  ldl_cholesterol: 0,
  ldl_cholesterol_conv: 0,
  triglycerides: 0,
  triglycerides_conv: 0,
  sgpt: 0,
  last_meal: "",
  time_taken: "",
  note: "THE FRIEDWALD FORMULA FOR THE COMPUTATION OF LDL CHOLESTEROL IS NOT APPLICABLE FOR TRIGLYCERIDES LEVEL ABOVE 400 MG/DL. DIRECT DETERMINATION OF LDL CHOLESTEROL IS RECOMMENDED.",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS"
};

export const cbcSchema = z.object({
  Hemoglobin: numericResult("Hemoglobin"),
  Hematocrit: numericResult("Hematocrit"),
  rbc_count: numericResult("RBC count"),
  wbc_count: numericResult("WBC count"),
  platelet_count: numericResult("Platelet count"),
  others_mcv: numericResult("MCV"),
  mchc: numericResult("MCHC"),
  reticulocyte_count: numericResult("Reticulocyte count"),
  nss_1: numericResult("Neutrophils (Seg)"),
  nss_2: numericResult("Neutrophils (Stab)"),
  nss_3: numericResult("NSS 3"),
  lymphocytes: numericResult("Lymphocytes"),
  monocytes: numericResult("Monocytes"),
  eosinophils: numericResult("Eosinophils"),
  basophils: numericResult("Basophils"),
  others1: optionalText(),
  others2: optionalText(),
  bleeding_time: numericResult("Bleeding time"),
  clotting_time: numericResult("Clotting time"),
  remarks: optionalText(),
});

export type CbcFormValues = z.infer<typeof cbcSchema>;

export const cbcDefaultValues: CbcFormValues = {
  Hemoglobin: 0,
  Hematocrit: 0,
  rbc_count: 0,
  wbc_count: 0,
  platelet_count: 0,
  others_mcv: 0,
  mchc: 0,
  reticulocyte_count: 0,
  nss_1: 0,
  nss_2: 0,
  nss_3: 0,
  lymphocytes: 0,
  monocytes: 0,
  eosinophils: 0,
  basophils: 0,
  others1: "",
  others2: "",
  bleeding_time: 0,
  clotting_time: 0,
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS",
};

export const bloodTypingSchema = z.object({
  abo_type: requiredText("ABO type is required"),
  rh_type: requiredText("Rh type is required"),
  others2: optionalText(),
  remarks: optionalText(),
});

export type BloodTypingFormValues = z.infer<typeof bloodTypingSchema>;

export const bloodTypingDefaultValues: BloodTypingFormValues = {
  abo_type: "",
  rh_type: "",
  others2: "",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS",
};

export const parasitologySchema = z.object({
  time_collected: requiredText("Time collected is required"),
  time_received: requiredText("Time received is required"),
  color: optionalText(),
  consistency: optionalText(),
  pus_cells: optionalText(),
  rbc: optionalText(),
  bacteria: optionalText(),
  hookworm: optionalText(),
  ascaris: optionalText(),
  trichuris: optionalText(),
  strongloides: optionalText(),
  histolytica_cyst: optionalText(),
  histolytica_trophozoite: optionalText(),
  coli_cyst: optionalText(),
  coli_trophozoite: optionalText(),
  others: optionalText(),
  remarks: optionalText()
});

export type ParasitologyFormValues = z.infer<typeof parasitologySchema>;

export const parasitologyDefaultValues: ParasitologyFormValues = {
  time_collected: "",
  time_received: "",
  color: "",
  consistency: "",
  pus_cells: "",
  rbc: "",
  bacteria: "",
  hookworm: "",
  ascaris: "",
  trichuris: "",
  strongloides: "",
  histolytica_cyst: "",
  histolytica_trophozoite: "",
  coli_cyst: "",
  coli_trophozoite: "",
  others: "",
  remarks: "NO INTESTINAL PARASITE SEEN IN DIRECT FECAL SMEAR",
};

export const urinalysisSchema = z.object({
  color: optionalText(),
  transparency: optionalText(),
  ph_result: optionalText(),
  spec_grav_result: optionalText(),
  protein: optionalText(),
  nitrite: optionalText(),
  glucose: optionalText(),
  ketones: optionalText(),
  leukocytes: optionalText(),
  blood: optionalText(),
  pus_cells: optionalText(),
  rbc: optionalText(),
  bacteria: optionalText(),
  squamous_cell: optionalText(),
  round_cell: optionalText(),
  mucous: optionalText(),
  crystals: optionalText(),
  casts: optionalText(),
  others: optionalText(),
  remarks: optionalText(),
});

export type UrinalysisFormValues = z.infer<typeof urinalysisSchema>;

export const urinalysisDefaultValues: UrinalysisFormValues = {
  color: "",
  transparency: "",
  ph_result: "",
  spec_grav_result: "",
  protein: "Negative",
  nitrite: "Negative",
  glucose: "Negative",
  ketones: "Negative",
  leukocytes: "Negative",
  blood: "Negative",
  pus_cells: "",
  rbc: "",
  bacteria: "",
  squamous_cell: "",
  round_cell: "",
  mucous: "",
  crystals: "",
  casts: "",
  others: "",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS",
};

export const createSerologySchema = ({
  requireDayOfFever = false,
}: {
  requireDayOfFever?: boolean;
} = {}) =>
  z.object({
    test: requiredText("Test is required"),
    method: optionalText(),
    specimen: requiredText("Specimen is required"),
    result: requiredText("Result is required"),
    remarks: optionalText(),
    day_of_fever: requireDayOfFever
      ? requiredText("Day of fever is required")
      : optionalText(),
  });

export type SerologyFormValues = {
  day_of_fever: string;
  method: string;
  result: string;
  specimen: string;
  test: string;
  remarks: string;
};

export const serologyDefaultValues: SerologyFormValues = {
  test: "",
  method: "",
  specimen: "Serum",
  result: "",
  day_of_fever: "",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS"
};

export const fecalOccultBloodSchema = z.object({
  test: requiredText("Test is required"),
  method: optionalText(),
  specimen: requiredText("Specimen is required"),
  result: requiredText("Result is required"),
  remarks: optionalText(),
});

export type FecalOccultBloodFormValues = z.infer<typeof fecalOccultBloodSchema>;

export const fecalOccultBloodDefaultValues: FecalOccultBloodFormValues = {
  test: "Fecal Occult Blood Test",
  method: "Qualitative Lateral Flow Chromatographic Immunoassay",
  specimen: "Stool",
  result: "",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS",
};

export const hbA1cSchema = z.object({
  test_requested: requiredText("Test requested is required"),
  test_method: requiredText("Test method is required"),
  lot_no: optionalText(),
  exp_date: optionalText(),
  specimen: requiredText("Specimen is required"),
  result: numericResult("HbA1c result"),
  normal: optionalText(),
  pre_diabetes: optionalText(),
  diabetes: optionalText(),
  remarks: optionalText(),
});

export type HbA1cFormValues = z.infer<typeof hbA1cSchema>;

export const hbA1cDefaultValues: HbA1cFormValues = {
  test_requested: "GLYCOSYLATED HEMOGLOBIN (HbA1c)",
  test_method: "LATEX IMMUNOAGGLUTINATION",
  lot_no: "",
  exp_date: "",
  specimen: "WHOLE BLOOD",
  result: 0,
  normal: "≤ 5.6 %",
  pre_diabetes: "5.7-6.4 %",
  diabetes: "≥ 6.5 %",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPOPRIATE INTERPRETATION OF RESULTS."
};

export const chemistrySchema = z.object({
  sodium: numericResult("Sodium"),
  potassium: numericResult("Potassium"),
  chloride: numericResult("Chloride"),
  ionized_calcium: numericResult("Ionized calcium"),
  ionized_calcium_conv: numericResult("Ionized calcium"),
  others: optionalText(),
  remarks: optionalText(),
});

export type ChemistryFormValues = z.infer<typeof chemistrySchema>;

export const chemistryDefaultValues: ChemistryFormValues = {
  sodium: 0,
  potassium: 0,
  chloride: 0,
  ionized_calcium: 0,
  ionized_calcium_conv: 0,
  others: "",
  remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS."
};

export const createSingleChemistrySchema = ({
  conversionFieldName,
  fieldName,
  fieldLabel,
  showMealFields = false,
}: {
  conversionFieldName?: string;
  fieldLabel: string;
  fieldName: string;
  showMealFields?: boolean;
}) => {
  const dynamicFields: DynamicSchemaField[] = [
    { name: fieldName, type: "number", label: fieldLabel },
  ];

  if (conversionFieldName) {
    dynamicFields.push({
      name: conversionFieldName,
      type: "number",
      label: `${fieldLabel} conversion`,
    });
  }

  if (showMealFields) {
    dynamicFields.push({ name: "last_meal", type: "text", label: "Last meal" });
    dynamicFields.push({ name: "time_taken", type: "text", label: "Time taken" });
  }

  dynamicFields.push({ name: "remarks", type: "text", label: "Remarks" });

  return createDynamicSchema(dynamicFields);
};

export type SingleChemistryFormValues = Record<string, number | string>;

export const getSingleChemistryDefaultValues = ({
  conversionFieldName,
  fieldName,
  showMealFields = false,
}: {
  conversionFieldName?: string;
  fieldName: string;
  showMealFields?: boolean;
}) => {
  const defaultValues: SingleChemistryFormValues = {
    [fieldName]: 0,
    remarks: "",
  };

  if (conversionFieldName) {
    defaultValues[conversionFieldName] = 0;
  }

  if (showMealFields) {
    defaultValues.last_meal = "";
    defaultValues.time_taken = "";
  }

  return defaultValues;
};

export const createOgttSchema = ({
  phases,
}: {
  phases: Array<{ conversionFieldName: string; fieldName: string; label: string }>;
}) =>
  createDynamicSchema([
    { name: "test_type", type: "text", label: "Test type" },
    {
      name: "remarks",
      type: "text",
      label: "Remarks",
      required: false,
    },
    ...phases.flatMap((phase) => [
      {
        name: phase.fieldName,
        type: "number" as const,
        label: phase.label,
      },
      {
        name: phase.conversionFieldName,
        type: "number" as const,
        label: `${phase.label} conversion`,
      },
    ]),
  ]);

export type OgttFormValues = Record<string, number | string>;

export const getOgttDefaultValues = ({
  defaultTestType,
  phases,
}: {
  defaultTestType: string;
  phases: Array<{ conversionFieldName: string; fieldName: string }>;
}) => {
  const defaultValues: OgttFormValues = {
    test_type: defaultTestType,
    remarks: "PLEASE CORRELATE CLINICALLY FOR APPROPRIATE INTERPRETATION OF RESULTS."
  };

  phases.forEach((phase) => {
    defaultValues[phase.fieldName] = 0;
    defaultValues[phase.conversionFieldName] = 0;
  });

  return defaultValues;
};

export const generalResultSchema = z.object({
  result_summary: optionalText(),
  remarks: optionalText(),
});

export type GeneralResultFormValues = z.infer<typeof generalResultSchema>;

export const generalResultDefaultValues: GeneralResultFormValues = {
  result_summary: "",
  remarks: "",
};

import { z } from "zod";

export const clinicalChemistrySchema = z.object({
  FBS: z.coerce.number().optional(),
  FBS_conv: z.coerce.number().optional(),
  RBS: z.coerce.number().optional(),
  RBS_conv: z.coerce.number().optional(),
  BUN: z.coerce.number().optional(),
  BUN_conv: z.coerce.number().optional(),
  creatinine: z.coerce.number().optional(),
  creatinine_conv: z.coerce.number().optional(),
  uric_acid: z.coerce.number().optional(),
  uric_acid_conv: z.coerce.number().optional(),
  cholesterol: z.coerce.number().optional(),
  cholesterol_conv: z.coerce.number().optional(),
  hdl_cholesterol: z.coerce.number().optional(),
  hdl_cholesterol_conv: z.coerce.number().optional(),
  ldl_cholesterol: z.coerce.number().optional(),
  ldl_cholesterol_conv: z.coerce.number().optional(),
  triglycerides: z.coerce.number().optional(),
  triglycerides_conv: z.coerce.number().optional(),
  sgpt: z.coerce.number().optional(),
  last_meal: z.string().optional(),
  time_taken: z.string().optional(),
});

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
};

export const hematologySchema = z.object({
  Hemoglobin: z.number(),
  rbc_count: z.number(),
  wbc_count: z.number(),
  platelet_count: z.number(),
  others_mcv: z.number(),
  mchc: z.number(),
  reticulocyte_count: z.number(),
  nss_1: z.number(),
  nss_2: z.number(),
  nss_3: z.number(),
  lymphocytes: z.number(),
  monocytes: z.number(),
  eosinophils: z.number(),
  basophils: z.number(),
  others1: z.string(),
  clotting_time: z.string(),
  bleeding_time: z.string(),
  abo_type: z.string(),
  rh_type: z.string(),
  others2: z.string(),
});

export type HematologyFormValues = z.infer<typeof hematologySchema>;

export const hematologyDefaultValues: HematologyFormValues = {
  Hemoglobin: 0,
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
  clotting_time: "",
  bleeding_time: "",
  abo_type: "",
  rh_type: "",
  others2: "",
};

export const parasitologySchema = z.object({
  time_collected: z.string().min(1, "This field is required"),
  time_recieved: z.string().min(1, "This field is required"),
  color: z.string(),
  consistency: z.string(),
  pus_cells: z.string(),
  rbc: z.string(),
  bacteria: z.string(),
  hookworm: z.string(),
  ascaris: z.string(),
  trichuris: z.string(),
  strongloides: z.string(),
  histolytica_cyst: z.string(),
  histolytica_trophozoite: z.string(),
  coli_cyst: z.string(),
  coli_trophozoite: z.string(),
  others: z.string(),
});

export type ParasitologyFormValues = z.infer<typeof parasitologySchema>;

export const parasitologyDefaultValues: ParasitologyFormValues = {
  time_collected: "",
  time_recieved: "",
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
};
export const urinalysisSchema = z.object({
  color: z.string(),
  transparency: z.string(),
  ph_result: z.string(),
  spec_grav_result: z.string(),
  protein: z.string(),
  nitrite: z.string(),
  glucose: z.string(),
  ketones: z.string(),
  leukocytes: z.string(),
  blood: z.string(),
  pus_cells: z.string(),
  rbc: z.string(),
  bacteria: z.string(),
  squamous_cell: z.string(),
  round_cell: z.string(),
  mucous: z.string(),
  crystals: z.string(),
  casts: z.string(),
  others: z.string(),
});

export type UrinalysisFormValues = z.infer<typeof urinalysisSchema>;

export const urinalysisDefaultValues: UrinalysisFormValues = {
  color: "",
  transparency: "",
  ph_result: "",
  spec_grav_result: "",
  protein: "",
  nitrite: "",
  glucose: "",
  ketones: "",
  leukocytes: "",
  blood: "",
  pus_cells: "",
  rbc: "",
  bacteria: "",
  squamous_cell: "",
  round_cell: "",
  mucous: "",
  crystals: "",
  casts: "",
  others: "",
};

export const serologySchema = z.object({
  test: z.string().min(1, "Test  Declaration is required"),
  method: z.string().min(1, "Method is required"),
  specimen: z.string().min(1, "Specimen is required"),
  result: z.string().min(1, "Result is required"),
  day_of_fever: z.string().optional(),
});

export type SerologyFormValues = z.infer<typeof serologySchema>;

export const serologyDefaultValues: SerologyFormValues = {
  test: "",
  method: "",
  specimen: "",
  result: "",
  day_of_fever: "",
};

export const hbA1cSchema = z.object({
  test_method: z.string().min(1, "Test Method is required"),
  lot_no: z.string(),
  exp_date: z.string(),
  specimen: z.string().min(1, "Specimen is required"),
  result: z.string().min(1, "Result is required"),
  result_interpretation: z.string(),
});

export type HbA1cFormValues = z.infer<typeof hbA1cSchema>;

export const hbA1cDefaultValues: HbA1cFormValues = {
  test_method: "",
  lot_no: "",
  exp_date: "",
  specimen: "",
  result: "",
  result_interpretation: "",
};

export const chemistrySchema = z.object({
  sodium: z.string(),
  potassium: z.string(),
  chloride: z.string(),
  ionized_calcium: z.string(),
  others: z.string(),
});

export type ChemistryFormValues = z.infer<typeof chemistrySchema>;

export const chemistryDefaultValues: ChemistryFormValues = {
  sodium: "",
  potassium: "",
  chloride: "",
  ionized_calcium: "",
  others: "",
};

export const ogttSchema = z.object({
  test_type: z.string(),
  FBS: z.string(),
  FBS_conv: z.string(),
  onehagl: z.string(),
  onehagl_conv: z.string(),
  twohagl: z.string(),
  twohagl_conv: z.string(),
  threehagl: z.string(),
  threehagl_conv: z.string(),
});

export type OgttFormValues = z.infer<typeof ogttSchema>;

export const ogttDefaultValues: OgttFormValues = {
  test_type: "OGTT",
  FBS: "",
  FBS_conv: "",
  onehagl: "",
  onehagl_conv: "",
  twohagl: "",
  twohagl_conv: "",
  threehagl: "",
  threehagl_conv: "",
};

export const generalResultSchema = z.object({
  result_summary: z.string(),
  remarks: z.string(),
});

export type GeneralResultFormValues = z.infer<typeof generalResultSchema>;

export const generalResultDefaultValues: GeneralResultFormValues = {
  result_summary: "",
  remarks: "",
};

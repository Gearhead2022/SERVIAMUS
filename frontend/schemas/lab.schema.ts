import { z } from "zod";

export const clinicalChemistrySchema = z.object({
  FBS: z.string(),
  FBS_conv: z.string(),
  RBS: z.string(),
  RBS_conv: z.string(),
  BUN: z.string(),
  BUN_conv: z.string(),
  creatinine: z.string(),
  creatinine_conv: z.string(),
  uric_acid: z.string(),
  uric_acid_conv: z.string(),
  cholesterol: z.string(),
  cholesterol_conv: z.string(),
  hdl_cholesterol: z.string(),
  hdl_cholesterol_conv: z.string(),
  ldl_cholesterol: z.string(),
  ldl_cholesterol_conv: z.string(),
  triglycerides: z.string(),
  triglycerides_conv: z.string(),
  sgpt: z.string(),
  last_meal: z.string(),
  time_taken: z.string(),
});

export type ClinicalChemistryFormValues = z.infer<typeof clinicalChemistrySchema>;

export const clinicalChemistryDefaultValues: ClinicalChemistryFormValues = {
  FBS: "",
  FBS_conv: "",
  RBS: "",
  RBS_conv: "",
  BUN: "",
  BUN_conv: "",
  creatinine: "",
  creatinine_conv: "",
  uric_acid: "",
  uric_acid_conv: "",
  cholesterol: "",
  cholesterol_conv: "",
  hdl_cholesterol: "",
  hdl_cholesterol_conv: "",
  ldl_cholesterol: "",
  ldl_cholesterol_conv: "",
  triglycerides: "",
  triglycerides_conv: "",
  sgpt: "",
  last_meal: "",
  time_taken: "",
};

export const hematologySchema = z.object({
  Hemoglobin: z.string(),
  rbc_count: z.string(),
  wbc_count: z.string(),
  platelet_count: z.string(),
  others_mcv: z.string(),
  mchc: z.string(),
  reticulocyte_count: z.string(),
  nss_1: z.string(),
  nss_2: z.string(),
  nss_3: z.string(),
  lymphocytes: z.string(),
  monocytes: z.string(),
  eosinophils: z.string(),
  basophils: z.string(),
  others1: z.string(),
  clotting_time: z.string(),
  bleeding_time: z.string(),
  abo_type: z.string(),
  rh_type: z.string(),
  others2: z.string(),
});

export type HematologyFormValues = z.infer<typeof hematologySchema>;

export const hematologyDefaultValues: HematologyFormValues = {
  Hemoglobin: "",
  rbc_count: "",
  wbc_count: "",
  platelet_count: "",
  others_mcv: "",
  mchc: "",
  reticulocyte_count: "",
  nss_1: "",
  nss_2: "",
  nss_3: "",
  lymphocytes: "",
  monocytes: "",
  eosinophils: "",
  basophils: "",
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
  result: z.string().min(1,"Result is required"),
  day_of_fever: z.string(),
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
  test_method: z.string(),
  lot_no: z.string(),
  exp_date: z.string(),
  specimen: z.string(),
  result: z.string(),
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

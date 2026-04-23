import { z } from "zod";

export const patientConsultationSchema = z.object({
  name: z.string().min(1),
  consultation_date: z.string().min(1),
  address: z.string().min(1),
  contact_number: z.string().min(1),
  birth_date: z.string().min(1),

  sex: z.enum(["male", "female"]),
  age: z.string().min(1),

  religion: z.string().optional(),

  chief_complaint: z.string().min(1),

  hist_illness: z.string().optional(),
  bp: z.string().optional(),
  temp: z.string().optional(),
  cr: z.string().optional(),
  rr: z.string().optional(),
  wt: z.string().optional(),
  ht: z.string().optional(),

  // Personal Medical History
  pmh_allergy: z.boolean().optional(),
  pmh_admission: z.boolean().optional(),
  pmh_others: z.boolean().optional(),
  pmh_others_text: z.string().optional(),

  // Family History
  fh_htn: z.boolean().optional(),
  fh_dm: z.boolean().optional(),
  fh_ba: z.boolean().optional(),
  fh_cancer: z.boolean().optional(),
  fh_others: z.boolean().optional(),
  fh_others_text: z.string().optional(),

  // OB History
  ob_score: z.string().optional(),
  ob_nvsd: z.boolean().optional(),
  ob_cs: z.boolean().optional(),

  menarche: z.string().optional(),
  interval: z.string().optional(),
  duration: z.string().optional(),
  amount: z.string().optional(),
  ob_symptoms: z.string().optional(),

  // Social History
  cigarette_use: z.boolean().optional(),
  alcohol_use: z.boolean().optional(),
  drug_use: z.boolean().optional(),
  exercise: z.boolean().optional(),
  hygiene_prac: z.boolean().optional(),
  coffee_cons: z.boolean().optional(),
  soda_cons: z.boolean().optional(),

  sh_allergy: z.boolean().optional(),
  sh_admission: z.boolean().optional(),

  travel_history: z.string().optional(),
  diet: z.string().optional(),
  stress: z.string().optional(),
  occupation: z.string().optional(),

  examination: z.string().optional(),
  assessment: z.string().optional(),
  plans: z.string().optional(),

  follow_up_date: z.string().optional(),
});

export const medicineSchema = z.object({
  presc_id: z.string(),

  medicine_name: z
    .string()
    .min(1, "Medicine name is required"),

  strength: z
    .string()
    .optional(),

  form: z
    .string()
    .min(1, "Dosage form is required"),

  dose: z
    .string()
    .min(1, "Dose is required"),

  frequency: z
    .string()
    .min(1, "Frequency is required"),

  duration: z
    .string()
    .min(1, "Duration is required"),

  route: z
    .string()
    .min(1, "Route is required"),

  instruction: z
    .string()
    .optional(),

  quantity: z
    .string()
    .optional(),
});

export const prescriptionSchema = z.object({
  patient_id: z.number(),
  cons_id: z.number(),
  doctor_id: z.number(),
  gen_notes: z.string().optional(),

  medicines: z
    .array(medicineSchema)
    .min(1, "At least one medicine is required")
    .refine(
      (meds) =>
        meds.some((m) => m.medicine_name.trim() !== ""),
      {
        message: "At least one valid medicine must be filled",
      }
    ),
});

export type PrescriptionValues = z.infer<typeof prescriptionSchema>;
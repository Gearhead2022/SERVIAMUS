import z from "zod";

export const patientConsultationSchema = z.object({
    // ─── STEP 1: PERSONAL INFO ─────────────────────────────
    name: z.string().min(1, "Full name is required"),
    consultation_date: z.string().min(1, "Consultation date is required"),
    address: z.string().min(1, "Address is required"),
    contact_number: z.string().min(1, "Contact number is required"),
    birth_date: z.string().min(1, "Birth date is required"),

    sex: z.enum(["male", "female"], {
    message: "Sex is required",
    }),
    age: z
        .string()
        .min(1, "Age is required")
        .refine((val) => !isNaN(Number(val)), {
        message: "Age must be a number",
        }),
    religion: z.string().optional(),
    chief_complaint: z.string().min(1, "Chief complaint is required"),

    // ─── STEP 2: VITALS & HISTORY ─────────────────────────
    history_present_illness: z.string().optional(),

    // Previous Vitals
    prev_bp: z.string().optional(),
    prev_temp: z.string().optional(),
    prev_pulse: z.string().optional(),
    prev_rr: z.string().optional(),
    prev_weight: z.string().optional(),
    prev_height: z.string().optional(),

    // Current Vitals
    curr_bp: z.string().optional(),
    curr_temp: z.string().optional(),
    curr_pulse: z.string().optional(),
    curr_rr: z.string().optional(),
    curr_weight: z.string().optional(),
    curr_height: z.string().optional(),

    // ─── STEP 3: MEDICAL HISTORY ──────────────────────────

    // Past Medical History
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

    // OB-Gyne
    ob_score: z.string().optional(), // G P
    ob_nvsd: z.boolean().optional(),
    ob_cs: z.boolean().optional(),

    menarche: z.string().optional(),
    interval: z.string().optional(),
    duration: z.string().optional(),
    amount: z.string().optional(),
    ob_symptoms: z.string().optional(),

    //Personal History
    cigarette_use: z.boolean().optional(),
    alcohol_use: z.boolean().optional(),
    drug_use: z.boolean().optional(),
    exercise: z.boolean().optional(),
    hygiene_prac: z.boolean().optional(),
    coffee_cons: z.boolean().optional(),
    soda_cons: z.boolean().optional(),

    // Social History
    sh_allergy: z.boolean().optional(),
    sh_admission: z.boolean().optional(),

    travelHistory: z.string().optional(),
    diet: z.string().optional(),
    stress: z.string().optional(),
    occupation: z.string().optional(),
});
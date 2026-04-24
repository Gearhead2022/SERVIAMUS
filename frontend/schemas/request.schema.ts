import z from "zod";

export const requestSchema = z.discriminatedUnion("req_type", [
  z.object({
    req_type: z.literal("CONSULTATION"),
    patient_id: z.number(),
    name: z.string().min(1, "Full name is required"),
    patient_code: z.string(),
    req_date: z.string().min(1, "Consultation date is required"),

    // vitals
    prev_bp: z.string().optional(),
    prev_temp: z.string().optional(),
    prev_cr: z.string().optional(),
    prev_rr: z.string().optional(),
    prev_wt: z.string().optional(),
    prev_ht: z.string().optional(),

    bp: z.string().optional(),
    temp: z.string().optional(),
    cr: z.string().optional(),
    rr: z.string().optional(),
    wt: z.string().optional(),
    ht: z.string().optional(),
    created_at: z.string().optional(),
  }),

  z.object({
    req_type: z.literal("LABORATORY"),
    patient_id: z.number(),
    patient_code: z.string(),
    name: z.string().min(1, "Full name is required"),
    req_date: z.string().min(1, "Consultation date is required"),
    req_by: z.string().min(1, "Requested by is required"),

    test: z.array(z.string()).min(1, "At least one test is required")
  }),
]);
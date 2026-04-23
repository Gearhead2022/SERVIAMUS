import { z } from "zod";

export const patientSchema = z.object({
    patient_code: z.string(),
    name: z.string().min(1, "Full name is required"),
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
    philhealth_id: z
    .string()
    .regex(/^\d{2}-\d{6}-\d{1}$/, "PhilHealth ID must be in format: XX-XXXXXXXX-X")
    .optional()
    .or(z.literal("")),
})



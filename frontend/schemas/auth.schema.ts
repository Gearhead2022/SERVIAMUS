import { z } from "zod";

/* =====================
   LOGIN
===================== */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(5, "Password must be at least 6 characters")
});

/* =====================
   REGISTER
===================== */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(5, "Password must be at least 6 characters"),
  confirm_password: z
    .string(),
  role_id: z
    .number()
    .int()
    .positive("Please select a role"),
  license_no: z.string().optional(),
  title: z.string().optional(), 
  ptr_no: z.string().optional(),
}).refine(
  data => data.password === data.confirm_password,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  }
);

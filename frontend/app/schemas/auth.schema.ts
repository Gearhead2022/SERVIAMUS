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
  confirmPassword: z
    .string(),
  role_id: z
    .number()
    .int()
    .positive("Please select a role")
}).refine(
  data => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  }
);

import { z } from "zod";

// export const createServiceSchema = z.object({
//     reference_id: z.number(),
//     service_name: z.string().min(1),
//     price: z.number().min(0),
//     date: z.string().optional(),
// });

// export const updateServicePriceSchema = z.object({
//     price: z.number().min(0),
// });

// export type CreateServicePayload = z.infer<typeof createServiceSchema>;
// export type UpdateServicePricePayload = z.infer<typeof updateServicePriceSchema>;

export const updateServiceSchema = z.object({
    reference_id: z.number(),
    service_name: z.string().min(1, "Service name is required"),
    price: z.number().min(0, "Price cannot be negative"),
    date: z.string().optional(),
});

export type UpdateServicePayload = z.infer<
    typeof updateServiceSchema
>;
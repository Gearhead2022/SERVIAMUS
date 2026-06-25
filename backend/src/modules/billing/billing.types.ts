export type BillingFilter = "ALL" | "PENDING" | "DONE";

export interface UpdateBillingDiscountPayload {
    billing_id: number;
    discount: number;
    discount_reason?: string | null;
}
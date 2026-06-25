export interface UpdateServicePayload {
    service_name: string;
    price: number;
    is_active: boolean;
    date?: string;
}
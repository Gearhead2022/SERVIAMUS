export type CreateNotificationParams = {
    userIds: number | number[]; // support multiple users
    type: "NEW_REQUEST" | "APPROVED" | "REJECTED" | "SYSTEM";
    title: string;
    message: string;
    entity?: string;
    entity_id?: number;
};

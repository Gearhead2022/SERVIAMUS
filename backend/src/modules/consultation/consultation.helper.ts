import { RequestStatus, QueueStatus } from "@prisma/client";

export function mapRequestToQueueStatus(
    status: RequestStatus
): QueueStatus | null {
    switch (status) {
        case "SERVING":
            return "SERVING";
        case "CANCELED":
            return "SKIPPED";
        case "DONE":
            return "COMPLETED";
        default:
            return null;
    }
};


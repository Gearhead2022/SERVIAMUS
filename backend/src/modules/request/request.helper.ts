import { prisma } from "../../config/prismaClient";

const resolveNotificationUsers = async (request: any): Promise<number | number[]> => {
    const type = request.result.req_type;

    switch (type) {
        case "CONSULTATION":
        case "CERTIFICATE":
            if (!request.consult?.physician) {
                throw new Error("No physician assigned");
            }
            return request.consult.physician;

        default:
            const users = await prisma.users.findMany({
                where: {
                    roles: {
                        some: {
                            role: { role_name: "LAB" },
                        },
                    },
                },
                select: { user_id: true },
            });

            return users.map(u => u.user_id);
    }
};

type WorkflowStatus =
    | "REQUESTED"
    | "CONSULTATION"
    | "LABORATORY"
    | "CERTIFICATION"
    | "PAYMENT"
    | "DONE"
    | "CANCELED";

export function getWorkflowStatus(request: any): WorkflowStatus {
    if (request.status === "CANCELED") {
        return "CANCELED";
    }

    if (request.status === "DONE") {
        return "DONE";
    }

    switch (request.req_type) {
        case "LABORATORY":
            // Billing hasn't been created yet
            if (!request.billing) {
                return "REQUESTED";
            }

            // Waiting for payment
            if (request.billing.status === "PENDING") {
                return "PAYMENT";
            }

            // Paid, now in laboratory
            return "LABORATORY";

        case "CONSULTATION":
            // Consultation hasn't happened yet
            if (!request.consultation) {
                return "REQUESTED";
            }

            // Consultation done, waiting payment
            if (!request.billing) {
                return "CONSULTATION";
            }

            if (request.billing.status === "PENDING") {
                return "PAYMENT";
            }

            return "DONE";

        case "CERTIFICATE":
            if (!request.certificate) {
                return "REQUESTED";
            }

            if (!request.billing) {
                return "CERTIFICATION";
            }

            if (request.billing.status === "PENDING") {
                return "PAYMENT";
            }

            return "DONE";

        default:
            return "REQUESTED";
    }
}
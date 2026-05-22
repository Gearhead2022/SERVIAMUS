import { RequestStatus, QueueStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

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

export const buildBillingCode = (requestId: number) =>
    `BILL-${requestId.toString().padStart(6, "0")}`;

export const toDecimal = (value: number) => new Prisma.Decimal(value.toFixed(2));

export const ensureBillingForRequest = async (
    tx: Prisma.TransactionClient,
    reqId: number,
    requestDate: Date,
    req_type: string,
) => {

    let service;

    if (req_type === "CONSULTATION") {

        service = await tx.services.findFirst({
            where: {
                service_name: "Consultation",
            },

            select: {
                price: true,
            },
        });

    } else {

        service = await tx.services.findFirst({
            where: {
                service_name: "Medical Certificate",
            },

            select: {
                price: true,
            },
        });
    }

    if (!service) {
        throw new Error(
            "Service price not found."
        );
    }

    const totalPrice = service.price;

    const billingCode =
        buildBillingCode(reqId);

    const existingBilling =
        await tx.billing.findUnique({
            where: {
                req_id: reqId,
            },

            select: {
                billing_id: true,
                status: true,
            },
        });

    if (existingBilling) {

        return tx.billing.update({
            where: {
                billing_id:
                    existingBilling.billing_id,
            },

            data: {
                billing_code:
                    billingCode,

                total_price:
                    totalPrice,

                date:
                    requestDate,

                discount:
                    toDecimal(0),
            },
        });
    }

    return tx.billing.create({
        data: {
            billing_code:
                billingCode,

            req_id: reqId,

            total_price:
                totalPrice,

            date:
                requestDate,

            discount:
                toDecimal(0),

            status: "PENDING",
        },
    });
};
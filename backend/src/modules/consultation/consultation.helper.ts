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

export const ensureLabBillingForRequest = async (
    tx: Prisma.TransactionClient,
    reqId: number,
    requestDate: Date
) => {
    const totalPrice = toDecimal(100);
    const billingCode = buildBillingCode(reqId);

    const existingBilling = await tx.billing.findUnique({
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
                billing_id: existingBilling.billing_id,
            },
            data: {
                billing_code: billingCode,
                total_price: totalPrice,
                date: requestDate,
                discount: toDecimal(0),
            },
        });
    }

    return tx.billing.create({
        data: {
            billing_code: billingCode,
            req_id: reqId,
            total_price: totalPrice,
            date: requestDate,
            discount: toDecimal(0),
            status: "PENDING",
        },
    });
};
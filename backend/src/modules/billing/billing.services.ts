import { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { toApiBillingStatus } from "./billing.helpers";

const billingInclude = Prisma.validator<Prisma.BillingInclude>()({
  request: {
    select: {
      req_id: true,
      req_date: true,
      req_type: true,
      patient: {
        select: {
          patient_id: true,
          patient_code: true,
          name: true,
        },
      },
      laboratory: {
        select: {
          req_by: true,
          items: {
            select: {
              item_id: true,
              test: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: [{ item_id: "asc" }],
          },
        },
      },
    },
  },
  payments: {
    select: {
      payment_id: true,
      amount: true,
      method: true,
      payment_date: true,
    },
    orderBy: [{ payment_date: "desc" }],
  },
});

type BillingRecord = Prisma.BillingGetPayload<{
  include: typeof billingInclude;
}>;

const toDisplayBilling = (record: BillingRecord) => {
  const latestPayment = record.payments[0] ?? null;

  return {
    billingId: record.billing_id,
    billingCode: record.billing_code,
    requestId: record.request.req_id,
    patientId: record.request.patient.patient_id,
    patientCode:
      record.request.patient.patient_code ??
      `PT-${record.request.patient.patient_id.toString().padStart(4, "0")}`,
    patientName: record.request.patient.name,
    requestedBy: record.request.laboratory?.req_by ?? null,
    requestedDate: record.request.req_date.toISOString(),
    tests: record.request.laboratory?.items.map((item) => item.test.name) ?? [],
    totalPrice: Number(record.total_price),
    discount: Number(record.discount),
    status: toApiBillingStatus(record.status),
    isPaid: record.status === "DONE",
    paymentMethod: latestPayment?.method ?? null,
    paidAt: latestPayment?.payment_date?.toISOString() ?? null,
  };
};

const getBillingById = async (
  tx: Prisma.TransactionClient,
  billingId: number
) => {
  const billing = await tx.billing.findUnique({
    where: {
      billing_id: billingId,
    },
    include: billingInclude,
  });

  if (!billing) {
    throw new Error("Billing record not found.");
  }

  return toDisplayBilling(billing);
};

export const getBillingsService = async (status?: string) => {
  const normalizedStatus = status?.trim().toLowerCase();

  const billings = await prisma.billing.findMany({
    where: {
      request: {
        req_type: "LABORATORY",
      },
      ...(normalizedStatus === "paid"
        ? { status: "DONE" }
        : normalizedStatus === "unpaid"
          ? { status: "PENDING" }
          : {}),
    },
    include: billingInclude,
    orderBy: [{ date: "desc" }, { billing_id: "desc" }],
  });

  return billings.map(toDisplayBilling);
};

export const payBillingService = async (
  billingId: number,
  method: PaymentMethod = "CASH"
) => {
  return prisma.$transaction(async (tx) => {
    const billing = await tx.billing.findUnique({
      where: {
        billing_id: billingId,
      },
      select: {
        billing_id: true,
        total_price: true,
        status: true,
      },
    });

    if (!billing) {
      throw new Error("Billing record not found.");
    }

    if (billing.status !== "DONE") {
      await tx.billing.update({
        where: {
          billing_id: billing.billing_id,
        },
        data: {
          status: "DONE",
        },
      });

      await tx.payment.create({
        data: {
          billing_id: billing.billing_id,
          amount: billing.total_price,
          method,
        },
      });
    }

    return getBillingById(tx, billingId);
  });
};

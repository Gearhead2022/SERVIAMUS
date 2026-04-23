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
// backend/src/modules/billing/billing.services.ts

import { prisma } from "../../config/prismaClient";
import { Prisma } from "@prisma/client";

export const getAllBillings = async () => {
  return prisma.billing.findMany({
    include: {
      services: {
        include: {
          service: true,
        },
      },
      request: {
        include: {
          patient: true,
          laboratory: true,
          consult: true,
        },
      },
      payments: true,
    },
    orderBy: { created_at: "desc" },
  });
};

export const createBilling = async (req_id: number, serviceIds: number[]) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const request = await tx.request.findUnique({
      where: { req_id },
    });

    if (!request) {
      throw new Error("Request not found");
    }

    const existingBilling = await tx.billing.findUnique({
      where: { req_id },
    });

    if (existingBilling) {
      throw new Error("Billing already exists for this request");
    }

    const services = await tx.services.findMany({
      where: {
        service_id: { in: serviceIds },
        is_active: true,
      },
    });

    if (services.length === 0) {
      throw new Error("No valid services found");
    }

    const totalPrice = services.reduce((sum: number, svc: any) => sum + Number(svc.price), 0);

    const billingCount = await tx.billing.count();
    const billingCode = `BILL${new Date().getFullYear()}${String(billingCount + 1).padStart(5, "0")}`;

    const billing = await tx.billing.create({
      data: {
        billing_code: billingCode,
        req_id,
        total_price: totalPrice,
        discount: 0,
        date: new Date(),
        status: "PENDING",
      },
    });

    await Promise.all(
      services.map((svc: any) =>
        tx.billingService.create({
          data: {
            billing_id: billing.billing_id,
            service_id: svc.service_id,
            price: svc.price,
          },
        })
      )
    );

    const completeBilling = await tx.billing.findUnique({
      where: { billing_id: billing.billing_id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        request: {
          include: {
            patient: true,
          },
        },
      },
    });

    return completeBilling;
  });
};

export const getBillingByRequestId = async (req_id: number) => {
  const billing = await prisma.billing.findUnique({
    where: { req_id },
    include: {
      services: {
        include: {
          service: true,
        },
      },
      request: {
        include: {
          patient: true,
          laboratory: true,
          consult: true,
        },
      },
      payments: true,
    },
  });

  if (!billing) {
    throw new Error("Billing not found");
  }

  return billing;
};

export const getBillingById = async (billing_id: number) => {
  const billing = await prisma.billing.findUnique({
    where: { billing_id },
    include: {
      services: {
        include: {
          service: true,
        },
      },
      request: {
        include: {
          patient: true,
          laboratory: true,
          consult: true,
        },
      },
      payments: true,
    },
  });

  if (!billing) {
    throw new Error("Billing not found");
  }

  return billing;
};

export const createPayment = async (
  billing_id: number,
  amount: number,
  method: "CASH" | "GCASH" | "CARD" | "BANK_TRANSFER",
  reference_no?: string
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const billing = await tx.billing.findUnique({
      where: { billing_id },
    });

    if (!billing) {
      throw new Error("Billing not found");
    }

    const totalDue = Number(billing.total_price) - Number(billing.discount);

    if (amount < totalDue) {
      throw new Error(`Insufficient payment. Amount due: ₱${totalDue.toFixed(2)}`);
    }

    const payment = await tx.payment.create({
      data: {
        billing_id,
        amount,
        method,
        reference_no,
      },
    });

    const updatedBilling = await tx.billing.update({
      where: { billing_id },
      data: { status: "DONE" },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        request: {
          include: {
            patient: true,
          },
        },
      },
    });

    return { payment, billing: updatedBilling };
  });
};

export const updateBillingStatus = async (
  billing_id: number,
  status: "PENDING" | "DONE"
) => {
  return prisma.billing.update({
    where: { billing_id },
    data: { status },
    include: {
      services: {
        include: {
          service: true,
        },
      },
      request: {
        include: {
          patient: true,
        },
      },
    },
  });
};

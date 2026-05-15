// backend/src/modules/billing/billing.services.ts

import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { getLabTestPrice } from "./billing.helpers";

const billingPatientSelect = {
  patient_id: true,
  patient_code: true,
  name: true,
  address: true,
  contact_number: true,
  birth_date: true,
  religion: true,
  sex: true,
  age: true,
} as const;

const billingInclude = {
  services: {
    include: {
      service: true,
    },
  },
  request: {
    select: {
      req_id: true,
      req_type: true,
      req_date: true,
      patient: {
        select: billingPatientSelect,
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
            orderBy: [{ item_id: "asc" as const }],
          },
        },
      },
    },
  },
  payments: {
    orderBy: [{ payment_date: "desc" as const }],
  },
} satisfies Prisma.BillingInclude;

type BillingRecord = Prisma.BillingGetPayload<{
  include: {
    services: {
      include: {
        service: true;
      };
    };
    request: {
      select: {
        req_id: true;
        req_type: true;
        req_date: true;
        patient: {
          select: typeof billingPatientSelect;
        };
        laboratory: {
          select: {
            req_by: true;
            items: {
              select: {
                item_id: true;
                test: {
                  select: {
                    name: true;
                  };
                };
              };
            };
          };
        };
      };
    };
    payments: true;
  };
}>;

const buildBillingBreakdown = (billing: BillingRecord) => {
  if (billing.services.length > 0) {
    return billing.services.map((serviceLine) => {
      const linePrice = Number(serviceLine.price ?? serviceLine.service.price ?? 0);

      return {
        line_id: `service-${serviceLine.service_list_id}`,
        label: serviceLine.service.service_code,
        quantity: 1,
        unit_price: linePrice,
        total_price: linePrice,
        source: "service" as const,
      };
    });
  }

  const labItems = billing.request.laboratory?.items ?? [];

  return labItems.map((item) => {
    const unitPrice = getLabTestPrice(item.test.name);

    return {
      line_id: `lab-${item.item_id}`,
      label: item.test.name,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
      source: "lab-test" as const,
    };
  });
};

const serializeBilling = (billing: BillingRecord) => ({
  ...billing,
  requested_by: billing.request.laboratory?.req_by ?? null,
  breakdown: buildBillingBreakdown(billing),
});

export const getAllBillings = async () => {
  const billings = await prisma.billing.findMany({
    include: billingInclude,
    orderBy: { created_at: "desc" },
  });

  return billings.map(serializeBilling);
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
      include: billingInclude,
    });

    if (!completeBilling) {
      throw new Error("Billing was created but could not be reloaded.");
    }

    return completeBilling;
  });
};

export const getBillingByRequestId = async (req_id: number) => {
  const billing = await prisma.billing.findUnique({
    where: { req_id },
    include: billingInclude,
  });

  if (!billing) {
    throw new Error("Billing not found");
  }

  return serializeBilling(billing);
};

export const getBillingById = async (billing_id: number) => {
  const billing = await prisma.billing.findUnique({
    where: { billing_id },
    include: billingInclude,
  });

  if (!billing) {
    throw new Error("Billing not found");
  }

  return serializeBilling(billing);
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
      throw new Error(`Insufficient payment. Amount due: â‚±${totalDue.toFixed(2)}`);
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
      include: billingInclude,
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
    include: billingInclude,
  });
};

export const payBilling = async (billing_id: number) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const billing = await tx.billing.findUnique({
      where: { billing_id },
    });

    if (!billing) {
      throw new Error("Billing not found");
    }

    return tx.billing.update({
      where: { billing_id },
      data: { status: "DONE" },
      include: billingInclude,
    });
  });
};

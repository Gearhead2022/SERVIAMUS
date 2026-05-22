// backend/src/modules/billing/billing.services.ts

import { PaymentMethod, Prisma, RequestType } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { getLabTestPrice } from "./billing.helpers";
import { BillingFilter } from "./billing.types";
import { BillStatus } from "@prisma/client";

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

const buildBillingBreakdown = async (
  billing: BillingRecord
) => {

  // LABORATORY
  if (billing.request.req_type === "LABORATORY") {

    const items =
      billing.request.laboratory?.items ?? [];

    if (items.length === 0) {
      return [];
    }

    // GET ALL TEST IDS
    const testIds = items.map(
      (item) => item.item_id
    );

    // GET SERVICES MATCHING TEST IDS
    const services = await prisma.services.findMany({
      where: {
        reference_id: {
          in: testIds,
        },
      },
    });

    return items.map((serviceLine) => {

      // MATCH SERVICE USING reference_id === test_id
      const matchedService = services.find(
        (service) =>
          service.reference_id === serviceLine.item_id
      );

      const linePrice = Number(
        matchedService?.price ?? 0
      );

      return {
        line_id: `service-${serviceLine.item_id}`,

        label:
          matchedService?.service_name ??
          matchedService?.service_id ??
          serviceLine.test?.name ??
          "Laboratory Test",

        quantity: 1,

        unit_price: linePrice,

        total_price: linePrice,

        source: "service" as const,
      };
    });
  }

  // CONSULTATION
  if (billing.request.req_type === "CONSULTATION") {

    const consultationService =
      await prisma.services.findFirst({
        where: {
          service_name: {
            equals: "Consultation",
          },
        },
      });

    if (!consultationService) {
      return [];
    }

    const linePrice = Number(
      consultationService.price ?? 0
    );

    return [
      {
        line_id: `service-${consultationService.service_id}`,

        label:
          consultationService.service_name ??
          consultationService.service_id,

        quantity: 1,

        unit_price: linePrice,

        total_price: linePrice,

        source: "service" as const,
      },
    ];
  }

  // CERTIFICATE
  if (billing.request.req_type === "CERTIFICATE") {

    const certificateService =
      await prisma.services.findFirst({
        where: {
          service_name: {
            equals: "Medical Certificate",
          },
        },
      });

    if (!certificateService) {
      return [];
    }

    const linePrice = Number(
      certificateService.price ?? 0
    );

    return [
      {
        line_id: `service-${certificateService.service_id}`,

        label:
          certificateService.service_name ??
          certificateService.service_id,

        quantity: 1,

        unit_price: linePrice,

        total_price: linePrice,

        source: "service" as const,
      },
    ];
  }

  return [];
};

const serializeBilling = async (billing: BillingRecord) => {
  const breakdown = await buildBillingBreakdown(billing);

  return {
    ...billing,
    requested_by: billing.request.laboratory?.req_by ?? null,
    breakdown,
  };
};

export const getAllBillings = async (
  search?: string,
  status?: BillingFilter
) => {
  const where: Prisma.BillingWhereInput = {};

  if (search) {
    where.OR = [
      {
        billing_code: {
          contains: search,
        },
      },
      {
        request: {
          patient: {
            name: {
              contains: search,
            },
          },
        },
      },
      {
        request: {
          patient: {
            patient_code: {
              contains: search,
            },
          },
        },
      },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status as BillStatus;
  }

  const billings = await prisma.billing.findMany({
    where,
    include: billingInclude,
    orderBy: { date: "desc" },
  });

  return await Promise.all(
    billings.map(serializeBilling)
  );
};



export const getBillingByRequestId = async (req_id: number) => {
  // const billing = await prisma.billing.findUnique({
  //   where: { req_id },
  //   include: billingInclude,
  // });

  // if (!billing) {
  //   throw new Error("Billing not found");
  // }

  // return serializeBilling(billing);
};

export const getBillingById = async (billing_id: number) => {
  // const billing = await prisma.billing.findUnique({
  //   where: { billing_id },
  //   include: billingInclude,
  // });

  // if (!billing) {
  //   throw new Error("Billing not found");
  // }

  // return serializeBilling(billing);
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


export const getAllPayment = async (
  search?: string,
  status?: string,
  method?: string,
  type?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {

  const where: Prisma.PaymentWhereInput = {};

  // SEARCH
  if (search) {
    where.OR = [
      {
        billing: {
          is: {
            request: {
              patient: {
                name: {
                  contains: search,
                },
              },
            },
          },
        },
      },
      {
        billing: {
          is: {
            request: {
              patient: {
                patient_code: {
                  contains: search,
                },
              },
            },
          },
        },
      },
      {
        billing: {
          is: {
            billing_code: {
              contains: search,
            },
          },
        },
      },
    ];
  }

  // PAYMENT METHOD
  if (method && method !== "ALL") {
    where.method = method as PaymentMethod;
  }

  // BILLING FILTERS
  const billingWhere: Prisma.BillingWhereInput = {};

  if (status && status !== "ALL") {
    billingWhere.status = status as BillStatus;
  }

  if (type && type !== "ALL") {
    billingWhere.request = {
      req_type: type as RequestType,
    };
  }

  if (Object.keys(billingWhere).length > 0) {
    where.billing = {
      is: billingWhere,
    };
  }

  // DATE RANGE
  if (dateFrom || dateTo) {
    where.payment_date = {};

    if (dateFrom) {
      where.payment_date.gte = new Date(dateFrom);
    }

    if (dateTo) {
      where.payment_date.lte = new Date(
        `${dateTo}T23:59:59`
      );
    }
  }

  // SORTING
  let orderBy: Prisma.PaymentOrderByWithRelationInput = {
    payment_date: "desc",
  };

  switch (sort) {
    case "date_asc":
      orderBy = { payment_date: "asc" };
      break;

    case "date_desc":
      orderBy = { payment_date: "desc" };
      break;

    case "amount_asc":
      orderBy = { amount: "asc" };
      break;

    case "amount_desc":
      orderBy = { amount: "desc" };
      break;
  }



  const payments = await prisma.payment.findMany({
    where,
    include: {
      billing: {
        include: billingInclude,
      },
    },
    orderBy,
  });

  return await Promise.all(
    payments.map(async (payment) => ({
      ...payment,
      billing: await serializeBilling(payment.billing),
    }))
  );
};

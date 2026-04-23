import { BillStatus, PaymentMethod, Prisma } from "@prisma/client";

const DEFAULT_LAB_PRICE = 350;

const LAB_TEST_PRICING_RULES: Array<{
  pattern: RegExp;
  price: number;
}> = [
  {
    pattern: /(cbc|blood count|hematology|blood typing)/i,
    price: 250,
  },
  {
    pattern: /urinalysis/i,
    price: 180,
  },
  {
    pattern: /(fecalysis|fecal|stool|parasit)/i,
    price: 180,
  },
  {
    pattern: /blood chemistry/i,
    price: 550,
  },
  {
    pattern: /(dengue|ns1|igg|igm|widal|serology)/i,
    price: 420,
  },
  {
    pattern: /(hba1c|hb a1c|glycated)/i,
    price: 650,
  },
  {
    pattern: /(ogtt|glucose load)/i,
    price: 700,
  },
  {
    pattern: /(sodium|potassium|chloride|ionized calcium)/i,
    price: 480,
  },
];

const toDecimal = (value: number) => new Prisma.Decimal(value.toFixed(2));

const buildBillingCode = (requestId: number) =>
  `BILL-${requestId.toString().padStart(6, "0")}`;

export const toApiBillingStatus = (status?: BillStatus | null) =>
  status === "DONE" ? "paid" : "unpaid";

export const getLabTestPrice = (testName: string) => {
  const normalizedName = testName.trim();

  for (const rule of LAB_TEST_PRICING_RULES) {
    if (rule.pattern.test(normalizedName)) {
      return rule.price;
    }
  }

  return DEFAULT_LAB_PRICE;
};

export const calculateLabBillingTotal = (tests: string[]) =>
  tests.reduce((total, testName) => total + getLabTestPrice(testName), 0);

export const ensureLabBillingForRequest = async (
  tx: Prisma.TransactionClient,
  input: {
    reqId: number;
    requestDate: Date;
    tests: string[];
  }
) => {
  const totalPrice = toDecimal(calculateLabBillingTotal(input.tests));
  const billingCode = buildBillingCode(input.reqId);

  const existingBilling = await tx.billing.findUnique({
    where: {
      req_id: input.reqId,
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
        date: input.requestDate,
        discount: toDecimal(0),
      },
    });
  }

  return tx.billing.create({
    data: {
      billing_code: billingCode,
      req_id: input.reqId,
      total_price: totalPrice,
      date: input.requestDate,
      discount: toDecimal(0),
      status: "PENDING",
    },
  });
};

export const syncBillingStatusByRequestId = async (
  tx: Prisma.TransactionClient,
  input: {
    reqId: number;
    status: BillStatus;
    method?: PaymentMethod;
  }
) => {
  const billing = await tx.billing.findUnique({
    where: {
      req_id: input.reqId,
    },
    select: {
      billing_id: true,
      total_price: true,
      status: true,
    },
  });

  if (!billing) {
    throw new Error(`Billing record not found for request ${input.reqId}.`);
  }

  if (input.status === "DONE") {
    await tx.billing.update({
      where: {
        billing_id: billing.billing_id,
      },
      data: {
        status: "DONE",
      },
    });

    await tx.payment.deleteMany({
      where: {
        billing_id: billing.billing_id,
      },
    });

    await tx.payment.create({
      data: {
        billing_id: billing.billing_id,
        amount: billing.total_price,
        method: input.method ?? "CASH",
      },
    });

    return;
  }

  await tx.payment.deleteMany({
    where: {
      billing_id: billing.billing_id,
    },
  });

  await tx.billing.update({
    where: {
      billing_id: billing.billing_id,
    },
    data: {
      status: "PENDING",
    },
  });
};

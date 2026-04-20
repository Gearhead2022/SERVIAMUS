import { Prisma } from "@prisma/client";
import { ensureLabBillingForRequest } from "../billing/billing.helpers";
import { categorizeLabTest, splitLabTests, toSchemaKey } from "./lab.utils";

type CreateLaboratoryRequestWithItemsInput = {
  reqId: number;
  requestedBy: string;
  tests: string[];
};

const findOrCreateLaboratoryTest = async (
  tx: Prisma.TransactionClient,
  testName: string
) => {
  const resolvedSchemaKey = toSchemaKey(testName);
  const resolvedCategory = categorizeLabTest(testName, resolvedSchemaKey);

  const existingTest = await tx.laboratoryTest.findFirst({
    where: {
      name: testName,
    },
    select: {
      test_id: true,
      name: true,
      category: true,
      schema_key: true,
    },
  });

  if (existingTest) {
    const shouldSyncMetadata =
      !existingTest.schema_key || existingTest.category === "OTHER";

    if (shouldSyncMetadata) {
      await tx.laboratoryTest.update({
        where: {
          test_id: existingTest.test_id,
        },
        data: {
          category: resolvedCategory,
          schema_key: resolvedSchemaKey,
        },
      });
    }

    return existingTest;
  }

  return tx.laboratoryTest.create({
    data: {
      name: testName,
      category: resolvedCategory,
      schema_key: resolvedSchemaKey,
    },
    select: {
      test_id: true,
      name: true,
    },
  });
};

export const createLaboratoryRequestWithItems = async (
  tx: Prisma.TransactionClient,
  { reqId, requestedBy, tests }: CreateLaboratoryRequestWithItemsInput
) => {
  const normalizedTests = splitLabTests(tests.join(", "));

  if (!normalizedTests.length) {
    throw new Error("At least one laboratory test is required.");
  }

  const request = await tx.request.findUnique({
    where: {
      req_id: reqId,
    },
    select: {
      req_id: true,
      req_date: true,
    },
  });

  if (!request) {
    throw new Error("Parent request not found.");
  }

  const laboratoryRequest = await tx.laboratoryRequest.create({
    data: {
      req_id: reqId,
      req_by: requestedBy,
    },
  });

  const resolvedTests = [];

  for (const testName of normalizedTests) {
    const test = await findOrCreateLaboratoryTest(tx, testName);
    resolvedTests.push(test);
  }

  await tx.laboratoryRequestItem.createMany({
    data: resolvedTests.map((test) => ({
      laboratory_request_id: laboratoryRequest.id,
      test_id: test.test_id,
    })),
  });

  await ensureLabBillingForRequest(tx, {
    reqId: request.req_id,
    requestDate: request.req_date,
    tests: normalizedTests,
  });

  return laboratoryRequest;
};

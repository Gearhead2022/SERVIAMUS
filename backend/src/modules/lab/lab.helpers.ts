import { Prisma } from "@prisma/client";
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
    const nextCategory = categorizeLabTest(testName);
    const nextSchemaKey = toSchemaKey(testName);

    if (
      existingTest.category !== nextCategory ||
      existingTest.schema_key !== nextSchemaKey
    ) {
      await tx.laboratoryTest.update({
        where: {
          test_id: existingTest.test_id,
        },
        data: {
          category: nextCategory,
          schema_key: nextSchemaKey,
        },
      });
    }

    return existingTest;
  }

  return tx.laboratoryTest.create({
    data: {
      name: testName,
      category: categorizeLabTest(testName),
      schema_key: toSchemaKey(testName),
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

  return laboratoryRequest;
};

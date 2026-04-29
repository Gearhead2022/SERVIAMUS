import { Prisma } from "@prisma/client";
import { ensureLabBillingForRequest } from "../billing/billing.helpers";
import { splitLabTests, toSchemaKey } from "./lab.utils";

type CreateLaboratoryRequestWithItemsInput = {
  reqId: number;
  requestedBy: string;
  tests: string[];
};

const resolveLaboratoryTest = async (
  tx: Prisma.TransactionClient,
  testName: string
) => {
  const resolvedSchemaKey = toSchemaKey(testName);

  const testByName = await tx.laboratoryTest.findFirst({
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

  if (testByName) {
    return testByName;
  }

  const testBySchemaKey = await tx.laboratoryTest.findFirst({
    where: {
      schema_key: resolvedSchemaKey,
    },
    select: {
      test_id: true,
      name: true,
      category: true,
      schema_key: true,
    },
    orderBy: [{ test_id: "asc" }],
  });

  if (testBySchemaKey) {
    return testBySchemaKey;
  }

  // The laboratory_tests table is a static catalog; request creation should only link to existing rows.
  throw new Error(`Laboratory test "${testName}" is not configured in the test catalog.`);
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
    const test = await resolveLaboratoryTest(tx, testName);
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

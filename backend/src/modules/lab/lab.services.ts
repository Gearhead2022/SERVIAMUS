import { LaboratoryCategory, Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { LabModuleError } from "./lab.errors";
import { CreateLabRequestInput, SaveLabResultInput } from "./lab.types";
import { createLaboratoryRequestWithItems } from "./lab.helpers";
import { upsertStructuredLabResult } from "./lab.result-writers";
import {
  normalizeLabForm,
  requestStatusFromItemStatuses,
  resolveApiLabCategory,
  resolveCombinedLabResultFamily,
  resolveLabRecordGroup,
  serializeLabResultPayload,
  splitLabTests,
  toApiLabStatus,
  toDbLabStatus,
  toSchemaKey,
} from "./lab.utils";

type LabCatalogItem = {
  test_id: number;
  name: string;
  category: LaboratoryCategory;
  schema_key: string | null;
};

type RawPatientRow = {
  patient_id: number;
  name: string;
  age: number | null;
  sex: string;
  address: string;
  contact_number: string | null;
};

type RawPatientRecordRow = RawPatientRow & {
  patient_code: string | null;
  birth_date: string | null;
  religion: string | null;
  created_at: Date;
  lab_requests_count: number;
  medical_records_count: number;
  history_count: number;
  vital_signs_count: number;
};

type PatientLabRecordsFilters = {
  dateFrom?: string;
  dateTo?: string;
  recordGroup?: string;
};

const labRequestInclude = Prisma.validator<Prisma.LaboratoryRequestInclude>()({
  request: {
    select: {
      req_id: true,
      patient_id: true,
      req_date: true,
      status: true,
      billing: {
        select: {
          billing_id: true,
          billing_code: true,
          total_price: true,
          status: true,
          payments: {
            select: {
              payment_date: true,
            },
            orderBy: [{ payment_date: "desc" }],
            take: 1,
          },
        },
      },
      patient: {
        select: {
          patient_id: true,
          patient_code: true,
          name: true,
          age: true,
          sex: true,
          address: true,
        },
      },
    },
  },
  items: {
    select: {
      item_id: true,
      status: true,
      result_payload: true,
      test: {
        select: {
          test_id: true,
          name: true,
          category: true,
          schema_key: true,
        },
      },
      processor: {
        select: {
          user_id: true,
          name: true,
        },
      },
    },
    orderBy: [{ item_id: "asc" }],
  },
});

type LabRequestRecord = Prisma.LaboratoryRequestGetPayload<{
  include: typeof labRequestInclude;
}>;

const normalizeRequestedBy = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const parseRequestedDate = (value?: string) => {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new LabModuleError("Requested date is invalid.", 400);
  }

  return parsedDate;
};

const parseRecordFilterDate = (
  value: string | undefined,
  label: string,
  endOfDay = false
) => {
  if (!value?.trim()) {
    return null;
  }

  const normalizedValue = value.includes("T")
    ? value
    : `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`;
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new LabModuleError(`${label} is invalid.`, 400);
  }

  return parsedDate;
};

const ensurePaidBilling = (isPaid: boolean, message: string) => {
  if (!isPaid) {
    throw new LabModuleError(message, 409);
  }
};

const toDisplayItem = (
  record: LabRequestRecord,
  item: LabRequestRecord["items"][number]
) => {
  const latestPayment = record.request.billing?.payments[0] ?? null;
  const isPaid = record.request.billing?.status === "DONE";

  const completedTests = record.items
    .filter((entry) => entry.status === "DONE")
    .map((entry) => entry.test.name);
  const pendingTests = record.items
    .filter((entry) => entry.status !== "DONE" && entry.status !== "CANCELLED")
    .map((entry) => entry.test.name);
  const requestStatus = requestStatusFromItemStatuses(
    record.items.map((entry) => entry.status)
  );

  return {
    labId: item.item_id,
    requestId: record.request.req_id,
    laboratoryRequestId: record.id,
    id: `LR-${record.id.toString().padStart(4, "0")}`,
    patientId:
      record.request.patient.patient_code ??
      `PT-${record.request.patient.patient_id.toString().padStart(4, "0")}`,
    rawPatientId: record.request.patient.patient_id,
    patientName: record.request.patient.name,
    age: record.request.patient.age ? String(record.request.patient.age) : "",
    sex: record.request.patient.sex,
    address: record.request.patient.address,
    requestedBy: record.req_by,
    requestedAt: record.request.req_date.toISOString(),
    requestedDate: record.request.req_date.toISOString(),
    requestStatus: toApiLabStatus(requestStatus),
    status: toApiLabStatus(item.status),
    billingCode: record.request.billing?.billing_code ?? null,
    billingStatus: isPaid ? "paid" : "unpaid",
    billingTotal: record.request.billing ? Number(record.request.billing.total_price) : 0,
    isPaid,
    paidAt: latestPayment?.payment_date?.toISOString() ?? null,
    category: resolveApiLabCategory({
      category: item.test.category,
      schemaKey: item.test.schema_key,
      testName: item.test.name,
    }),
    recordGroup: resolveLabRecordGroup({
      category: item.test.category,
      schemaKey: item.test.schema_key,
      testName: item.test.name,
    }),
    schemaKey: item.test.schema_key,
    tests: record.items.map((entry) => entry.test.name),
    testType: item.test.name,
    completedTests,
    pendingTests,
    totalTests: record.items.length,
    completedCount: completedTests.length,
    priority: "Routine" as const,
    resultPayload: serializeLabResultPayload(item.result_payload),
  };
};

const getUserName = async (tx: Prisma.TransactionClient, userId: number) => {
  const user = await tx.users.findUnique({
    where: { user_id: userId },
    select: { name: true },
  });

  return normalizeRequestedBy(user?.name) ?? "Doctor";
};

const getLabRequestRecords = async (tx: Prisma.TransactionClient) => {
  return tx.laboratoryRequest.findMany({
    include: labRequestInclude,
  });
};

const getDisplayItemById = async (tx: Prisma.TransactionClient, labId: number) => {
  const record = await tx.laboratoryRequest.findFirst({
    where: {
      items: {
        some: {
          item_id: labId,
        },
      },
    },
    include: labRequestInclude,
  });

  if (!record) {
    throw new LabModuleError("Lab request not found.", 404);
  }

  const item = record.items.find((entry) => entry.item_id === labId);

  if (!item) {
    throw new LabModuleError("Lab request item not found.", 404);
  }

  return toDisplayItem(record, item);
};

const getRelatedCombinedLabResultItems = async (
  tx: Prisma.TransactionClient,
  laboratoryRequestId: number,
  family: NonNullable<ReturnType<typeof resolveCombinedLabResultFamily>>
) => {
  const items = await tx.laboratoryRequestItem.findMany({
    where: {
      laboratory_request_id: laboratoryRequestId,
    },
    select: {
      item_id: true,
      processed_by: true,
      result_payload: true,
      status: true,
      test: {
        select: {
          name: true,
          schema_key: true,
        },
      },
    },
  });

  return items.filter((item) =>
    resolveCombinedLabResultFamily({
      schemaKey: item.test.schema_key,
      testName: item.test.name,
    })
      === family
  );
};

const syncParentRequestStatus = async (
  tx: Prisma.TransactionClient,
  laboratoryRequestId: number
) => {
  const parentRequest = await tx.laboratoryRequest.findUnique({
    where: { id: laboratoryRequestId },
    select: {
      req_id: true,
      items: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!parentRequest) {
    throw new LabModuleError("Lab request not found.", 404);
  }

  await tx.request.update({
    where: { req_id: parentRequest.req_id },
    data: {
      status: requestStatusFromItemStatuses(
        parentRequest.items.map((item) => item.status)
      ),
    },
  });
};

export const getAllUsersService = async () => {
  return prisma.users.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

const getCatalogPreferenceScore = (item: LabCatalogItem) => {
  const normalizedName = item.name.trim().toLowerCase();

  if (item.schema_key === "onehOGTT" && normalizedName.includes("1h")) {
    return 100;
  }

  if (item.schema_key === "onehOGTT" && normalizedName.includes("50g")) {
    return 100;
  }

  if (item.schema_key === "twohOGTT" && normalizedName.includes("2h")) {
    return 100;
  }

  if (item.schema_key === "twohOGTT" && normalizedName.includes("75g")) {
    return 100;
  }

  if (
    item.schema_key === "OGTT" &&
    (normalizedName === "ogtt" || normalizedName.includes("100g"))
  ) {
    return 100;
  }

  return normalizedName.length > 4 ? 10 : 0;
};

export const getLabTestsService = async () => {
  const tests = await prisma.laboratoryTest.findMany({
    select: {
      test_id: true,
      name: true,
      category: true,
      schema_key: true,
    },
    orderBy: [{ name: "asc" }, { test_id: "asc" }],
  });

  const groupedByKey = new Map<string, LabCatalogItem[]>();

  tests.forEach((test) => {
    const groupingKey = test.schema_key?.trim() || test.name.trim().toLowerCase();
    const currentGroup = groupedByKey.get(groupingKey) ?? [];
    currentGroup.push(test);
    groupedByKey.set(groupingKey, currentGroup);
  });

  return Array.from(groupedByKey.values())
    .map((group) =>
      [...group].sort((left, right) => {
        const scoreDiff =
          getCatalogPreferenceScore(right) - getCatalogPreferenceScore(left);

        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return left.name.localeCompare(right.name);
      })[0]
    )
    .map((test) => ({
      testId: test.test_id,
      name: test.name,
      displayName: test.name,
      category: resolveApiLabCategory({
        category: test.category,
        schemaKey: test.schema_key,
        testName: test.name,
      }),
      schemaKey: test.schema_key,
    }))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
};

export const searchPatientsService = async (search?: string) => {
  const keyword = search?.trim() ?? "";
  const wildcard = `%${keyword}%`;

  return prisma.$queryRawUnsafe<RawPatientRow[]>(
    `
      SELECT
        patient_id,
        name,
        age,
        sex,
        address,
        contact_number
      FROM patients
      WHERE (? = '' OR name LIKE ? OR address LIKE ? OR CAST(patient_id AS CHAR) LIKE ?)
      ORDER BY patient_id DESC
      LIMIT 10
    `,
    keyword,
    wildcard,
    wildcard,
    wildcard
  );
};

export const getPatientRecordsService = async (search?: string) => {
  const keyword = search?.trim() ?? "";
  const wildcard = `%${keyword}%`;

  const patients = await prisma.$queryRawUnsafe<RawPatientRecordRow[]>(
    `
      SELECT
        p.patient_id,
        p.patient_code,
        p.name,
        p.age,
        p.sex,
        p.birth_date,
        p.address,
        p.religion,
        p.contact_number,
        p.created_at,
        (
          SELECT COUNT(*)
          FROM request r
          INNER JOIN laboratory_request lr ON lr.req_id = r.req_id
          WHERE r.patient_id = p.patient_id
        ) AS lab_requests_count,
        (SELECT COUNT(*) FROM medical_records mr WHERE mr.patient_id = p.patient_id) AS medical_records_count,
        (SELECT COUNT(*) FROM consultation_records cr WHERE cr.patient_id = p.patient_id) AS history_count,
        (SELECT COUNT(*) FROM vital_signs vs WHERE vs.patient_id = p.patient_id) AS vital_signs_count
      FROM patients p
      WHERE (? = '' OR p.name LIKE ? OR p.address LIKE ? OR CAST(p.patient_id AS CHAR) LIKE ?)
      ORDER BY p.name ASC, p.patient_id DESC
    `,
    keyword,
    wildcard,
    wildcard,
    wildcard
  );

  return patients.map((patient) => ({
    ...patient,
    lab_requests_count: Number(patient.lab_requests_count ?? 0),
    medical_records_count: Number(patient.medical_records_count ?? 0),
    history_count: Number(patient.history_count ?? 0),
    vital_signs_count: Number(patient.vital_signs_count ?? 0),
    patient_code:
      patient.patient_code ??
      `PT-${patient.patient_id.toString().padStart(4, "0")}`,
  }));
};

export const createLabRequestService = async ({
  patientId,
  userId,
  requestedBy,
  tests,
  requestedDate,
}: CreateLabRequestInput) => {
  return prisma.$transaction(async (tx) => {
    const normalizedTests = splitLabTests(tests.join(", "));

    if (!normalizedTests.length) {
      throw new LabModuleError("At least one laboratory test is required.", 400);
    }

    const patient = await tx.patients.findUnique({
      where: { patient_id: patientId },
      select: { patient_id: true },
    });

    if (!patient) {
      throw new LabModuleError("Selected patient was not found.", 404);
    }

    const finalRequestedBy =
      normalizeRequestedBy(requestedBy) ?? (await getUserName(tx, userId));
    const resolvedRequestedDate = parseRequestedDate(requestedDate);

    const request = await tx.request.create({
      data: {
        patient_id: patientId,
        req_type: "LABORATORY",
        status: "WAITING",
        req_date: resolvedRequestedDate,
      },
    });

    const laboratoryRequest = await createLaboratoryRequestWithItems(tx, {
      reqId: request.req_id,
      requestedBy: finalRequestedBy,
      tests: normalizedTests,
    });

    const records = await getLabRequestRecords(tx);
    const createdRecord = records.find((record) => record.id === laboratoryRequest.id);

    if (!createdRecord?.items.length) {
      throw new Error("Unable to load the created laboratory request.");
    }

    return toDisplayItem(createdRecord, createdRecord.items[0]);
  });
};

export const getLabRequestsService = async (status?: string) => {
  return prisma.$transaction(async (tx) => {
    const records = await getLabRequestRecords(tx);
    const normalizedStatus = status?.trim().toLowerCase();

    return records
      .filter((record) => record.items.length > 0)
      .flatMap((record) => record.items.map((item) => toDisplayItem(record, item)))
      .filter((item) => !normalizedStatus || item.status === normalizedStatus)
      .sort((left, right) => {
        const timeDiff =
          new Date(right.requestedDate).getTime() - new Date(left.requestedDate).getTime();

        if (timeDiff !== 0) {
          return timeDiff;
        }

        return right.labId - left.labId;
      });
  });
};

export const getLabRequestByIdService = async (labId: number) => {
  return prisma.$transaction(async (tx) => getDisplayItemById(tx, labId));
};

export const getPatientLabRecordsService = async (
  patientId: number,
  filters: PatientLabRecordsFilters = {}
) => {
  return prisma.$transaction(async (tx) => {
    const patient = await tx.patients.findUnique({
      where: { patient_id: patientId },
      select: { patient_id: true },
    });

    if (!patient) {
      throw new LabModuleError("Patient not found.", 404);
    }

    const dateFrom = parseRecordFilterDate(filters.dateFrom, "Date from");
    const dateTo = parseRecordFilterDate(filters.dateTo, "Date to", true);

    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      throw new LabModuleError("Date from cannot be later than date to.", 400);
    }

    const records = await tx.laboratoryRequest.findMany({
      where: {
        request: {
          is: {
            patient_id: patientId,
            ...(dateFrom || dateTo
              ? {
                  req_date: {
                    ...(dateFrom ? { gte: dateFrom } : {}),
                    ...(dateTo ? { lte: dateTo } : {}),
                  },
                }
              : {}),
          },
        },
      },
      include: labRequestInclude,
    });

    return records
      .filter((record) => record.items.length > 0)
      .flatMap((record) =>
        record.items
          .filter((item) => item.result_payload)
          .map((item) => toDisplayItem(record, item))
      )
      .filter(
        (item) => !filters.recordGroup || item.recordGroup === filters.recordGroup
      )
      .sort((left, right) => {
        const timeDiff =
          new Date(right.requestedDate).getTime() - new Date(left.requestedDate).getTime();

        if (timeDiff !== 0) {
          return timeDiff;
        }

        return right.labId - left.labId;
      });
  });
};

export const updateLabRequestStatusService = async (
  labId: number,
  status: "queued" | "pending" | "done",
  userId?: number
) => {
  return prisma.$transaction(async (tx) => {
    const existingItem = await tx.laboratoryRequestItem.findUnique({
      where: { item_id: labId },
      select: {
        item_id: true,
        laboratory_request_id: true,
        processed_by: true,
        status: true,
        result_payload: true,
        test: {
          select: {
            name: true,
            schema_key: true,
          },
        },
        laboratoryRequest: {
          select: {
            request: {
              select: {
                billing: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      throw new LabModuleError("Lab request item not found.", 404);
    }

    const dbStatus = toDbLabStatus(status);
    const isBillingPaid = existingItem.laboratoryRequest.request.billing?.status === "DONE";
    const combinedResultFamily = resolveCombinedLabResultFamily({
      schemaKey: existingItem.test.schema_key,
      testName: existingItem.test.name,
    });
    const relatedGroupItems = combinedResultFamily
      ? await getRelatedCombinedLabResultItems(
          tx,
          existingItem.laboratory_request_id,
          combinedResultFamily
        )
      : [existingItem];
    const targetItemIds = relatedGroupItems.map((item) => item.item_id);

    if (dbStatus !== "QUEUED") {
      ensurePaidBilling(
        isBillingPaid,
        "Patient billing must be paid before this request can move forward in the laboratory."
      );
    }

    if (dbStatus === "DONE" && relatedGroupItems.some((item) => item.status === "QUEUED")) {
      throw new LabModuleError(
        "Accept the laboratory request before marking it as completed.",
        409
      );
    }

    if (dbStatus === "DONE" && relatedGroupItems.some((item) => !item.result_payload)) {
      throw new LabModuleError(
        "Save laboratory results before marking this request as completed.",
        409
      );
    }

    await tx.laboratoryRequestItem.updateMany({
      where: {
        item_id: {
          in: targetItemIds,
        },
      },
      data: {
        status: dbStatus,
        completed_at: dbStatus === "DONE" ? new Date() : null,
        processed_by:
          dbStatus === "QUEUED" ? null : userId ?? existingItem.processed_by ?? null,
      },
    });

    await syncParentRequestStatus(tx, existingItem.laboratory_request_id);

    return getDisplayItemById(tx, labId);
  });
};

export const saveLabResultService = async ({
  labId,
  category,
  form,
  userId,
  pathologistUserId,
}: SaveLabResultInput) => {
  return prisma.$transaction(async (tx) => {
    const existingItem = await tx.laboratoryRequestItem.findUnique({
      where: { item_id: labId },
      select: {
        item_id: true,
        test_id: true,
        status: true,
        processed_by: true,
        laboratory_request_id: true,
        test: {
          select: {
            name: true,
            schema_key: true,
          },
        },
        laboratoryRequest: {
          select: {
            request: {
              select: {
                patient_id: true,
                billing: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      throw new LabModuleError("Lab request item not found.", 404);
    }

    ensurePaidBilling(
      existingItem.laboratoryRequest.request.billing?.status === "DONE",
      "Patient billing must be paid before laboratory results can be encoded."
    );

    if (existingItem.status === "QUEUED") {
      throw new LabModuleError(
        "Accept the laboratory request before encoding results.",
        409
      );
    }

    if (!existingItem.test.schema_key) {
      await tx.laboratoryTest.update({
        where: { test_id: existingItem.test_id },
        data: {
          schema_key: toSchemaKey(existingItem.test.name),
        },
      });
    }

    const combinedResultFamily = resolveCombinedLabResultFamily({
      schemaKey: existingItem.test.schema_key,
      testName: existingItem.test.name,
    });
    const relatedGroupItems = combinedResultFamily
      ? await getRelatedCombinedLabResultItems(
          tx,
          existingItem.laboratory_request_id,
          combinedResultFamily
        )
      : [
          {
            item_id: existingItem.item_id,
            processed_by: existingItem.processed_by,
            result_payload: null,
            status: existingItem.status,
            test: existingItem.test,
          },
        ];
    const targetItemIds = relatedGroupItems.map((item) => item.item_id);
    const nextStatus = existingItem.status === "DONE" ? "DONE" : "PROCESSING";

    await tx.laboratoryRequestItem.updateMany({
      where: {
        item_id: {
          in: targetItemIds,
        },
      },
      data: {
        result_payload: normalizeLabForm(form),
        status: nextStatus,
        completed_at: nextStatus === "DONE" ? new Date() : null,
        processed_by: userId ?? existingItem.processed_by ?? null,
      },
    });

    for (const relatedItem of relatedGroupItems) {
      await upsertStructuredLabResult({
        tx,
        patientId: existingItem.laboratoryRequest.request.patient_id,
        labId: relatedItem.item_id,
        testName: relatedItem.test.name,
        schemaKey: relatedItem.test.schema_key,
        form,
        medTechUserId: userId ?? null,
        pathologistUserId,
      });
    }

    await syncParentRequestStatus(tx, existingItem.laboratory_request_id);

    return getDisplayItemById(tx, labId);
  });
};
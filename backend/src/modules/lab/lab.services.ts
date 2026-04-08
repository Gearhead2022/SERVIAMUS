import {
  Prisma,
  LaboratoryCategory,
  LaboratoryRequestItemStatus,
  RequestStatus,
} from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { CreateLabRequestInput, SaveLabResultInput } from "./lab.types";
import {
  categorizeLabTest,
  normalizeLabForm,
  requestStatusFromItemStatuses,
  seedItemStatusFromRequestStatus,
  splitLabTests,
  toApiLabCategory,
  toApiLabStatus,
  toDbLabCategory,
  toDbLabStatus,
} from "./lab.utils";

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

type LabRequestRecord = {
  id: number;
  req_id: number;
  req_by: string;
  request: {
    req_id: number;
    patient_id: number;
    req_date: Date;
    status: RequestStatus;
    patient: {
      patient_id: number;
      patient_code: string | null;
      name: string;
      age: number | null;
      sex: string;
      address: string;
    };
  };
  items: Array<{
    item_id: number;
    test_name: string;
    category: LaboratoryCategory;
    status: LaboratoryRequestItemStatus;
    result_payload: Prisma.JsonValue | null;
    sort_order: number;
    completed_at: Date | null;
    created_at: Date;
  }>;
};

const includeLabRequestRecord = {
  request: {
    select: {
      req_id: true,
      patient_id: true,
      req_date: true,
      status: true,
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
      test_name: true,
      category: true,
      status: true,
      result_payload: true,
      sort_order: true,
      completed_at: true,
      created_at: true,
    },
    orderBy: [{ sort_order: "asc" }, { item_id: "asc" }],
  },
} satisfies Prisma.LaboratoryRequestInclude;

const normalizeRequestedBy = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const serializeResultPayload = (value: Prisma.JsonValue | null) => {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, itemValue]) => [
      key,
      typeof itemValue === "string" ? itemValue : String(itemValue ?? ""),
    ])
  );
};

const toDisplayItem = (
  record: LabRequestRecord,
  item: LabRequestRecord["items"][number]
) => {
  const completedTests = record.items
    .filter((entry) => entry.status === "DONE")
    .map((entry) => entry.test_name);
  const pendingTests = record.items
    .filter((entry) => entry.status !== "DONE")
    .map((entry) => entry.test_name);
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
      `PT-${record.request.patient_id.toString().padStart(4, "0")}`,
    rawPatientId: record.request.patient_id,
    patientName: record.request.patient.name,
    age: record.request.patient.age ? String(record.request.patient.age) : "",
    sex: record.request.patient.sex,
    address: record.request.patient.address,
    requestedBy: record.req_by,
    requestedAt: record.request.req_date.toISOString(),
    requestedDate: record.request.req_date.toISOString(),
    requestStatus: toApiLabStatus(requestStatus),
    status: toApiLabStatus(item.status),
    category: toApiLabCategory(item.category),
    tests: record.items.map((entry) => entry.test_name),
    testType: item.test_name,
    completedTests,
    pendingTests,
    totalTests: record.items.length,
    completedCount: completedTests.length,
    priority: "Routine" as const,
    resultPayload: serializeResultPayload(item.result_payload),
  };
};

const getUserName = async (tx: Prisma.TransactionClient, userId: number) => {
  const user = await tx.users.findUnique({
    where: { user_id: userId },
    select: { name: true },
  });

  return normalizeRequestedBy(user?.name) ?? "Doctor";
};

const ensureLaboratoryRequestItems = async (tx: Prisma.TransactionClient) => {
  const laboratoryRequests = await tx.laboratoryRequest.findMany({
    select: {
      id: true,
      test: true,
      request: {
        select: {
          status: true,
        },
      },
      items: {
        select: {
          test_name: true,
        },
        orderBy: [{ sort_order: "asc" }, { item_id: "asc" }],
      },
    },
  });

  for (const laboratoryRequest of laboratoryRequests) {
    const parsedTests = splitLabTests(laboratoryRequest.test);

    if (!parsedTests.length) {
      continue;
    }

    const unmatchedIndexes = new Set<number>();
    const existingNames = laboratoryRequest.items.map((item) =>
      item.test_name.trim().toLowerCase()
    );

    const missingItems: Array<{
      laboratory_request_id: number;
      test_name: string;
      category: LaboratoryCategory;
      status: LaboratoryRequestItemStatus;
      sort_order: number;
    }> = [];

    parsedTests.forEach((testName, index) => {
      const normalizedName = testName.trim().toLowerCase();
      let matchedIndex = -1;

      for (let existingIndex = 0; existingIndex < existingNames.length; existingIndex += 1) {
        if (unmatchedIndexes.has(existingIndex)) {
          continue;
        }

        if (existingNames[existingIndex] === normalizedName) {
          matchedIndex = existingIndex;
          break;
        }
      }

      if (matchedIndex >= 0) {
        unmatchedIndexes.add(matchedIndex);
        return;
      }

      missingItems.push({
        laboratory_request_id: laboratoryRequest.id,
        test_name: testName,
        category: categorizeLabTest(testName),
        status: seedItemStatusFromRequestStatus(laboratoryRequest.request.status),
        sort_order: index,
      });
    });

    if (missingItems.length) {
      await tx.laboratoryRequestItem.createMany({
        data: missingItems,
      });
    }
  }
};

const getLabRequestRecords = async (tx: Prisma.TransactionClient) => {
  await ensureLaboratoryRequestItems(tx);

  return tx.laboratoryRequest.findMany({
    include: includeLabRequestRecord,
  });
};

const getDisplayItemById = async (
  tx: Prisma.TransactionClient,
  labId: number
) => {
  const record = await tx.laboratoryRequest.findFirst({
    where: {
      items: {
        some: {
          item_id: labId,
        },
      },
    },
    include: includeLabRequestRecord,
  });

  if (!record) {
    throw new Error("Lab request not found.");
  }

  const targetItem = record.items.find((item) => item.item_id === labId);

  if (!targetItem) {
    throw new Error("Lab request item not found.");
  }

  return toDisplayItem(record as LabRequestRecord, targetItem);
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
      throw new Error("At least one laboratory test is required.");
    }

    const patient = await tx.patients.findUnique({
      where: { patient_id: patientId },
      select: { patient_id: true },
    });

    if (!patient) {
      throw new Error("Selected patient was not found.");
    }

    const finalRequestedBy =
      normalizeRequestedBy(requestedBy) ?? (await getUserName(tx, userId));

    const request = await tx.request.create({
      data: {
        patient_id: patientId,
        req_type: "LABORATORY",
        status: "WAITING",
        req_date: requestedDate ? new Date(requestedDate) : new Date(),
      },
    });

    const laboratoryRequest = await tx.laboratoryRequest.create({
      data: {
        req_id: request.req_id,
        req_by: finalRequestedBy,
        test: normalizedTests.join(", "),
      },
    });

    await tx.laboratoryRequestItem.createMany({
      data: normalizedTests.map((testName, index) => ({
        laboratory_request_id: laboratoryRequest.id,
        test_name: testName,
        category: categorizeLabTest(testName),
        sort_order: index,
      })),
    });

    const records = await getLabRequestRecords(tx);
    const createdRecord = records.find((record) => record.id === laboratoryRequest.id);

    if (!createdRecord?.items.length) {
      throw new Error("Unable to load the created laboratory request.");
    }

    return toDisplayItem(createdRecord as LabRequestRecord, createdRecord.items[0]);
  });
};

export const getLabRequestsService = async (status?: string) => {
  return prisma.$transaction(async (tx) => {
    const records = await getLabRequestRecords(tx);
    const normalizedStatus = status?.trim().toLowerCase();

    return records
      .flatMap((record) =>
        record.items.map((item) => toDisplayItem(record as LabRequestRecord, item))
      )
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

export const updateLabRequestStatusService = async (
  labId: number,
  status: "queued" | "pending" | "done"
) => {
  return prisma.$transaction(async (tx) => {
    const existingItem = await tx.laboratoryRequestItem.findUnique({
      where: { item_id: labId },
      select: {
        item_id: true,
        laboratory_request_id: true,
      },
    });

    if (!existingItem) {
      throw new Error("Lab request item not found.");
    }

    const dbStatus = toDbLabStatus(status);

    await tx.laboratoryRequestItem.update({
      where: { item_id: labId },
      data: {
        status: dbStatus,
        completed_at: dbStatus === "DONE" ? new Date() : null,
      },
    });

    const items = await tx.laboratoryRequestItem.findMany({
      where: {
        laboratory_request_id: existingItem.laboratory_request_id,
      },
      select: {
        status: true,
      },
    });

    const parentRequest = await tx.laboratoryRequest.findUnique({
      where: { id: existingItem.laboratory_request_id },
      select: { req_id: true },
    });

    if (!parentRequest) {
      throw new Error("Lab request not found.");
    }

    await tx.request.update({
      where: { req_id: parentRequest.req_id },
      data: {
        status: requestStatusFromItemStatuses(items.map((item) => item.status)),
      },
    });

    return getDisplayItemById(tx, labId);
  });
};

export const saveLabResultService = async ({
  labId,
  category,
  form,
}: SaveLabResultInput) => {
  return prisma.$transaction(async (tx) => {
    const existingItem = await tx.laboratoryRequestItem.findUnique({
      where: { item_id: labId },
      select: {
        item_id: true,
        status: true,
        laboratory_request_id: true,
      },
    });

    if (!existingItem) {
      throw new Error("Lab request item not found.");
    }

    await tx.laboratoryRequestItem.update({
      where: { item_id: labId },
      data: {
        category: toDbLabCategory(category),
        result_payload: normalizeLabForm(form),
        status: existingItem.status === "QUEUED" ? "PENDING" : existingItem.status,
      },
    });

    const items = await tx.laboratoryRequestItem.findMany({
      where: {
        laboratory_request_id: existingItem.laboratory_request_id,
      },
      select: {
        status: true,
      },
    });

    const parentRequest = await tx.laboratoryRequest.findUnique({
      where: { id: existingItem.laboratory_request_id },
      select: { req_id: true },
    });

    if (!parentRequest) {
      throw new Error("Lab request not found.");
    }

    await tx.request.update({
      where: { req_id: parentRequest.req_id },
      data: {
        status: requestStatusFromItemStatuses(items.map((item) => item.status)),
      },
    });

    return getDisplayItemById(tx, labId);
  });
};

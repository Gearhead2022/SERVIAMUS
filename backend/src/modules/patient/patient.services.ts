import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { PatientPayload } from "../patient/patient.types";

type PatientRecord = {
  patient_id: number;
  patient_code: string | null;
  name: string;
  address: string;
  contact_number: string;
  birth_date: Date;
  sex: "male" | "female";
  age: number | null;
  religion: string | null;
  philhealth_id?: string | null;
};

let supportsPhilhealthColumnPromise: Promise<boolean> | null = null;

const hasPatientPhilhealthColumn = async () => {
  if (!supportsPhilhealthColumnPromise) {
    supportsPhilhealthColumnPromise = prisma
      .$queryRaw<Array<{ column_exists: number }>>(Prisma.sql`
        SELECT EXISTS(
          SELECT 1
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'patients'
            AND COLUMN_NAME = 'philhealth_id'
        ) AS column_exists
      `)
      .then((rows) => Boolean(Number(rows[0]?.column_exists ?? 0)))
      .catch(() => false);
  }

  return supportsPhilhealthColumnPromise;
};

const getPatientSelect = (supportsPhilhealthColumn: boolean): Prisma.PatientsSelect => ({
  patient_id: true,
  patient_code: true,
  name: true,
  address: true,
  contact_number: true,
  birth_date: true,
  sex: true,
  age: true,
  religion: true,
  last_medical_assistance_year: true,
  ...(supportsPhilhealthColumn ? { philhealth_id: true } : {}),
});

const normalizePatient = (
  patient: PatientRecord,
  supportsPhilhealthColumn: boolean
) => ({
  ...patient,
  philhealth_id: supportsPhilhealthColumn ? patient.philhealth_id ?? null : null,
});

const getPatientWriteData = (
  payload: PatientPayload,
  supportsPhilhealthColumn: boolean
) => ({
  name: payload.name,
  address: payload.address,
  contact_number: payload.contact_number,
  birth_date: new Date(payload.birth_date),
  sex: payload.sex as "male" | "female",
  age: payload.age,
  religion: payload.religion,
  ...(supportsPhilhealthColumn
    ? {
      philhealth_id: payload.philhealth_id?.trim()
        ? payload.philhealth_id.trim()
        : null,
    }
    : {}),
});

/**
 * GET ALL PATIENT
 */
export const getAllPatients = async (search?: string, page = 1, limit = 20) => {
  const supportsPhilhealthColumn = await hasPatientPhilhealthColumn();
  const select = getPatientSelect(supportsPhilhealthColumn);
  const where = search
      ? {
        OR: [
          {
            patient_code: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
      }
      : undefined;
  const [total, patients] = await prisma.$transaction([
    prisma.patients.count({ where }),
    prisma.patients.findMany({
      where, select, orderBy: { patient_id: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
  ]);

  return {
    data: (patients as PatientRecord[]).map((patient) => normalizePatient(patient, supportsPhilhealthColumn)),
    pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
};

/**
 * REGISTER PATIENT
 */
export const addPatient = async (payload: PatientPayload) => {
  const supportsPhilhealthColumn = await hasPatientPhilhealthColumn();
  const select = getPatientSelect(supportsPhilhealthColumn);

  return prisma.$transaction(async (tx) => {
    const patient = await tx.patients.create({
      data: getPatientWriteData(payload, supportsPhilhealthColumn),
    });

    const patientCode = `P${patient.patient_id.toString().padStart(5, "0")}`;

    const updatedPatient = await tx.patients.update({
      where: { patient_id: patient.patient_id },
      data: { patient_code: patientCode },
      select,
    });

    return normalizePatient(updatedPatient as PatientRecord, supportsPhilhealthColumn);
  });
};

/**
 * GET PATIENT BY ID
 */
export const getPatientById = async (patientId: number) => {
  const supportsPhilhealthColumn = await hasPatientPhilhealthColumn();
  const select = getPatientSelect(supportsPhilhealthColumn);

  const patient = await prisma.patients.findUnique({
    where: { patient_id: patientId },
    select,
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return normalizePatient(patient as PatientRecord, supportsPhilhealthColumn);
};

/**
 * UPDATE PATIENT
 */
export const updatePatient = async (patientId: number, payload: PatientPayload) => {
  const supportsPhilhealthColumn = await hasPatientPhilhealthColumn();
  const select = getPatientSelect(supportsPhilhealthColumn);

  const patient = await prisma.patients.update({
    where: { patient_id: patientId },
    data: getPatientWriteData(payload, supportsPhilhealthColumn),
    select,
  });

  return normalizePatient(patient as PatientRecord, supportsPhilhealthColumn);
};

const getPatientDeletionCandidate = async (patientId: number) => {
  const patient = await prisma.patients.findUnique({
    where: { patient_id: patientId },
    select: {
      patient_id: true,
      name: true,
      patient_code: true,
      _count: {
        select: {
          request: true,
          vitals: true,
          consultations: true,
          prescriptions: true,
          hematology_results: true,
          serology_results: true,
          parasitology_results: true,
          urinalysis_results: true,
          clinical_chemistry_results: true,
          hba1c_results: true,
          chemistry_results: true,
          ogtt_results: true,
          fobt_results: true,
          medical_certificate_results: true,
          queue: true,
        },
      },
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

const hasPatientRecords = (patient: Awaited<ReturnType<typeof getPatientDeletionCandidate>>) =>
  Object.values(patient._count).some((count) => count > 0);

export type PatientDeletionOutcome =
  | { action: "deleted"; patient_id: number }
  | { action: "approval_required"; deletion_request_id: number; already_pending: boolean };

export const requestPatientDeletion = async (
  patientId: number,
  requestedBy: number
): Promise<PatientDeletionOutcome> => {
  const patient = await getPatientDeletionCandidate(patientId);

  if (!hasPatientRecords(patient)) {
    const deleted = await prisma.patients.delete({
      where: { patient_id: patientId },
      select: { patient_id: true },
    });

    return { action: "deleted", patient_id: deleted.patient_id };
  }

  const existing = await prisma.patientDeletionRequest.findUnique({
    where: { patient_id: patientId },
    select: { deletion_request_id: true, status: true },
  });

  if (existing?.status === "PENDING") {
    return {
      action: "approval_required",
      deletion_request_id: existing.deletion_request_id,
      already_pending: true,
    };
  }

  const request = existing
    ? await prisma.patientDeletionRequest.update({
        where: { deletion_request_id: existing.deletion_request_id },
        data: {
          requested_by: requestedBy,
          reviewed_by: null,
          status: "PENDING",
          reason: null,
          requested_at: new Date(),
          reviewed_at: null,
        },
      })
    : await prisma.patientDeletionRequest.create({
        data: {
          patient_id: patient.patient_id,
          patient_name: patient.name,
          patient_code: patient.patient_code,
          requested_by: requestedBy,
        },
      });

  return {
    action: "approval_required",
    deletion_request_id: request.deletion_request_id,
    already_pending: false,
  };
};

export const getPatientDeletionRequests = async () =>
  prisma.patientDeletionRequest.findMany({
    include: {
      requester: { select: { name: true, username: true } },
      reviewer: { select: { name: true, username: true } },
    },
    orderBy: [{ status: "asc" }, { requested_at: "desc" }],
  });

export const reviewPatientDeletionRequest = async (
  deletionRequestId: number,
  reviewedBy: number,
  decision: "APPROVED" | "REJECTED"
) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.patientDeletionRequest.findUnique({
      where: { deletion_request_id: deletionRequestId },
    });

    if (!request) {
      throw new Error("Deletion request not found");
    }

    if (request.status !== "PENDING") {
      throw new Error("This deletion request has already been reviewed.");
    }

    const reviewed = await tx.patientDeletionRequest.update({
      where: { deletion_request_id: deletionRequestId },
      data: {
        status: decision,
        reviewed_by: reviewedBy,
        reviewed_at: new Date(),
      },
    });

    if (decision === "APPROVED" && request.patient_id) {
      await tx.patients.delete({ where: { patient_id: request.patient_id } });
    }

    return reviewed;
  });
};

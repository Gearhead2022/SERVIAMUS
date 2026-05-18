import { prisma } from "../../config/prismaClient";
import { addToQueue } from "../queue/queue.services";
import { createLaboratoryRequestWithItems } from "../lab/lab.helpers";
import { splitLabTests } from "../lab/lab.utils";
import { CreateRequestProps } from "./request.types";
import { QueueStatus, RequestType } from "@prisma/client";

type NonCertificateRequestType = Exclude<RequestType, "CERTIFICATE">

export const getPrevVitalSigns = async (patient_id: number) => {
  return prisma.$transaction(async (tx) => {
    const prevVitals = await tx.vitallSign.findFirst({
      where: { patient_id },
      orderBy: { vs_id: "desc" },
      select: {
        bp: true,
        rr: true,
        cr: true,
        temp: true,
        wt: true,
        ht: true,
        created_at: true,
        patient: {
          select: {
            patient_code: true
          }
        }


      },
    });

    return prevVitals;
  });
};

export const createRequest = async (payload: CreateRequestProps) => {

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: {
        patient_id: payload.patient_id,
        req_type: payload.req_type as RequestType,
        status: "WAITING",
        req_date: new Date(payload.req_date),
      },
    });

    await addToQueue(
      tx,
      payload.patient_id,
      request.req_id,
      payload.req_date,
      payload.req_type === "CERTIFICATE"
        ? "CONSULTATION"
        : payload.req_type as NonCertificateRequestType
    );

    return request;
  });

  if (payload.req_type === "CONSULTATION") {
    const vitals = await prisma.vitallSign.create({
      data: {
        patient_id: payload.patient_id,
        bp: payload.bp ?? null,
        temp: payload.temp ?? null,
        cr: payload.cr ?? null,
        rr: payload.rr ?? null,
        wt: payload.wt ?? null,
        ht: payload.ht ?? null,
      },
    });

    const consult = await prisma.consultationRequest.create({
      data: {
        req_id: result.req_id,
        vs_id: vitals.vs_id,
        physician: payload.physician,
      },
    });

    return { result, vitals, consult };
  }

  // Doctor-side request creation only normalizes the selected tests and
  // hands them off to the lab module. The lab module owns the later
  // morphing/consolidation rules so the workflow stays centralized.
  if (payload.req_type === "LABORATORY") {
    const normalizedTests = splitLabTests(payload.test.join(", "));

    if (!normalizedTests.length) {
      throw new Error("At least one laboratory test is required.");
    }

    const lab = await createLaboratoryRequestWithItems(prisma, {
      reqId: result.req_id,
      requestedBy: payload.req_by,
      tests: normalizedTests,
    });

    return { result, lab };
  }

  if (payload.req_type === "CERTIFICATE") {

    const med = await prisma.medicalCertificateRequest.create({
      data: {
        req_id: result.req_id,
        physician: payload.physician,
        purpose: payload.purpose,
      },
      include: {
        certificate: true
      }
    });

    return { result, med };
  }

  throw new Error("Invalid request type");
};


export const getAllRegisteredUsers = async () => {
  return prisma.$transaction(async (tx) => {
    const data = tx.users.findMany({
      where: {
        is_active: true,
        roles: {
          some: {
            role: {
              role_name: 'DOCTOR'
            }
          }
        }
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        license_no: true,
        title: true,
        ptr_no: true,
      }
    });

    return data;
  })
}

export const getRequestData = async (request_id: number) => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findFirst({
      where: {
        req_id: request_id,
        req_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        cert: {
          include: {
            certificate: true,
          },
        },
        consult: true,
        patient: true,
      },
    });

    if (!request?.consult?.cons_id) {
      return request;
    }

    const consultation = await tx.consultation.findFirst({
      where: {
        cons_id: request.consult.cons_id,
      },
    });

    const prescription = await tx.prescription.findFirst({
      where: {
        consultation_id: consultation?.consultation_id,
      }
    })

    return {
      ...request,
      consult: {
        ...request.consult,
        consultation,
      },
      prescription
    };
  });
};

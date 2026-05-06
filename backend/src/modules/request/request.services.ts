import { prisma } from "../../config/prismaClient";
import { createLaboratoryRequestWithItems } from "../lab/lab.helpers";
import { splitLabTests } from "../lab/lab.utils";
import { CreateRequestProps } from "./request.types";

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
  return prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: {
        patient_id: payload.patient_id,
        req_date: new Date(payload.req_date),
        req_type: payload.req_type as 'CONSULTATION' | 'LABORATORY' | 'CERTIFICATE',
        status: "WAITING",
      },
    });

    if (payload.req_type === "CONSULTATION") {
      const vitals = await tx.vitallSign.create({
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

      const consult = await tx.consultationRequest.create({
        data: {
          req_id: request.req_id,
          vs_id: vitals.vs_id,
          physician: payload.physician,
        },
      });

      return { request, vitals, consult };
    }

    if (payload.req_type === "LABORATORY") {
      // Doctor-side request creation only normalizes the selected tests and
      // hands them off to the lab module. The lab module owns the later
      // morphing/consolidation rules so the workflow stays centralized.
      const normalizedTests = splitLabTests(payload.test.join(", "));

      if (!normalizedTests.length) {
        throw new Error("At least one laboratory test is required.");
      }

      const lab = await createLaboratoryRequestWithItems(tx, {
        reqId: request.req_id,
        requestedBy: payload.req_by,
        tests: normalizedTests,
      });

      return { request, lab };
    }

    if (payload.req_type === "CERTIFICATE") {

      const med = await tx.medicalCertificateRequest.create({
        data: {
          req_id: request.req_id,
          physician: payload.physician,
          purpose: payload.purpose,
        },
        include: {
          certificate: true
        }
      });

      return { request, med };
    }

    throw new Error("Invalid request type");
  });
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
  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findFirst({
      where: {
        req_id: request_id,
      },
      include: {
        cert: {
          include: {
            certificate: true,
          },
        },
        consult: true, // no nested include
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

    return {
      ...request,
      consult: {
        ...request.consult,
        consultation,
      },
    };
  });
};

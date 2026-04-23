import { VitallSign } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { CreateRequestProps } from "./request.types";
import {
  categorizeLabTest,
  splitLabTests,
} from "../lab/lab.utils";

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

    return prevVitals; // ✅ return it
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
      const normalizedTests = splitLabTests(payload.test.join(", "));

      if (!normalizedTests.length) {
        throw new Error("At least one laboratory test is required.");
      }

      const lab = await tx.laboratoryRequest.create({
        data: {
          req_id: request.req_id,
          test: normalizedTests.join(", "),
          req_by: payload.req_by,
        },
      });

      await tx.laboratoryRequestItem.createMany({
        data: normalizedTests.map((test, index) => ({
          laboratory_request_id: lab.id,
          test_id: payload.test_id,
          test_name: test,
          category: categorizeLabTest(test),
          sort_order: index,
        })),
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

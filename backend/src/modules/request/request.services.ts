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
            patient_code: true,
          },
        },
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

export const createRequest = async (payload: any) => {
  const { patient_id, req_type, req_date, req_by, test } = payload;

  return prisma.$transaction(async (tx) => {
    // Create the request
    const request = await tx.request.create({
      data: {
        patient_id,
        req_type,
        status: "WAITING",
        req_date: new Date(req_date),
      },
    });

    // Handle LABORATORY requests
    if (req_type === "LABORATORY") {
      await tx.laboratoryRequest.create({
        data: {
          req_id: request.req_id,
          req_by,
        },
      });

      const consult = await tx.consultationRequest.create({
        data: {
          req_id: request.req_id,
          vs_id: vitals.vs_id,
          physician: payload.physician,
      // Get all services for pricing
      const services = await tx.services.findMany({
        where: {
          is_active: true,
        },
      });

      if (services.length === 0) {
        throw new Error("No services found. Please configure services first.");
      }

      // Calculate total price
      const totalPrice = services.reduce((sum: number, svc: any) => sum + Number(svc.price), 0);

      // Generate billing code
      const billingCount = await tx.billing.count();
      const billingCode = `BILL${new Date().getFullYear()}${String(billingCount + 1).padStart(5, "0")}`;

      const lab = await createLaboratoryRequestWithItems(tx, {
        reqId: request.req_id,
        requestedBy: payload.req_by,
        tests: normalizedTests,
      });

      return { request, lab };
    }

    if (payload.req_type === "CERTIFICATE") {

      const med = await tx.medicalCertificateRequest.create({
      // Create billing
      const billing = await tx.billing.create({
        data: {
          billing_code: billingCode,
          req_id: request.req_id,
          physician: payload.physician,
          purpose: payload.purpose,
          total_price: totalPrice,
          discount: 0,
          date: new Date(),
          status: "PENDING",
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
      // Link services to billing
      await Promise.all(
        services.map((svc) =>
          tx.billingService.create({
            data: {
              billing_id: billing.billing_id,
              service_id: svc.service_id,
              price: svc.price,
            },
          })
        )
      );
    } else if (req_type === "CONSULTATION") {
      // Create consultation request record
      let vitalSigns = await tx.vitallSign.findFirst({
        where: { patient_id },
        orderBy: { created_at: "desc" },
      });

      if (!vitalSigns) {
        vitalSigns = await tx.vitallSign.create({
          data: {
            patient_id,
          },
        });
      }

      await tx.consultationRequest.create({
        data: {
          req_id: request.req_id,
          vs_id: vitalSigns.vs_id,
        },
      });
    }

    return {
      request: {
        req_id: request.req_id,
        req_type,
      },
    };
  });
};

export const getPrevVitalSigns = async (patient_id: number) => {
  const latestRecord = await prisma.patientHistoricalRecord.findFirst({
    where: { patient_id },
    include: { vitals: true },
    orderBy: { created_at: "desc" },
  });

  if (!latestRecord || !latestRecord.vitals) {
    return null;
  }

  return {
    vs_id: latestRecord.vitals.vs_id,
    bp: latestRecord.vitals.bp,
    temp: latestRecord.vitals.temp,
    cr: latestRecord.vitals.cr,
    rr: latestRecord.vitals.rr,
    wt: latestRecord.vitals.wt,
    ht: latestRecord.vitals.ht,
    created_at: latestRecord.created_at,
  };
};

// backend/src/modules/request/request.services.ts
import { prisma } from "../../config/prismaClient";
import { addToQueue } from "../queue/queue.services";

export const createRequest = async (payload: any) => {
  const { patient_id, req_type, req_date, req_by, test } = payload;

  const result = await prisma.$transaction(async (tx) => {
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

      const services = await tx.services.findMany({
        where: { is_active: true },
      });

      if (services.length === 0) {
        throw new Error("No services found. Please configure services first.");
      }

      const totalPrice = services.reduce((sum: number, svc: any) => sum + Number(svc.price), 0);

      const billingCount = await tx.billing.count();
      const billingCode = `BILL${new Date().getFullYear()}${String(billingCount + 1).padStart(5, "0")}`;

      const billing = await tx.billing.create({
        data: {
          billing_code: billingCode,
          req_id: request.req_id,
          total_price: totalPrice,
          discount: 0,
          date: new Date(),
          status: "PENDING",
        },
      });

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
      let vitalSigns = await tx.vitallSign.findFirst({
        where: { patient_id },
        orderBy: { created_at: "desc" },
      });

      if (!vitalSigns) {
        vitalSigns = await tx.vitallSign.create({
          data: { patient_id },
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

  // Add to queue AFTER transaction completes successfully
  await addToQueue(patient_id, req_type as "CONSULTATION" | "LABORATORY");

  return result;
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

export const getAllRegisteredUsers = async () => {
  return prisma.users.findMany({
    where: { is_active: true },
    select: {
      user_id: true,
      name: true,
      username: true,
      license_no: true,
      title: true,
      ptr_no: true,
      roles: {
        select: {
          role: {
            select: {
              role_id: true,
              role_name: true,
            },
          },
        },
      },
    },
  });
};

export const getRequestData = async (requestId: number) => {
  const request = await prisma.request.findUnique({
    where: { req_id: requestId },
    include: {
      patient: true,
      consult: {
        include: {
          vitals: true,
          doctor: true,
          consultations: true,
        },
      },
      laboratory: {
        include: {
          items: {
            include: {
              test: true,
            },
          },
        },
      },
      medical_certificate: {
        include: {
          doctor: true,
          certificate: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  return request;
};
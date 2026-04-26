// backend/src/modules/request/request.services.ts
import { prisma } from "../../config/prismaClient";
import { addToQueue } from "../queue/queue.services";

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

  const result = await prisma.$transaction(async (tx) => {
    // Create the request
    const request = await tx.request.create({
      data: {
        patient_id: payload.patient_id,
        req_date: new Date(payload.req_date),
        req_type: payload.req_type as 'CONSULTATION' | 'LABORATORY' | 'CERTIFICATE',
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

  // Add to queue AFTER transaction completes successfully
  await addToQueue(patient_id, req_type as "CONSULTATION" | "LABORATORY");

  return result;
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

    return {
      ...request,
      consult: {
        ...request.consult,
        consultation,
      },
    };
  });
};

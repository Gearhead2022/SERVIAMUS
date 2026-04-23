import { prisma } from "../../config/prismaClient";

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

      // Create billing
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
import { prisma } from "../../config/prismaClient";
import { addToQueue } from "../queue/queue.services";
import { createLaboratoryRequestWithItems } from "../lab/lab.helpers";
import { splitLabTests } from "../lab/lab.utils";
import { CreateRequestProps, Status } from "./request.types";
import { QueueStatus, RequestType } from "@prisma/client";
import { Prisma } from "@prisma/client";

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

    const requestCode = `PR${request.req_id.toString().padStart(5, "0")}`;

    await tx.request.update({
      where: { req_id: request.req_id },
      data: { request_code: requestCode },
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

    if (payload.purpose === "Medical Assistance") {
      await prisma.patients.update({
        where: {
          patient_id: payload.patient_id,
        },
        data: {
          last_medical_assistance_year: new Date().getFullYear(),
        },
      });
    }

    const med = await prisma.medicalCertificateRequest.create({
      data: {
        req_id: result.req_id,
        physician: payload.physician,
        purpose: payload.purpose,
      },
      include: {
        certificate: true,
      },
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


export const getAllRequests = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  req_type?: String,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {

  const requestWhere: Prisma.RequestWhereInput = {};

  const fromDate =
    dateFrom ? new Date(dateFrom) : null;

  const toDate =
    dateTo ? new Date(`${dateTo}T23:59:59`) : null;

  if (search?.trim()) {
    requestWhere.OR = [
      {
        patient: {
          name: {
            contains: search,
          },
        },
      },
    ];
  }

  // BILLING FILTERS


  if (status && status !== "ALL") {
    requestWhere.status = status as Status;
  }

  if (req_type && req_type !== "ALL") {
    requestWhere.req_type = req_type as RequestType;
  }

  // DATE RANGE
  if (fromDate || toDate) {

    requestWhere.req_date = {};

    if (
      fromDate &&
      !isNaN(fromDate.getTime())
    ) {
      requestWhere.req_date.gte = fromDate;
    }

    if (
      toDate &&
      !isNaN(toDate.getTime())
    ) {
      requestWhere.req_date.lte = toDate;
    }
  }

  // SORTING
  let orderBy: Prisma.RequestOrderByWithRelationInput = {
    req_date: "desc",
  };

  switch (sort) {
    case "date_asc":
      orderBy = { req_date: "asc" };
      break;

    case "date_desc":
      orderBy = { req_date: "desc" };
      break;

    case "amount_asc":
      orderBy = { req_date: "asc" };
      break;

    case "amount_desc":
      orderBy = { req_date: "desc" };
      break;
  }


  const requests = await prisma.request.findMany({
    where: requestWhere,

    skip: (page - 1) * limit,

    take: limit,

    orderBy: {
      req_date: "desc",
    },

    select: {
      req_id: true,
      req_date: true,
      req_type: true,
      status: true,

      patient: {
        select: {
          patient_id: true,
          patient_code: true,
          name: true,
          address: true,
          contact_number: true,
          birth_date: true,
          sex: true,
          age: true,
          religion: true,
          philhealth_id: true,
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

      consult: {
        select: {
          cons_id: true,
          physician: true,
          vitals: {
            select: {
              bp: true,
              temp: true,
              cr: true,
              rr: true,
              wt: true,
              ht: true,
            }
          }
        },
      },

      cert: {
        select: {
          mcr_id: true,
          physician: true,
          purpose: true,
        },
      },
    },
  });

  const total = await prisma.request.count({
    where: requestWhere,
  });

  return {
    data: requests,

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const deleteRequest = async (
  requestId: number,
) => {

  return prisma.request.delete({
    where: {
      req_id: requestId,
    },
  });
};

export const updateConsultationRequest = async (
  req_id: number,
  payload: CreateRequestProps
) => {

  return prisma.$transaction(async (tx) => {

    // UPDATE REQUEST
    const request = await tx.request.update({
      where: {
        req_id,
      },

      data: {
        req_date: new Date(payload.req_date),
        updated_at: new Date(),
      },
    });

    // FIND CONSULT REQUEST
    const consultRequest =
      await tx.consultationRequest.findUnique({
        where: {
          req_id,
        },
      });

    if (!consultRequest) {
      throw new Error(
        "Consultation request not found."
      );
    }

    // UPDATE VITALS
    const vitals = await tx.vitallSign.update({
      where: {
        vs_id: consultRequest.vs_id,
      },

      data: {
        bp: payload.bp ?? null,
        temp: payload.temp ?? null,
        cr: payload.cr ?? null,
        rr: payload.rr ?? null,
        wt: payload.wt ?? null,
        ht: payload.ht ?? null,
      },
    });

    // UPDATE CONSULT REQUEST
    const consult =
      await tx.consultationRequest.update({
        where: {
          cons_id:
            consultRequest.cons_id,
        },

        data: {
          physician:
            payload.physician,
        },
      });

    return {
      result: request,
      vitals,
      consult
    };
  });
};

export const updateLaboratoryRequest = async (
  req_id: number,
  payload: CreateRequestProps
) => {

  return prisma.$transaction(async (tx) => {

    // UPDATE REQUEST
    const request = await tx.request.update({
      where: {
        req_id,
      },

      data: {
        req_date: new Date(payload.req_date),
        updated_at: new Date(),
      },
    });

    // FIND LAB REQUEST
    const lab =
      await tx.laboratoryRequest.findUnique({
        where: {
          req_id,
        },

        include: {
          items: true,
        },
      });

    if (!lab) {
      throw new Error(
        "Laboratory request not found."
      );
    }

    const normalizedTests =
      splitLabTests(
        payload.test.join(", ")
      );

    if (!normalizedTests.length) {
      throw new Error(
        "At least one laboratory test is required."
      );
    }

    // DELETE OLD ITEMS
    await tx.laboratoryRequestItem.deleteMany({
      where: {
        laboratory_request_id: lab.id,
      },
    });

    // GET TEST REFERENCES
    const tests = await tx.laboratoryTest.findMany({
      where: {
        name: {
          in: normalizedTests,
        },
      },
    });

    // CREATE NEW ITEMS
    await tx.laboratoryRequestItem.createMany({
      data: tests.map((test) => ({
        laboratory_request_id: lab.id,
        test_id: test.test_id,
        status: "QUEUED",
      })),
    });

    return {
      result: request,
      lab
    };
  });
};

export const updateCertificateRequest = async (
  req_id: number,
  payload: CreateRequestProps
) => {

  return prisma.$transaction(async (tx) => {

    // UPDATE REQUEST
    const request = await tx.request.update({
      where: {
        req_id,
      },

      data: {
        req_date: new Date(payload.req_date),
        updated_at: new Date(),
      },
    });

    // UPDATE MEDICAL ASSISTANCE YEAR
    if (
      payload.purpose ===
      "Medical Assistance"
    ) {

      await tx.patients.update({
        where: {
          patient_id:
            payload.patient_id,
        },

        data: {
          last_medical_assistance_year:
            new Date().getFullYear(),
        },
      });
    }

    // UPDATE CERTIFICATE
    const med =
      await tx.medicalCertificateRequest.update({
        where: {
          req_id,
        },

        data: {
          physician:
            payload.physician,

          purpose:
            payload.purpose,
        },

        include: {
          certificate: true,
        },
      });

    return {
      result: request,
      med
    };
  });
};

export const updateRequest = async (
  req_id: number,
  payload: CreateRequestProps
) => {

  console.log('services', payload.req_type)
  switch (payload.req_type) {

    case "CONSULTATION":
      return updateConsultationRequest(
        req_id,
        payload
      );

    case "LABORATORY":
      return updateLaboratoryRequest(
        req_id,
        payload
      );

    case "CERTIFICATE":
      return updateCertificateRequest(
        req_id,
        payload
      );

    default:
      throw new Error(
        "Invalid request type"
      );
  }
};
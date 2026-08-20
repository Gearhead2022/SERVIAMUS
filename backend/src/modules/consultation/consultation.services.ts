import { prisma } from "../../config/prismaClient";
import { CreateFollowupPayload, FollowupConsultationProps, FollowupWithRelations, MedicalCertificatePayload, PatientConsultationRecordsPayload, PrescriptionPayload, WeeklyTally } from "./consultation.types";
import { PrescriptionItem, RequestStatus, RequestType } from "@prisma/client";
import { getConsultationFromRequest, mapRequestToQueueStatus } from "./consultation.helper";
import { Prisma } from "@prisma/client";
import { hasQueueTable } from "../queue/queue.services";
import { ensureBillingForRequest } from "./consultation.helper";
import { getIO } from "../../socket";
import { Status } from "../request/request.types";
/**
 * CONSULTATION RECORDS
 */

const requestUpdateRooms = [
  "role_ADMIN",
  "role_CASHIER",
  "role_LAB",
  "role_LABORATORY",
  "role_STAFF",
] as const;

export const createConsultationResult = async (
  payload: PatientConsultationRecordsPayload
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Get latest vitals
    const vitals = await tx.vitallSign.findFirst({
      where: { patient_id: payload.patient_id },
      orderBy: { vs_id: "desc" },
      select: {
        vs_id: true,
      },
    });

    if (!vitals) {
      throw new Error("No vitals found for this patient");
    }

    const records = await tx.consultationRecords.upsert({
      where: { patient_id: payload.patient_id },
      update: {
        pmh_allergy: payload.pmh_allergy ?? false,
        pmh_admission: payload.pmh_admission ?? false,
        pmh_others: payload.pmh_others ?? false,
        pmh_others_text: payload.pmh_others_text ?? null,

        fh_htn: payload.fh_htn ?? false,
        fh_dm: payload.fh_dm ?? false,
        fh_ba: payload.fh_ba ?? false,
        fh_cancer: payload.fh_cancer ?? false,
        fh_others: payload.fh_others ?? false,
        fh_others_text: payload.fh_others_text ?? null,

        ob_score: payload.ob_score ?? null,
        ob_nvsd: payload.ob_nvsd ?? false,
        ob_cs: payload.ob_cs ?? false,

        menarche: payload.menarche ?? null,
        interval: payload.interval ?? null,
        duration: payload.duration ?? null,
        amount: payload.amount ?? null,
        ob_symptoms: payload.ob_symptoms ?? null,

        cigarette_use: payload.cigarette_use ?? false,
        alcohol_use: payload.alcohol_use ?? false,
        drug_use: payload.drug_use ?? false,
        exercise: payload.exercise ?? false,
        hygiene_prac: payload.hygiene_prac ?? false,
        coffee_cons: payload.coffee_cons ?? false,
        soda_cons: payload.soda_cons ?? false,

        sh_allergy: payload.sh_allergy ?? false,
        sh_admission: payload.sh_admission ?? false,

        travel_history: payload.travel_history ?? null,
        diet: payload.diet ?? null,
        stress: payload.stress ?? null,
        occupation: payload.occupation ?? null,
      },
      create: {
        patient_id: payload.patient_id,

        pmh_allergy: payload.pmh_allergy ?? false,
        pmh_admission: payload.pmh_admission ?? false,
        pmh_others: payload.pmh_others ?? false,
        pmh_others_text: payload.pmh_others_text ?? null,

        fh_htn: payload.fh_htn ?? false,
        fh_dm: payload.fh_dm ?? false,
        fh_ba: payload.fh_ba ?? false,
        fh_cancer: payload.fh_cancer ?? false,
        fh_others: payload.fh_others ?? false,
        fh_others_text: payload.fh_others_text ?? null,

        ob_score: payload.ob_score ?? null,
        ob_nvsd: payload.ob_nvsd ?? false,
        ob_cs: payload.ob_cs ?? false,

        menarche: payload.menarche ?? null,
        interval: payload.interval ?? null,
        duration: payload.duration ?? null,
        amount: payload.amount ?? null,
        ob_symptoms: payload.ob_symptoms ?? null,

        cigarette_use: payload.cigarette_use ?? false,
        alcohol_use: payload.alcohol_use ?? false,
        drug_use: payload.drug_use ?? false,
        exercise: payload.exercise ?? false,
        hygiene_prac: payload.hygiene_prac ?? false,
        coffee_cons: payload.coffee_cons ?? false,
        soda_cons: payload.soda_cons ?? false,

        sh_allergy: payload.sh_allergy ?? false,
        sh_admission: payload.sh_admission ?? false,

        travel_history: payload.travel_history ?? null,
        diet: payload.diet ?? null,
        stress: payload.stress ?? null,
        occupation: payload.occupation ?? null,
      },
    });

    const consultation = await tx.consultation.create({
      data: {
        cons_id: payload.cons_id,
        phr_id: records.phr_id,
        patient_id: payload.patient_id,
        vs_id: vitals.vs_id,
        consultation_date: new Date(payload.consultation_date),

        chief_complaint: payload.chief_complaint,
        hist_illness: payload.hist_illness,

        examination: payload.examination ?? null,
        assessment: payload.assessment ?? null,
        plans: payload.plans ?? null,

        follow_up_date: payload.follow_up_date
          ? new Date(payload.follow_up_date)
          : null,
      },
    });

    return consultation;
  });
};

export const getAllRequests = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  req_type?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {

  const where: Prisma.RequestWhereInput = {
    req_type: {
      not: "LABORATORY",
    },
  };

  const andConditions: Prisma.RequestWhereInput[] = [];

  // SEARCH
  if (search?.trim()) {
    andConditions.push({
      OR: [
        {
          patient: {
            name: {
              contains: search,
            },
          },
        },
        {
          request_code: {
            contains: search,
          },
        },
      ],
    });
  }

  if (status && status !== "ALL") {
    where.status = status as Status;
  }

  if (req_type && req_type !== "ALL") {
    where.req_type = req_type as RequestType;
  }

  if (dateFrom || dateTo) {

    const reqDate: Prisma.DateTimeFilter = {};

    if (dateFrom) {
      reqDate.gte = new Date(dateFrom);
    }

    if (dateTo) {
      const endDate = new Date(dateTo);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      reqDate.lte = endDate;
    }

    andConditions.push({
      req_date: reqDate,
    });

  } else if (!status || status === "ALL") {

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    andConditions.push({
      OR: [
        {
          status: {
            in: ["WAITING", "SERVING"],
          },
        },
        {
          req_date: {
            gte: startOfDay,
          },
        },
        {
          status: "DONE",
          updated_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      ],
    });
  }

  // DATE FILTER
  if (!dateFrom && !dateTo && (!status || status === "ALL")) {

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    andConditions.push({
      OR: [
        {
          status: {
            in: ["WAITING", "SERVING"],
          },
        },
        {
          req_date: {
            gte: startOfDay,
          },
        },
        {
          status: "DONE",
          updated_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      ],
    });
  }

  // SORTING
  let orderBy:
    Prisma.RequestOrderByWithRelationInput =
  {
    req_date: "desc",
  };

  switch (sort) {

    case "date_asc":
      orderBy = {
        req_date: "asc",
      };
      break;

    case "date_desc":
      orderBy = {
        req_date: "desc",
      };
      break;

    case "patient_asc":
      orderBy = {
        patient: {
          name: "asc",
        },
      };
      break;

    case "patient_desc":
      orderBy = {
        patient: {
          name: "desc",
        },
      };
      break;
  }

  if (andConditions.length) {
    where.AND = andConditions;
  }

  const [
    total,
    waiting,
    serving,
    completed,
    cancelled,
  ] = await Promise.all([
    prisma.request.count({
      where,
    }),

    prisma.request.count({
      where: {
        AND: [
          where,
          {
            status: "WAITING",
          },
        ],
      },
    }),

    prisma.request.count({
      where: {
        AND: [
          where,
          {
            status: "SERVING",
          },
        ],
      },
    }),

    prisma.request.count({
      where: {
        AND: [
          where,
          {
            status: "DONE",
          },
        ],
      },
    }),

    prisma.request.count({
      where: {
        AND: [
          where,
          {
            status: "CANCELED",
          },
        ],
      },
    }),

  ]);

  const requests =
    await prisma.request.findMany({

      where,

      skip:
        (page - 1) * limit,

      take: limit,

      orderBy,

      select: {
        req_id: true,
        request_code: true,
        req_date: true,
        req_type: true,
        status: true,
        created_at: true,

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
            req_id: true,
            physician: true,
            vs_id: true,
            doctor: true,
            is_follow_up: true,

            initialConsultation: {
              include: {
                consultationFollowUps: {
                  orderBy: {
                    follow_up_date: "desc",
                  },
                  take: 1,
                },
              },
            },

            consultation: {
              include: {
                consultationFollowUps: {
                  orderBy: {
                    follow_up_date: "desc",
                  },
                  take: 1,
                },
              },
            },

            vitals: {
              select: {
                bp: true,
                temp: true,
                cr: true,
                rr: true,
                wt: true,
                ht: true,
              },
            },
          },
        },

        cert: {
          select: {
            mcr_id: true,
            req_id: true,
            physician: true,
            purpose: true,
            doctor: true,
            certificate: true,
          },
        },
      },
    });

  // console.log('all request', requests)

  return {
    data: requests,

    stats: {
      total,
      waiting,
      serving,
      completed,
      cancelled,
    },

    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

export const requestAction = async (
  requestId: number,
  status: RequestStatus
) => {
  return prisma.$transaction(async (tx) => {
    const result = await tx.request.findUnique({
      where: { req_id: requestId },
    });

    // const userIds = await resolveNotificationUsers(result);

    const io = getIO();

    io.to([...requestUpdateRooms]).emit("request:updated");

    if (!result) {
      throw new Error("Request not found");
    }

    if (!["SERVING", "CANCELED", "DONE"].includes(status)) {
      throw new Error("Invalid status transition");
    }

    const updated = await tx.request.update({
      where: { req_id: requestId },
      data: {
        status,
      },
      include: {
        patient: {
          select: {
            patient_code: true,
            patient_id: true,
          },
        },
      },
    });


    const queueStatus = mapRequestToQueueStatus(status);

    if (queueStatus && await hasQueueTable(tx)) {
      await tx.queue.updateMany({
        where: { req_id: requestId },
        data: {
          status: queueStatus,
          ...(status === "SERVING" && { serving_at: new Date() }),
          ...(status === "DONE" && { completed_at: new Date() }),
        },
      });
    }

    if (status === 'DONE') {
      const billing = await ensureBillingForRequest(tx, requestId, new Date(), result.req_type);
      if (!billing) throw new Error("Billing failed");
    }

    return updated;
  });
};

export const consultationRecords = async (patient_id: number, request_id: number) => {

  return prisma.$transaction(async (tx) => {

    const baseline = await tx.consultationRecords.findUnique({
      where: { patient_id },
    });

    const consultation = await tx.consultation.findFirst({
      where: {
        patient_id,
        consultRequest: {
          req_id: request_id
        }
      },
      orderBy: { consultation_id: "desc" },
      include: {
        patient: true,
        vitals: true,
      },
    });

    if (!consultation) return baseline || null;

    return {
      consultation_id: consultation.consultation_id,
      consultation_date: consultation.consultation_date,
      chief_complaint: consultation.chief_complaint,
      hist_illness: consultation.hist_illness,
      examination: consultation.examination,
      assessment: consultation.assessment,
      plans: consultation.plans,
      follow_up_date: consultation.follow_up_date,

      bp: consultation.vitals?.bp,
      temp: consultation.vitals?.temp,
      cr: consultation.vitals?.cr,
      rr: consultation.vitals?.rr,
      wt: consultation.vitals?.wt,
      ht: consultation.vitals?.ht,

      ...baseline,
    };
  });
};

export const getStatistics = async () => {
  return prisma.$transaction(async (tx) => {

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const totalPatients = await tx.patients.count();

    const totalConsultationRequest = await tx.request.count({
      where: {
        req_type: 'CONSULTATION',
        req_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalPendingRequest = await tx.request.count({
      where: {
        req_type: "CONSULTATION",
        status: "SERVING",
        req_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalNewPatient = await tx.patients.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return {
      totalNewPatient,
      totalPendingRequest,
      totalConsultationRequest,
      totalPatients,
    };
  });
};

export const createPresciptions = async (payload: PrescriptionPayload) => {
  console.log("Prescription payload:", payload);
  return prisma.$transaction(async (tx) => {
    const prescription = await tx.prescription.create({
      data: {
        consultation_id: payload.consultation_id,
        followup_id: payload.followup_id ?? null,
        patient_id: payload.patient_id,
        doctor_id: payload.doctor_id,
        gen_notes: payload.gen_notes,
        issued_date: payload.issued_date,

        medicines: {
          create: payload.medicines.map((m) => ({
            medicine_name: m.medicine_name,
            strength: m.strength,
            brand_name: m.brand_name,
            quantity: m.quantity,
            instruction: m.instruction,
          })),
        },
      },
      include: {
        medicines: true, // optional but useful
      },
    });

    return prescription;
  });
};

// STAFF DOCTOR HISTORY

export const getAllPatientConsultationRecord = async (
  patient_id: number,
  search?: string,
  page = 1,
  limit = 10,
) => {
  const where = {
      patient_id,

      ...(search && {
        OR: [
          { chief_complaint: { contains: search } },
          { hist_illness: { contains: search } },
          { examination: { contains: search } },
          { assessment: { contains: search } },
          { plans: { contains: search } },
        ],
      }),
    };
  const [total, consultations] = await prisma.$transaction([
    prisma.consultation.count({ where }),
    prisma.consultation.findMany({
    where: {
      patient_id,

      ...(search && {
        OR: [
          { chief_complaint: { contains: search } },
          { hist_illness: { contains: search } },
          { examination: { contains: search } },
          { assessment: { contains: search } },
          { plans: { contains: search } },
        ],
      }),
    },

    orderBy: { consultation_id: "desc" },
    skip: (page - 1) * limit,
    take: limit,

    include: {
      patient: true,
      vitals: true,
      consultRequest: {
        include: {
          request: true,
        },
      },
      prescriptions: {
        include: {
          medicines: true,
        },
      },
    },
  }),
  ]);

  const baseline = await prisma.consultationRecords.findUnique({
    where: { patient_id },
  });

  const pota = consultations.map((c) => ({
    consultation: {
      name: c.patient.name,
      consultation_id: c.consultation_id,
      consultation_date: c.consultation_date,
      chief_complaint: c.chief_complaint,
      hist_illness: c.hist_illness,
      examination: c.examination,
      assessment: c.assessment,
      plans: c.plans,
      follow_up_date: c.follow_up_date,

      bp: c.vitals?.bp,
      temp: c.vitals?.temp,
      cr: c.vitals?.cr,
      rr: c.vitals?.rr,
      wt: c.vitals?.wt,
      ht: c.vitals?.ht,

      ...baseline,
    },
    prescription: c.prescriptions?.[0] ?? null,
    consultationRequest: c.consultRequest
  }));
  // console.log('ywaw', pota)

  return { data: pota, pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
};

export const getAllPatientMedCertRecord = async (
  patient_id: number,
  search?: string,
  page = 1,
  limit = 10,
) => {
  const where = {
      patient_id,

      ...(search && {
        OR: [
          { purpose: { contains: search } },
        ],
      }),
    };
  const [total, certificates] = await prisma.$transaction([
    prisma.medicalCertificateResult.count({ where }),
    prisma.medicalCertificateResult.findMany({
    where: {
      patient_id,

      ...(search && {
        OR: [
          { purpose: { contains: search } },
        ],
      }),
    },

    orderBy: { med_cert_id: "desc" },
    skip: (page - 1) * limit,
    take: limit,

    include: {
      patient: true,
      med_cert_request: {
        include: {
          request: true
        }
      },
    }
  }),
  ]);

  return { data: certificates.map((c) => ({
    medCert: {
      med_cert_id: c.med_cert_id,
      mcr_id: c.mcr_id,
      patient_id: c.patient_id,
      purpose: c.purpose,
      impression: c.impression,
      recommendation: c.recommendation,
      result_date: c.result_date,
    },
    medCertRequest: c.med_cert_request
  })), pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
};

export const getPatientPrescription = async (consultation_id: number) => {
  return prisma.$transaction(async (tx) => {
    const data = await tx.prescription.findFirst({
      where: { consultation_id },
      select: {
        presc_id: true,
        consultation_id: true,
        patient_id: true,
        doctor_id: true,
        gen_notes: true,
        medicines: {
          select: {
            item_id: true,
            medicine_name: true,
            strength: true,
            brand_name: true,
            quantity: true,
            instruction: true,
          }
        }

      }
    });

    return data;
  })
}

export const consultationRecordsByRequest = async (consultation_id: number) => {
  return prisma.$transaction(async (tx) => {

    const consultation = await tx.consultation.findFirst({
      where: { consultation_id },
      orderBy: { consultation_id: "desc" },
      include: {
        patient: true,
        vitals: true,
      },
    });

    if (!consultation) return null;

    const baseline = consultation.phr_id
      ? await tx.consultationRecords.findUnique({
        where: { phr_id: consultation.phr_id },
      })
      : null;

    return {
      consultation_id: consultation.consultation_id,
      consultation_date: consultation.consultation_date,
      chief_complaint: consultation.chief_complaint,
      hist_illness: consultation.hist_illness,
      examination: consultation.examination,
      assessment: consultation.assessment,
      plans: consultation.plans,
      follow_up_date: consultation.follow_up_date,

      bp: consultation.vitals?.bp,
      temp: consultation.vitals?.temp,
      cr: consultation.vitals?.cr,
      rr: consultation.vitals?.rr,
      wt: consultation.vitals?.wt,
      ht: consultation.vitals?.ht,

      ...(baseline ?? {}),
    };
  });
};

export const consultationRecordHistory = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string,
) => {

  const where: Prisma.ConsultationWhereInput = {};

  // SEARCH
  if (search?.trim()) {

    where.OR = [
      {
        patient: {
          name: {
            contains: search,
          },
        },
      },
      {
        consultRequest: {
          request: {
            request_code: {
              contains: search,
            },
          },
        },
      },
    ];
  }

  // STATUS
  if (
    status &&
    status !== "ALL"
  ) {

    where.consultRequest = {
      request: {
        status:
          status as Status,
      },
    };

  } else {

    where.consultRequest = {
      request: {
        status: {
          in: [
            "DONE",
            "CANCELED",
          ],
        },
      },
    };
  }

  // DATE RANGE
  if (dateFrom || dateTo) {

    where.consultation_date = {};

    if (dateFrom) {
      where.consultation_date.gte =
        new Date(dateFrom);
    }

    if (dateTo) {

      const endDate =
        new Date(dateTo);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      where.consultation_date.lte =
        endDate;
    }
  }

  const [
    total,
    waiting,
    serving,
    completed,
    cancelled,
  ] = await Promise.all([

    prisma.consultation.count({
      where,
    }),

    prisma.consultation.count({
      where: {
        ...where,
        consultRequest: {
          request: {
            status: "WAITING",
          },
        },
      },
    }),

    prisma.consultation.count({
      where: {
        ...where,
        consultRequest: {
          request: {
            status: "SERVING",
          },
        },
      },
    }),

    prisma.consultation.count({
      where: {
        ...where,
        consultRequest: {
          request: {
            status: "DONE",
          },
        },
      },
    }),

    prisma.consultation.count({
      where: {
        ...where,
        consultRequest: {
          request: {
            status: "CANCELED",
          },
        },
      },
    }),
  ]);

  // SORTING
  let orderBy:
    Prisma.ConsultationOrderByWithRelationInput =
  {
    consultation_id: "desc",
  };

  switch (sort) {

    case "date_asc":
      orderBy = {
        consultation_date: "asc",
      };
      break;

    case "date_desc":
      orderBy = {
        consultation_date: "desc",
      };
      break;

    case "patient_asc":
      orderBy = {
        patient: {
          name: "asc",
        },
      };
      break;

    case "patient_desc":
      orderBy = {
        patient: {
          name: "desc",
        },
      };
      break;
  }

  const consultations =
    await prisma.consultation.findMany({

      where,

      skip:
        (page - 1) * limit,

      take: limit,

      orderBy,

      include: {
        patient: true,

        vitals: true,

        consultRequest: {
          include: {
            request: true,

            doctor: {
              select: {
                user_id: true,
                name: true,
                title: true,
                license_no: true,
                ptr_no: true,
              },
            },
          },
        },
        prescriptions: {
          include: {
            medicines: true,
          },
        },
      },
    });

  const phrIds =
    consultations
      .map((c) => c.phr_id)
      .filter(Boolean) as number[];

  const baselines =
    await prisma.consultationRecords.findMany({
      where: {
        phr_id: {
          in: phrIds,
        },
      },
    });

  const baselineMap =
    new Map(
      baselines.map((b) => [
        b.phr_id,
        b,
      ])
    );

  const data =
    consultations.map((c) => ({

      consultation: {
        consultation_id:
          c.consultation_id,

        consultation_date:
          c.consultation_date,

        chief_complaint:
          c.chief_complaint,

        hist_illness:
          c.hist_illness,

        examination:
          c.examination,

        assessment:
          c.assessment,

        plans:
          c.plans,

        follow_up_date:
          c.follow_up_date,

        bp: c.vitals?.bp,
        temp: c.vitals?.temp,
        cr: c.vitals?.cr,
        rr: c.vitals?.rr,
        wt: c.vitals?.wt,
        ht: c.vitals?.ht,

        ...(c.phr_id
          ? baselineMap.get(c.phr_id)
          : {}),
      },

      patient: {
        patient_id:
          c.patient.patient_id,
        name:
          c.patient.name,

        address:
          c.patient.address,

        contact_number:
          c.patient.contact_number,

        birth_date:
          c.patient.birth_date,

        sex:
          c.patient.sex,

        age:
          c.patient.age,

        religion:
          c.patient.religion,
      },

      request: {
        req_id:
          c.consultRequest.request.req_id,

        patient_id:
          c.consultRequest.request.patient_id,

        req_date:
          c.consultRequest.request.req_date,

        req_type:
          c.consultRequest.request.req_type,

        status:
          c.consultRequest.request.status,
      },
      consultationRequest: {
        cons_id: c.consultRequest.cons_id,
        vs_id: c.consultRequest.vs_id,
        physician: c.consultRequest.physician,
        doctor: c.consultRequest.doctor
          ? {
            user_id: c.consultRequest.doctor.user_id,
            name: c.consultRequest.doctor.name,
            title: c.consultRequest.doctor.title,
            license_no: c.consultRequest.doctor.license_no,
            ptr_no: c.consultRequest.doctor.ptr_no,
          }
          : null,
      },
      prescription: c.prescriptions[0]

    }));

  return {
    data,

    stats: {
      total,
      waiting,
      serving,
      completed,
      cancelled,
    },

    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

export const prescriptionRecordHistory = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {

  const where: Prisma.PrescriptionWhereInput = {};

  // SEARCH
  if (search?.trim()) {

    where.OR = [
      {
        patient: {
          name: {
            contains: search,
          },
        },
      },
      {
        consultation: {
          consultRequest: {
            request: {
              request_code: {
                contains: search,
              },
            },
          },
        },
      },
    ];
  }

  // STATUS
  if (
    status &&
    status !== "ALL"
  ) {

    where.consultation = {
      consultRequest: {
        request: {
          status:
            status as Status,
        },
      },
    };

  } else {

    where.consultation = {
      consultRequest: {
        request: {
          status: {
            in: [
              "DONE",
              "CANCELED",
            ],
          },
        },
      },
    };
  }

  const [
    total,
    waiting,
    serving,
    completed,
    cancelled,
  ] = await Promise.all([

    prisma.prescription.count({
      where,
    }),

    prisma.prescription.count({
      where: {
        ...where,
        consultation: {
          consultRequest: {
            request: {
              status: "WAITING",
            },
          },
        },
      },
    }),

    prisma.prescription.count({
      where: {
        ...where,
        consultation: {
          consultRequest: {
            request: {
              status: "SERVING",
            },
          },
        },
      },
    }),

    prisma.prescription.count({
      where: {
        ...where,
        consultation: {
          consultRequest: {
            request: {
              status: "DONE",
            },
          },
        },
      },
    }),

    prisma.prescription.count({
      where: {
        ...where,
        consultation: {
          consultRequest: {
            request: {
              status: "CANCELED",
            },
          },
        },
      },
    }),
  ]);

  // DATE RANGE
  if (dateFrom || dateTo) {

    where.issued_date = {};

    if (dateFrom) {
      where.issued_date.gte =
        new Date(dateFrom);
    }

    if (dateTo) {

      const endDate =
        new Date(dateTo);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      where.issued_date.lte =
        endDate;
    }
  }

  // SORTING
  let orderBy:
    Prisma.PrescriptionOrderByWithRelationInput =
  {
    presc_id: "desc",
  };

  switch (sort) {

    case "date_asc":
      orderBy = {
        issued_date: "asc",
      };
      break;

    case "date_desc":
      orderBy = {
        issued_date: "desc",
      };
      break;

    case "patient_asc":
      orderBy = {
        patient: {
          name: "asc",
        },
      };
      break;

    case "patient_desc":
      orderBy = {
        patient: {
          name: "desc",
        },
      };
      break;
  }

  const prescriptions =
    await prisma.prescription.findMany({

      where,

      skip:
        (page - 1) * limit,

      take: limit,

      orderBy,

      include: {

        patient: true,

        medicines: true,

        consultation: {
          include: {
            consultRequest: {
              include: {
                request: true,
                doctor: {
                  select: {
                    user_id: true,
                    name: true,
                    title: true,
                    license_no: true,
                    ptr_no: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  const data =
    prescriptions.map((c) => ({

      prescription: {
        presc_id:
          c.presc_id,

        consultation_id:
          c.consultation_id,

        patient_id:
          c.patient_id,

        doctor_id:
          c.doctor_id,

        gen_notes:
          c.gen_notes,

        issued_date:
          c.issued_date,

        medicines:
          c.medicines.map((m) => ({
            item_id:
              m.item_id,

            medicine_name:
              m.medicine_name,

            strength:
              m.strength,

            brand_name:
              m.brand_name,

            instruction:
              m.instruction,
          })),
      },

      patient: {
        patient_id:
          c.patient.patient_id,
        name:
          c.patient.name,

        address:
          c.patient.address,

        contact_number:
          c.patient.contact_number,

        birth_date:
          c.patient.birth_date,

        sex:
          c.patient.sex,

        age:
          c.patient.age,

        religion:
          c.patient.religion,
      },

      request: {
        req_id:
          c.consultation
            .consultRequest
            .request
            .req_id,

        patient_id:
          c.consultation
            .consultRequest
            .request
            .patient_id,

        req_date:
          c.consultation
            .consultRequest
            .request
            .req_date,

        req_type:
          c.consultation
            .consultRequest
            .request
            .req_type,

        status:
          c.consultation
            .consultRequest
            .request
            .status,
      },

      consultation: {
        consultation_id:
          c.consultation
            .consultation_id,

        consultation_date:
          c.consultation
            .consultation_date,

        chief_complaint:
          c.consultation
            .chief_complaint,

        hist_illness:
          c.consultation
            .hist_illness,

        examination:
          c.consultation
            .examination,

        assessment:
          c.consultation
            .assessment,

        plans:
          c.consultation
            .plans,

        follow_up_date:
          c.consultation
            .follow_up_date,

        doctor: c.consultation.consultRequest.doctor
          ? {
            user_id: c.consultation.consultRequest.doctor.user_id,
            name: c.consultation.consultRequest.doctor.name,
            title: c.consultation.consultRequest.doctor.title,
            license_no: c.consultation.consultRequest.doctor.license_no,
            ptr_no: c.consultation.consultRequest.doctor.ptr_no,
          }
          : null,
      },

    }));

  return {
    data,

    stats: {
      total,
      waiting,
      serving,
      completed,
      cancelled,
    },

    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

export const medicalCertificateRecordHistory = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {

  const where:
    Prisma.MedicalCertificateResultWhereInput =
    {};

  // SEARCH
  if (search?.trim()) {

    where.OR = [
      {
        patient: {
          name: {
            contains: search,
          },
        },
      },
      {
        med_cert_request: {
          request: {
            request_code: {
              contains: search,
            },
          },
        },
      },
    ];
  }

  // STATUS
  if (
    status &&
    status !== "ALL"
  ) {

    where.med_cert_request = {
      request: {
        status:
          status as Status,
      },
    };

  } else {

    where.med_cert_request = {
      request: {
        status: {
          in: [
            "DONE",
            "CANCELED",
          ],
        },
      },
    };
  }

  const [
    total,
    waiting,
    serving,
    completed,
    cancelled,
  ] = await Promise.all([

    prisma.medicalCertificateResult.count({
      where,
    }),

    prisma.medicalCertificateResult.count({
      where: {
        ...where,
        med_cert_request: {
          request: {
            status: "WAITING",
          },
        },

      },
    }),

    prisma.medicalCertificateResult.count({
      where: {
        ...where,
        med_cert_request: {
          request: {
            status: "SERVING",
          },
        },
      },
    }),

    prisma.medicalCertificateResult.count({
      where: {
        ...where,
        med_cert_request: {
          request: {
            status: "DONE",
          },
        },
      },
    }),

    prisma.medicalCertificateResult.count({
      where: {
        ...where,
        med_cert_request: {
          request: {
            status: "CANCELED",
          },
        },
      },
    }),
  ]);


  // DATE RANGE
  if (dateFrom || dateTo) {

    where.result_date = {};

    if (dateFrom) {
      where.result_date.gte =
        new Date(dateFrom);
    }

    if (dateTo) {

      const endDate =
        new Date(dateTo);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      where.result_date.lte =
        endDate;
    }
  }

  // SORTING
  let orderBy:
    Prisma.MedicalCertificateResultOrderByWithRelationInput =
  {
    med_cert_id: "desc",
  };

  switch (sort) {

    case "date_asc":
      orderBy = {
        result_date: "asc",
      };
      break;

    case "date_desc":
      orderBy = {
        result_date: "desc",
      };
      break;

    case "patient_asc":
      orderBy = {
        patient: {
          name: "asc",
        },
      };
      break;

    case "patient_desc":
      orderBy = {
        patient: {
          name: "desc",
        },
      };
      break;
  }

  const certificates =
    await prisma.medicalCertificateResult.findMany({

      where,

      skip:
        (page - 1) * limit,

      take: limit,

      orderBy,

      include: {

        patient: true,

        med_cert_request: {
          include: {
            request: true,
          },
        },
      },
    });

  const data =
    certificates.map((c) => ({

      certificate: {
        med_cert_id:
          c.med_cert_id,

        mcr_id:
          c.mcr_id,

        patient_id:
          c.patient_id,

        purpose:
          c.purpose,

        impression:
          c.impression,

        recommendation:
          c.recommendation,

        result_date:
          c.result_date,
      },

      patient: {
        patient_id: c.patient.patient_id,
        name:
          c.patient.name,

        address:
          c.patient.address,

        contact_number:
          c.patient.contact_number,

        birth_date:
          c.patient.birth_date,

        sex:
          c.patient.sex,

        age:
          c.patient.age,

        religion:
          c.patient.religion,
      },

      request: {
        req_id:
          c.med_cert_request
            .request
            .req_id,

        patient_id:
          c.med_cert_request
            .request
            .patient_id,

        req_date:
          c.med_cert_request
            .request
            .req_date,

        req_type:
          c.med_cert_request
            .request
            .req_type,

        status:
          c.med_cert_request
            .request
            .status,
      },

    }));

  return {
    data,

    stats: {
      total,
      waiting,
      serving,
      completed,
      cancelled,
    },

    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

const labRequestInclude = Prisma.validator<Prisma.LaboratoryRequestInclude>()({
  request: {
    select: {
      req_id: true,
      request_code: true,
      patient_id: true,
      req_date: true,
      status: true,
      req_type: true,
      billing: {
        select: {
          billing_id: true,
          billing_code: true,
          total_price: true,
          status: true,
          payments: {
            select: {
              payment_date: true,
            },
            orderBy: [{ payment_date: "desc" }],
            take: 1,
          },
        },
      },
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
      status: true,
      result_payload: true,
      test: {
        select: {
          test_id: true,
          name: true,
          category: true,
          schema_key: true,
        },
      },
      processor: {
        select: {
          user_id: true,
          name: true,
        },
      },
    },
    orderBy: [{ item_id: "asc" }],
  },
});

export const laboratoryRecordHistory = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {
  const where: Prisma.LaboratoryRequestWhereInput = {};

  if (search?.trim()) {

    where.OR = [

      {
        request: {
          patient: {
            name: {
              contains: search,
            },
          },
        },
      },

      {
        request: {
          request_code: {
            contains: search,
          },
        },
      },

      {
        items: {
          some: {
            test: {
              name: {
                contains: search,
              },
            },
          },
        },
      },
    ];
  }

  if (status && status !== "ALL") {

    where.request = {
      status:
        status as Status,
    };

  } else {

    where.request = {
      status: {
        in: [
          "DONE",
          "CANCELED",
        ],
      },
    };
  }

  if (dateFrom || dateTo) {

    where.request = {
      ...where.request,

      req_date: {

        ...(dateFrom
          ? {
            gte:
              new Date(dateFrom),
          }
          : {}),

        ...(dateTo
          ? {
            lte:
              new Date(
                `${dateTo}T23:59:59.999`
              ),
          }
          : {}),
      },
    };
  }
  let orderBy:
    Prisma.LaboratoryRequestOrderByWithRelationInput =
  {
    id: "desc",
  };

  const [
    total,
    waiting,
    serving,
    completed,
    cancelled,
  ] = await Promise.all([

    prisma.laboratoryRequest.count({
      where,
    }),

    prisma.laboratoryRequest.count({
      where: {
        ...where,
        request: {
          status: "WAITING",
        },
      },
    }),

    prisma.laboratoryRequest.count({
      where: {
        ...where,
        request: {
          status: "SERVING",
        },
      },
    }),

    prisma.laboratoryRequest.count({
      where: {
        ...where,
        request: {
          req_type: "LABORATORY",
          status: "DONE",
        },
      },
    }),

    prisma.laboratoryRequest.count({
      where: {
        ...where,
        request: {
          status: "CANCELED",
        },
      },
    }),
  ]);

  switch (sort) {

    case "date_asc":

      orderBy = {
        request: {
          req_date: "asc",
        },
      };

      break;

    case "date_desc":

      orderBy = {
        request: {
          req_date: "desc",
        },
      };

      break;
  }

  const records =
    await prisma.laboratoryRequest.findMany({

      where,

      skip:
        (page - 1) * limit,

      take:
        limit,

      orderBy,

      include:
        labRequestInclude,
    });

  const data =
    records.map((r) => ({

      lab: {
        labId: r.id,

        requestId:
          r.request.req_id,

        patientId:
          r.request.patient.patient_id,

        patientName:
          r.request.patient.name,

        requestCode:
          r.request.request_code,

        requestedDate:
          r.request.req_date.toISOString(),

        status:
          r.request.status,

        totalTests:
          r.items.length,

        completedTests:
          r.items.filter(
            item => item.status === "DONE"
          ).length,

        requestedBy:
          r.req_by,

        tests:
          r.items.map(item => ({

            item_id:
              item.item_id,

            status:
              item.status,

            result_payload:
              item.result_payload,

            test: {
              test_id:
                item.test.test_id,

              name:
                item.test.name,

              category:
                item.test.category,

              schema_key:
                item.test.schema_key,
            },
          })),
      },


      laboratory: {

        lab_id:
          r.id,

        requested_by:
          r.req_by,

        total_tests:
          r.items.length,

        completed_tests:
          r.items.filter(
            item =>
              item.status === "DONE"
          ).length,
      },

      patient: {

        patient_id:
          r.request.patient.patient_id,

        patient_code:
          r.request.patient.patient_code,

        name:
          r.request.patient.name,

        address:
          r.request.patient.address,

        age:
          r.request.patient.age,

        sex:
          r.request.patient.sex,
      },

      request: {

        req_id:
          r.request.req_id,

        patient_id:
          r.request.patient_id,

        req_date:
          r.request.req_date,

        request_code:
          r.request.request_code,

        req_type:
          r.request.req_type,

        status:
          r.request.status,
      },

      tests:
        r.items.map(item => ({

          item_id:
            item.item_id,

          status:
            item.status,

          result_payload:
            item.result_payload,

          test: {

            test_id:
              item.test.test_id,

            name:
              item.test.name,

            category:
              item.test.category,

            schema_key:
              item.test.schema_key,
          },
        })),
    }));

  // console.log('asd', total);

  return {
    data,

    stats: {
      total,
      waiting,
      serving,
      completed,
      cancelled,
    },

    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(
          total / limit
        ),
    },
  };
};

// END HISTORY RECORDS

export const createMedicalCertificate = async (payload: MedicalCertificatePayload) => {
  return prisma.$transaction(async (tx) => {
    const certificate = await tx.medicalCertificateResult.create({
      data: {
        mcr_id: payload.mcr_id,
        patient_id: payload.patient_id,
        purpose: payload.purpose,
        impression: payload.impression,
        recommendation: payload.recommendation,
        result_date: new Date(payload.result_date),
      },

    });
    return certificate;
  })
}

export const getConsultationRecordById = async (cons_id: number) => {
  const request = await prisma.consultationRequest.findUnique({
    where: { cons_id },
    include: {
      consultation: {
        include: {
          patient: true,
          vitals: true,
          consultRecords: true,
          consultationFollowUps: {
            orderBy: {
              follow_up_date: "desc",
            },
            take: 1,
          },
        },
      },
      initialConsultation: {
        include: {
          patient: true,
          vitals: true,
          consultRecords: true,
          consultationFollowUps: {
            orderBy: {
              follow_up_date: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!request) return null;

  const consultation = request.is_follow_up
    ? request.consultation
    : request.initialConsultation[0];

  if (!consultation) return null;

  const patient = consultation.patient;
  const vitals = consultation.vitals;
  const consultRecords = consultation.consultRecords;
  const latestFollowup = consultation.consultationFollowUps[0];

  return {
    consultation_id: consultation.consultation_id,
    patient_id: patient.patient_id,
    name: patient.name,
    consultationFollowUps: latestFollowup ?? null,

    cons_id: consultation.cons_id,
    followup_id: latestFollowup?.followup_id ?? null,
    consultation_date: consultation.consultation_date,
    vs_id: vitals?.vs_id,
    phr_id: consultRecords?.phr_id,
    chief_complaint: consultation.chief_complaint,
  };
}

export const getRequestsPerWeekday = async (req_types?: RequestType[]) => {
  const hasFilter = req_types && req_types.length > 0;

  const data: WeeklyTally[] = await prisma.$queryRaw(
    Prisma.sql`
      SELECT 
        DAYNAME(req_date) AS day,
        COUNT(*) AS total
      FROM request
      WHERE YEARWEEK(req_date, 1) = YEARWEEK(CURDATE(), 1)
      ${hasFilter
        ? Prisma.sql`AND req_type IN (${Prisma.join(req_types!)})`
        : Prisma.empty}
      GROUP BY DAYOFWEEK(req_date), DAYNAME(req_date)
      ORDER BY DAYOFWEEK(req_date)
    `
  );

  // default object (ensures missing days = 0)
  const result = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  for (const row of data) {
    if (result.hasOwnProperty(row.day)) {
      result[row.day as keyof typeof result] = Number(row.total);
    }
  }

  return result;
};

export const getLabRequestByName = async (name: string, patientId: number) => {
  const data = await prisma.laboratoryRequestItem.findMany({
    where: {
      laboratoryRequest: {
        req_by: name,
        request: {
          patient_id: patientId,
        },
      },
    },
    include: {
      laboratoryRequest: {
        include: {
          request: {
            include: {
              patient: true,
              billing: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return data.map((c) => {
    const req = c.laboratoryRequest.request;

    return {
      item_id: c.item_id,
      laboratory_request_id: c.laboratory_request_id,
      test_id: c.test_id,
      status: c.status,
      result_payload: c.result_payload,
      processed_by: c.processed_by,
      completed_at: c.completed_at,

      request: {
        req_id: req.req_id,
        patient_id: req.patient_id,
        req_type: req.req_type,
        status: req.status,
        req_date: req.req_date,
      },

      patient: req.patient,
      billing: {
        status: req.billing?.status ?? 'PENDING'
      },
    };
  });
};

export const getConsultationResultById = async (req_id: number) => {
  const record = await prisma.request.findFirst({
    where: {
      req_id
    },
    select: {
      consult: {
        include: {
          initialConsultation: {
            include: {
              patient: true,
              vitals: true,
              consultRecords: true,
            },
          },
        },
      },
    },
  });

  if (!record || !record.consult) return null;

  const consultation = record.consult;
  const consultationData = consultation.initialConsultation[0];

  if (!consultationData) return null;

  const patient = consultationData.patient;
  const vitals = consultationData.vitals;
  const consultRecords = consultationData.consultRecords;

  return {
    consultation_id: consultationData.consultation_id,
    cons_id: consultation.cons_id,

    // ─── PATIENT INFO ─────────────────
    name: patient.name,
    address: patient.address,
    contact_number: patient.contact_number,
    birth_date: patient.birth_date,
    sex: patient.sex,
    age: patient.age,
    religion: patient.religion ?? undefined,

    // ─── CONSULTATION ─────────────────
    consultation_date: consultationData.consultation_date,
    chief_complaint: consultationData.chief_complaint,
    hist_illness: consultationData.hist_illness ?? undefined,

    // ─── VITALS ───────────────────────
    bp: vitals?.bp ?? undefined,
    temp: vitals?.temp ?? undefined,
    cr: vitals?.cr ?? undefined,
    rr: vitals?.rr ?? undefined,
    wt: vitals?.wt ?? undefined,
    ht: vitals?.ht ?? undefined,

    // ─── PMH ──────────────────────────
    pmh_allergy: consultRecords?.pmh_allergy ?? false,
    pmh_admission: consultRecords?.pmh_admission ?? false,
    pmh_others: consultRecords?.pmh_others ?? false,
    pmh_others_text: consultRecords?.pmh_others_text ?? undefined,

    // ─── FAMILY HISTORY ───────────────
    fh_htn: consultRecords?.fh_htn ?? false,
    fh_dm: consultRecords?.fh_dm ?? false,
    fh_ba: consultRecords?.fh_ba ?? false,
    fh_cancer: consultRecords?.fh_cancer ?? false,
    fh_others: consultRecords?.fh_others ?? false,
    fh_others_text: consultRecords?.fh_others_text ?? undefined,

    // ─── OB ───────────────────────────
    ob_score: consultRecords?.ob_score ?? "",
    ob_nvsd: consultRecords?.ob_nvsd ?? false,
    ob_cs: consultRecords?.ob_cs ?? false,

    menarche: consultRecords?.menarche ?? "",
    interval: consultRecords?.interval ?? "",
    duration: consultRecords?.duration ?? "",
    amount: consultRecords?.amount ?? "",
    ob_symptoms: consultRecords?.ob_symptoms ?? "",

    // ─── PERSONAL ─────────────────────
    cigarette_use: consultRecords?.cigarette_use ?? false,
    alcohol_use: consultRecords?.alcohol_use ?? false,
    drug_use: consultRecords?.drug_use ?? false,
    exercise: consultRecords?.exercise ?? false,
    hygiene_prac: consultRecords?.hygiene_prac ?? false,
    coffee_cons: consultRecords?.coffee_cons ?? false,
    soda_cons: consultRecords?.soda_cons ?? false,

    // ─── SOCIAL ───────────────────────
    sh_allergy: consultRecords?.sh_allergy ?? false,
    sh_admission: consultRecords?.sh_admission ?? false,

    travel_history: consultRecords?.travel_history ?? undefined,
    diet: consultRecords?.diet ?? undefined,
    stress: consultRecords?.stress ?? undefined,
    occupation: consultRecords?.occupation ?? undefined,

    // ─── MEDICAL ──────────────────────
    examination: consultationData.examination ?? undefined,
    assessment: consultationData.assessment ?? undefined,
    plans: consultationData.plans ?? undefined,

    // ─── FOLLOW UP ────────────────────
    follow_up_date: consultationData.follow_up_date ?? undefined,
  };
};

export const getDoctorById = async (doctorId: number) => {
  const doctor = await prisma.users.findUnique({
    where: { user_id: doctorId },
  });

  if (!doctor) {
    throw new Error("Patient not found");
  }

  return doctor;
};

export const getConsultationRxById = async (req_id: number) => {
  const record = await prisma.request.findFirst({
    where: {
      req_id,
    },
    select: {
      consult: {
        include: {
          consultation: {
            include: {
              prescriptions: {
                include: {
                  patient: true,
                  medicines: true,
                },
              },
            },
          },

          initialConsultation: {
            include: {
              prescriptions: {
                include: {
                  patient: true,
                  medicines: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!record?.consult) {
    return null;
  }

  const consultation = record.consult;

  const consultationData = getConsultationFromRequest(record.consult);

  if (!consultationData) {
    return null;
  }

  if (!consultationData.prescriptions.length) {
    return null;
  }

  const prescriptionData = consultationData.prescriptions[0];

  console.log('backend data', prescriptionData)

  return {
    patient_id: prescriptionData.patient.patient_id,
    followup_id: prescriptionData.followup_id,
    cons_id: consultation.cons_id,
    doctor_id: prescriptionData.doctor_id,
    gen_notes: prescriptionData.gen_notes,

    medicines: prescriptionData.medicines.map((m: PrescriptionItem) => ({
      medicine_name: m.medicine_name,
      strength: m.strength,
      brand_name: m.brand_name,
      instruction: m.instruction,
    })),
  };
};

export const getMedicalCertificateById = async (req_id: number) => {
  const record = await prisma.request.findFirst({
    where: {
      req_id,
    },
    select: {
      cert: {
        include: {
          certificate: {
            include: {
              patient: true
            }
          }
        }
      }
    },
  });

  if (!record?.cert?.certificate) {
    return null;
  }

  const cert = record.cert;
  const certificateData = cert.certificate;

  if (!certificateData) {
    return null;
  }

  return {
    mcr_id: certificateData.mcr_id,
    purpose: certificateData.purpose,
    impression: certificateData.impression,
    recommendation: certificateData.recommendation,
    physician: cert.physician,
    patient_id: certificateData.patient_id,
    result_date: certificateData.result_date
  };

};

export const getFollowupById = async (req_id: number) => {
  const record = await prisma.request.findFirst({
    where: {
      req_id
    },
    select: {
      consult: {
        include: {
          initialConsultation: {
            include: {
              patient: true,
              vitals: true,
              consultRecords: true,
            },
          },
        },
      },
    },
  });

  if (!record || !record.consult) return null;

  // console.log("STEP 1", record);

  // if (!record) {
  //   console.log("RETURN NULL: record not found");
  //   return null;
  // }

  // if (!record.consult) {
  //   console.log("RETURN NULL: consult not found");
  //   return null;
  // }

  // console.log("STEP 2", record.consult);

  const consultation = record.consult;

  let consultationData;

  if (consultation.is_follow_up) {
    consultationData = await prisma.consultation.findUnique({
      where: {
        consultation_id: consultation.case_consultation_id!,
      },
      include: {
        patient: true,
        vitals: true,
        consultRecords: true,
      },
    });
  } else {
    consultationData = consultation.initialConsultation.at(0);
  }

  if (!consultationData) return null;

  // console.log("STEP 3", consultation.initialConsultation);

  if (!consultationData) {
    console.log("RETURN NULL: consultationData not found");
    return null;
  }

  if (!consultationData) return null;

  const patient = consultationData.patient;
  const vitals = consultationData.vitals;
  const consultRecords = consultationData.consultRecords;

  const consultationId = record.consult.case_consultation_id;

  let followup: FollowupWithRelations | null = null;

  if (consultationId) {
    followup = await prisma.consultationFollowUp.findFirst({
      where: {
        consultation_id: consultationId,
      },
      include: {
        vitals: true,
        consult: true,
        prescriptions: {
          include: {
            medicines: true,
          },
        },
      },
      orderBy: {
        follow_up_date: "desc", // latest follow-up
      },
    });
  }
  return {
    consultation_id: consultationData.consultation_id,
    cons_id: consultation.cons_id,
    patient_id: patient.patient_id,
    name: patient.name,
    address: patient.address,
    contact_number: patient.contact_number,
    birth_date: patient.birth_date,
    sex: patient.sex,
    age: patient.age,
    religion: patient.religion ?? undefined,
    consultation_date: consultationData.consultation_date,
    chief_complaint: consultationData.chief_complaint,
    hist_illness: consultationData.hist_illness ?? undefined,
    bp: vitals?.bp ?? undefined,
    temp: vitals?.temp ?? undefined,
    cr: vitals?.cr ?? undefined,
    rr: vitals?.rr ?? undefined,
    wt: vitals?.wt ?? undefined,
    ht: vitals?.ht ?? undefined,
    pmh_allergy: consultRecords?.pmh_allergy ?? false,
    pmh_admission: consultRecords?.pmh_admission ?? false,
    pmh_others: consultRecords?.pmh_others ?? false,
    pmh_others_text: consultRecords?.pmh_others_text ?? undefined,
    fh_htn: consultRecords?.fh_htn ?? false,
    fh_dm: consultRecords?.fh_dm ?? false,
    fh_ba: consultRecords?.fh_ba ?? false,
    fh_cancer: consultRecords?.fh_cancer ?? false,
    fh_others: consultRecords?.fh_others ?? false,
    fh_others_text: consultRecords?.fh_others_text ?? undefined,
    ob_score: consultRecords?.ob_score ?? "",
    ob_nvsd: consultRecords?.ob_nvsd ?? false,
    ob_cs: consultRecords?.ob_cs ?? false,
    menarche: consultRecords?.menarche ?? "",
    interval: consultRecords?.interval ?? "",
    duration: consultRecords?.duration ?? "",
    amount: consultRecords?.amount ?? "",
    ob_symptoms: consultRecords?.ob_symptoms ?? "",
    cigarette_use: consultRecords?.cigarette_use ?? false,
    alcohol_use: consultRecords?.alcohol_use ?? false,
    drug_use: consultRecords?.drug_use ?? false,
    exercise: consultRecords?.exercise ?? false,
    hygiene_prac: consultRecords?.hygiene_prac ?? false,
    coffee_cons: consultRecords?.coffee_cons ?? false,
    soda_cons: consultRecords?.soda_cons ?? false,
    sh_allergy: consultRecords?.sh_allergy ?? false,
    sh_admission: consultRecords?.sh_admission ?? false,
    travel_history: consultRecords?.travel_history ?? undefined,
    diet: consultRecords?.diet ?? undefined,
    stress: consultRecords?.stress ?? undefined,
    occupation: consultRecords?.occupation ?? undefined,
    examination: consultationData.examination ?? undefined,
    assessment: consultationData.assessment ?? undefined,
    plans: consultationData.plans ?? undefined,
    follow_up_date: consultationData.follow_up_date ?? undefined,

    followup: followup
      ? {
        followup_id: followup.followup_id,
        consultation_id: followup.consultation_id,
        vs_id: followup.vs_id,
        follow_up_date: followup.follow_up_date,
        impression: followup.impression,
        instruction: followup.instruction,
        vitals: followup.vitals,
        prescriptions: '',
      }
      : null,
  };
};

export const getFollowupRecords = async (cons_id: number) => {
  return prisma.$transaction(async (tx) => {

    const consultationRequest = await tx.consultationRequest.findUnique({
      where: {
        cons_id
      },
      include: {
        vitals: true
      }
    });

    if (!consultationRequest) {
      return null;
    }
    let consultationId: number | null = null

    if (consultationRequest.case_consultation_id) {

      consultationId = consultationRequest.case_consultation_id;

    } else {

      const initial = await tx.consultation.findFirst({
        where: {
          cons_id: consultationRequest.cons_id,
        },
        select: {
          consultation_id: true,
        },
      });

      consultationId = initial?.consultation_id ?? null;
    }

    let consultation = null;

    if (consultationId) {
      consultation = await tx.consultation.findUnique({
        where: {
          consultation_id: consultationId,
        },
        include: {
          vitals: true,
          prescriptions: {
            include: {
              medicines: true,
            },
          }
        },
      });
    }

    if (!consultation) {
      return null;
    }

    let baseline = null;

    if (consultation.phr_id) {
      baseline = await tx.consultationRecords.findUnique({
        where: {
          phr_id: consultation.phr_id,
        },
      });
    }
    let followups: FollowupWithRelations[] = [];

    if (consultationId) {
      followups = await tx.consultationFollowUp.findMany({
        where: {
          consultation_id: consultationId,
          consult: {
            consultRequest: {
              request: {
                status: 'DONE'
              }
            }
          }
        },
        include: {
          vitals: true,
          consult: true,
          prescriptions: {
            include: {
              medicines: true,
            },
          },
        },
        orderBy: {
          follow_up_date: "asc",
        },
      });
    }

    // console.log('backend followup data', followups)

    return {
      ...baseline,
      consultation_id: consultation.consultation_id,
      vs_id: consultationRequest.vs_id,
      followup_date: consultation.follow_up_date,

      initialConsultation: {
        consultation_id: consultation.consultation_id,
        consultation_date: consultation.consultation_date,
        chief_complaint: consultation.chief_complaint,
        hist_illness: consultation.hist_illness,
        examination: consultation.examination,
        assessment: consultation.assessment,
        plans: consultation.plans,
        follow_up_date: consultation.follow_up_date,
        prescription: consultation.prescriptions.length > 0
          ? {
            presc_id: consultation.prescriptions[0].presc_id,
            consultation_id: consultation.prescriptions[0].consultation_id,
            patient_id: consultation.prescriptions[0].patient_id,
            doctor_id: consultation.prescriptions[0].doctor_id,
            gen_notes: consultation.prescriptions[0].gen_notes,
            issued_date: consultation.prescriptions[0].issued_date,
            medicines: consultation.prescriptions[0].medicines.map((m) => ({
              medicine_name: m.medicine_name,
              strength: m.strength,
              brand_name: m.brand_name,
              instruction: m.instruction,
            })),
          }
          : null,
        initialVitals: {
          vs_id: consultation.vitals?.vs_id,
          bp: consultation.vitals?.bp,
          temp: consultation.vitals?.temp,
          cr: consultation.vitals?.cr,
          rr: consultation.vitals?.rr,
          wt: consultation.vitals?.wt,
          ht: consultation.vitals?.ht,
        }
      },

      followups,
    };
  });
};

// get Initial consultation

export const getInitialConsultations = async (patientId: number) => {
  const data = await prisma.consultation.findMany({
    where: {
      patient_id: patientId
    },
    include: {
      consultRequest: {
        include: {
          doctor: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return data.map((c) => {
    return {
      consultation_id: c.consultation_id,
      consultation_date: c.consultation_date,
      chief_complaint: c.chief_complaint,
      hist_illness: c.hist_illness,
      examination: c.examination,
      assessment: c.assessment,
      plans: c.plans,
      follow_up_date: c.follow_up_date,
      doctor: c.consultRequest.doctor,
    }
  })
};


export const createFollowUp = async (payload: CreateFollowupPayload) => {
  return prisma.$transaction(async (tx) => {
    const consultation = await tx.consultationRecords.update({
      where: { patient_id: payload.patient_id },
      data: {
        patient_id: payload.patient_id,

        pmh_allergy: payload.pmh_allergy ?? false,
        pmh_admission: payload.pmh_admission ?? false,
        pmh_others: payload.pmh_others ?? false,
        pmh_others_text: payload.pmh_others_text ?? null,

        fh_htn: payload.fh_htn ?? false,
        fh_dm: payload.fh_dm ?? false,
        fh_ba: payload.fh_ba ?? false,
        fh_cancer: payload.fh_cancer ?? false,
        fh_others: payload.fh_others ?? false,
        fh_others_text: payload.fh_others_text ?? null,

        ob_score: payload.ob_score ?? null,
        ob_nvsd: payload.ob_nvsd ?? false,
        ob_cs: payload.ob_cs ?? false,

        menarche: payload.menarche ?? null,
        interval: payload.interval ?? null,
        duration: payload.duration ?? null,
        amount: payload.amount ?? null,
        ob_symptoms: payload.ob_symptoms ?? null,

        cigarette_use: payload.cigarette_use ?? false,
        alcohol_use: payload.alcohol_use ?? false,
        drug_use: payload.drug_use ?? false,
        exercise: payload.exercise ?? false,
        hygiene_prac: payload.hygiene_prac ?? false,
        coffee_cons: payload.coffee_cons ?? false,
        soda_cons: payload.soda_cons ?? false,

        sh_allergy: payload.sh_allergy ?? false,
        sh_admission: payload.sh_admission ?? false,

        travel_history: payload.travel_history ?? null,
        diet: payload.diet ?? null,
        stress: payload.stress ?? null,
        occupation: payload.occupation ?? null,
      },
    });

    const followup = await tx.consultationFollowUp.create({
      data: {
        consultation_id: payload.consultation_id ?? 0,
        follow_up_date: new Date(payload.followup.follow_up_date),
        vs_id: payload.vs_id,
        impression: payload.followup.impression,
        instruction: payload.followup.instruction,
      }
    })
    return followup;
  })
}

// For print preview

export const getInitialConsultationWithPrevFollowups = async (patientId: number, consultationId: number) => {
  const initialConsultation = await prisma.consultation.findFirst({
    where: {
      patient_id: patientId,
      consultation_id: consultationId
    },
    include: {
      vitals: true,
      consultRequest: {
        include: {
          doctor: true,
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  const FollowupsData = await prisma.consultationFollowUp.findMany({
    where: {
      consultation_id: consultationId
    },
    include: {
      vitals: true
    }
  })

  return {
    consultation_id: initialConsultation?.consultation_id,
    consultation_date: initialConsultation?.consultation_date,
    chief_complaint: initialConsultation?.chief_complaint,
    hist_illness: initialConsultation?.hist_illness,
    examination: initialConsultation?.examination,
    assessment: initialConsultation?.assessment,
    plans: initialConsultation?.plans,
    follow_up_date: initialConsultation?.follow_up_date,
    doctor: initialConsultation?.consultRequest.doctor,
    initialVitals: initialConsultation?.vitals,
    followups: FollowupsData.map((f) => ({
      followup_id: f.followup_id,
      consultation_id: f.consultation_id,
      vs_id: f.vs_id,
      followup_date: f.follow_up_date,
      impression: f.impression,
      instruction: f.instruction,
      vitals: f.vitals,
    })),
  }
};

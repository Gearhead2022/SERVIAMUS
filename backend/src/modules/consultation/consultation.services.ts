import { request } from "express";
import { prisma } from "../../config/prismaClient";
import { MedicalCertificatePayload, PatientConsultationRecordsPayload, PrescriptionPayload } from "./consultation.types";
import { RequestStatus } from "@prisma/client";
/**
 * CONSULTATION RECORDS
 */
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

export const getAllRequests = async (search?: string) => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.request.findMany({
    where: {
      req_date: {
        gte: startOfDay,
        lte: endOfDay,
      },

      ...(search
        ? {
          patient: {
            name: {
              contains: search,
            },
          },
        }
        : {}),
    },

    select: {
      req_id: true,
      req_date: true,
      req_type: true,
      status: true,

      patient: {
        select: {
          patient_id: true,
          name: true,
        },
      },

      consult: {
        select: {
          cons_id: true,
          req_id: true,
          physician: true,
          vs_id: true,
          doctor: true,
          consultations: true,
        }
      },
      cert: {
        select: {
          mcr_id: true,
          req_id: true,
          physician: true,
          purpose: true,
          doctor: true,
          certificate: true,
        }
      }
    },
  });
};

export const requestAction = async (
  requestId: number,
  status: RequestStatus
) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { req_id: requestId },
    });

    if (!request) {
      throw new Error("Request not found");
    }

    if (!["SERVING", "CANCELED", "DONE"].includes(status)) {
      throw new Error("Invalid status transition");
    }

    const updated = await tx.request.update({
      where: { req_id: requestId },
      data: {
        status,
        // optional (recommended)
        // processed_at: new Date(),
        // processed_by: userId
      },
    });

    return updated;
  });
};

export const consultationRecords = async (patient_id: number) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  return prisma.$transaction(async (tx) => {

    const baseline = await tx.consultationRecords.findUnique({
      where: { patient_id },
    });

    const consultation = await tx.consultation.findFirst({
      where: {
        patient_id,
        consultRequest: {
          request: {
            req_date: {
              gte: startOfDay,
              lte: endOfDay,
            }
          }
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
  return prisma.$transaction(async (tx) => {
    const prescription = await tx.prescription.create({
      data: {
        consultation_id: payload.cons_id,
        patient_id: payload.patient_id,
        doctor_id: payload.doctor_id,
        gen_notes: payload.gen_notes,

        medicines: {
          create: payload.medicines.map((m) => ({
            medicine_name: m.medicine_name,
            strength: m.strength,
            form: m.form,
            dose: m.dose,
            frequency: m.frequency,
            route: m.route,
            duration: m.duration,
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

export const getAllPatientConsultationRecord = async (
  patient_id: number,
  search?: string
) => {
  const consultations = await prisma.consultation.findMany({
    where: {
      patient_id,

      ...(search && {
        OR: [
          { chief_complaint: { contains: search, mode: "insensitive" } },
          { hist_illness: { contains: search, mode: "insensitive" } },
          { examination: { contains: search, mode: "insensitive" } },
          { assessment: { contains: search, mode: "insensitive" } },
          { plans: { contains: search, mode: "insensitive" } },
        ],
      }),
    },

    orderBy: { consultation_id: "desc" },

    include: {
      vitals: true,
    },
  });

  const baseline = await prisma.consultationRecords.findUnique({
    where: { patient_id },
  });

  return consultations.map((c) => ({
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
  }));
};

export const getAllPatientMedCertRecord = async (
  patient_id: number,
  search?: string
) => {
  const certificates = await prisma.medicalCertificateResult.findMany({
    where: {
      patient_id,

      ...(search && {
        OR: [
          { purpose: { contains: search, mode: "insensitive" } },
        ],
      }),
    },

    orderBy: { med_cert_id: "desc" },
  });

  return certificates.map((c) => ({
    med_cert_id: c.med_cert_id,
    mcr_id: c.mcr_id,
    patient_id: c.patient_id,
    purpose: c.purpose,
    impression: c.impression,
    recommendation: c.recommendation,
    result_date: c.result_date,
  }));
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
            form: true,
            dose: true,
            frequency: true,
            route: true,
            duration: true,
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

export const consultationRecordHistory = async () => {
  return prisma.$transaction(async (tx) => {

    const requests = await tx.request.findMany({
      where: {
        status: {
          in: ["DONE", "SERVING", "CANCELED"]
        }
      },
      select: {
        req_id: true,
        patient_id: true,
        req_date: true,
        req_type: true,
        status: true,
      },
    });

    const reqIds = requests.map(r => r.req_id);

    if (reqIds.length === 0) return [];

    const consultationRequests = await tx.consultationRequest.findMany({
      where: {
        req_id: {
          in: reqIds,
        },
      },
      select: {
        cons_id: true,
        req_id: true,
      },
    });

    const consIds = consultationRequests.map(c => c.cons_id);

    if (consIds.length === 0) return [];

    const consultations = await tx.consultation.findMany({
      where: {
        cons_id: {
          in: consIds,
        },
      },
      orderBy: {
        consultation_id: "desc",
      },
      include: {
        patient: true,
        vitals: true,
        consultRequest: {
          include: {
            request: true,
          }
        }
      },
    });

    const phrIds = consultations
      .map(c => c.phr_id)
      .filter(Boolean) as number[];

    const baselines = await tx.consultationRecords.findMany({
      where: {
        phr_id: {
          in: phrIds,
        },
      },
    });

    const baselineMap = new Map(
      baselines.map(b => [b.phr_id, b])
    );

    return consultations.map(c => ({
      consultation: {
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

        ...(c.phr_id ? baselineMap.get(c.phr_id) : {})
      },
      patient: {
        name: c.patient.name,
        address: c.patient.address,
        contact_number: c.patient.contact_number,
        birth_date: c.patient.birth_date,
        sex: c.patient.sex,
        age: c.patient.age,
        religion: c.patient.religion,
      },

      request: {
        req_id: c.consultRequest.request.req_id,
        patient_id: c.consultRequest.request.patient_id,
        req_date: c.consultRequest.request.req_date,
        req_type: c.consultRequest.request.req_date,
        status: c.consultRequest.request.status,
      }

    }));
  });
};

export const prescriptionRecordHistory = async () => {
  return prisma.$transaction(async (tx) => {

    const requests = await tx.request.findMany({
      where: {
        status: {
          in: ["DONE", "SERVING", "CANCELED"]
        }
      },
      select: {
        req_id: true,
      },
    });

    const reqIds = requests.map(r => r.req_id);

    if (reqIds.length === 0) return [];

    const consultationRequests = await tx.consultationRequest.findMany({
      where: {
        req_id: {
          in: reqIds,
        },
      },
      select: {
        cons_id: true,
        req_id: true,
      },
    });

    const consIds = consultationRequests.map(c => c.cons_id);

    if (consIds.length === 0) return [];

    const consultations = await tx.consultation.findMany({
      where: {
        cons_id: {
          in: consIds,
        },
      },
      select: {
        consultation_id: true
      },
    });

    const consultsIds = consultations.map(c => c.consultation_id);

    if (consultsIds.length === 0) return [];

    const prescription = await tx.prescription.findMany({
      where: {
        consultation_id: {
          in: consultsIds
        }
      },
      orderBy: {
        consultation_id: "desc"
      },
      include: {
        patient: true,
        consultation: {
          include: {
            consultRequest: {
              include: {
                request: true
              }
            }
          }
        },

      }

    });

    return prescription.map(c => ({
      prescription: {
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
            form: true,
            dose: true,
            frequency: true,
            route: true,
            duration: true,
            quantity: true,
            instruction: true,
          }
        }
      },
      patient: {
        name: c.patient.name,
        address: c.patient.address,
        contact_number: c.patient.contact_number,
        birth_date: c.patient.birth_date,
        sex: c.patient.sex,
        age: c.patient.age,
        religion: c.patient.religion,
      },

      request: {
        req_id: c.consultation.consultRequest.request.req_id,
        patient_id: c.consultation.consultRequest.request.patient_id,
        req_date: c.consultation.consultRequest.request.req_date,
        req_type: c.consultation.consultRequest.request.req_date,
        status: c.consultation.consultRequest.request.status,
      },

      consultation: {
        consultation_id: c.consultation.cons_id,
        consultation_date: c.consultation.consultation_date,
        chief_complaint: c.consultation.chief_complaint,
        hist_illness: c.consultation.hist_illness,
        examination: c.consultation.examination,
        assessment: c.consultation.assessment,
        plans: c.consultation.plans,
        follow_up_date: c.consultation.follow_up_date,
      }
    }));
  });
};

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
  return prisma.$transaction(async (tx) => {
    const data = await tx.consultation.findFirst({

      where: {
        cons_id
      },
      select: {
        cons_id: true,
        consultation_id: true,
        patient_id: true,
        consultation_date: true,
        vs_id: true,
        phr_id: true,
        chief_complaint: true,
      }
    })

    return data;
  })
}


export const medicalCertificateRecordHistory = async () => {
  return prisma.$transaction(async (tx) => {

    const requests = await tx.request.findMany({
      where: {
        status: {
          in: ["DONE", "SERVING", "CANCELED"]
        }
      },
      select: {
        req_id: true,
        patient_id: true,
        req_date: true,
        req_type: true,
        status: true,
      },
    });

    const reqIds = requests.map(r => r.req_id);

    if (reqIds.length === 0) return [];

    const medicalCertificateRequests = await tx.medicalCertificateRequest.findMany({
      where: {
        req_id: {
          in: reqIds,
        },
      },
      select: {
        mcr_id: true,
        req_id: true,
      },
    });

    const certsIds = medicalCertificateRequests.map(c => c.mcr_id);

    if (certsIds.length === 0) return [];

    const certificates = await tx.medicalCertificateResult.findMany({
      where: {
        med_cert_id: {
          in: certsIds,
        },
      },
      orderBy: {
        med_cert_id: "desc",
      },
      include: {
        patient: true,
        med_cert_request: {
          include: {
            request: true,
          }
        }
      },
    });

    return certificates.map(c => ({
      certificate: {
        med_cert_id: c.med_cert_id,
        mcr_id: c.mcr_id,
        patient_id: c.patient_id,
        purpose: c.purpose,
        impression: c.impression,
        recommendation: c.recommendation,
        result_date: c.result_date,

      },
      patient: {
        name: c.patient.name,
        address: c.patient.address,
        contact_number: c.patient.contact_number,
        birth_date: c.patient.birth_date,
        sex: c.patient.sex,
        age: c.patient.age,
        religion: c.patient.religion,
      },

      request: {
        req_id: c.med_cert_request.request.req_id,
        patient_id: c.med_cert_request.request.patient_id,
        req_date: c.med_cert_request.request.req_date,
        req_type: c.med_cert_request.request.req_date,
        status: c.med_cert_request.request.status,
      }


    }));
  });
};

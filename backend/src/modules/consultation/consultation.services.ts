import { request } from "express";
import { prisma } from "../../config/prismaClient";
import { PatientConsultationRecordsPayload, PrescriptionPayload } from "./consultation.types";
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

    // 2. CREATE CONSULTATION (MAIN RECORD ✅)
    const consultation = await tx.consultation.create({
      data: {
        patient_id: payload.patient_id,
        vs_id: vitals.vs_id,
        consultation_date: new Date(payload.consultation_date),

        chief_complaint: payload.chief_complaint,
        hist_illness: payload.hist_illness,

        examination: payload.examination ?? null,
        assessment: payload.assesment ?? null, // fix spelling later
        plans: payload.plans ?? null,

        follow_up_date: payload.follow_up_date
          ? new Date(payload.follow_up_date)
          : null,
      },
    });

    // 3. UPSERT BASELINE (ONLY LONG-TERM DATA ✅)
    await tx.patientHistoricalRecord.upsert({
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

    return consultation;
  });
};

export const getAllConsultationRequest = async (search?: string) => {
  return prisma.consultationRequest.findMany({
    where: search
      ? {
        request: {
          patient: {
            name: {
              contains: search,
            },
          },
        },
      }
      : undefined,

    select: {
      cons_id: true,
      request: {
        select: {
          req_id: true,
          req_date: true,
          req_type: true,
          patient: true,
          status: true
        },
      },
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
  return prisma.$transaction(async (tx) => {

    const baseline = await tx.patientHistoricalRecord.findUnique({
      where: { patient_id },
    });

    const consultation = await tx.consultation.findFirst({
      where: { patient_id },
      orderBy: { consultation_id: "desc" },
      include: {
        patient: true,
        vitals: true,
      },
    });

    if (!consultation) return null;

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
        consultationRequestCons_id: payload.consultationRequestCons_id,

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
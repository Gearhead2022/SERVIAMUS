import { prisma } from "../../config/prismaClient";
import { PatientConsultationRecordsPayload } from "./consultation.types";
/**
 * REGISTER PATIENT
 */
export const createConsultationResult = async (payload: PatientConsultationRecordsPayload) => {

  return prisma.$transaction(async (tx) => {
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
    const patient = await tx.patientHistoricalRecord.create({
        data: {
          // REQUIRED
          patient_id: payload.patient_id,
          vs_id: vitals.vs_id,
          consultation_date: new Date(payload.consultation_date),
          chief_complaint: payload.chief_complaint,
          hist_illness: payload.hist_illness,

          // ─── PAST MEDICAL HISTORY ─────────────
          pmh_allergy: payload.pmh_allergy ?? false,
          pmh_admission: payload.pmh_admission ?? false,
          pmh_others: payload.pmh_others ?? false,
          pmh_others_text: payload.pmh_others_text ?? null,

          // ─── FAMILY HISTORY ───────────────────
          fh_htn: payload.fh_htn ?? false,
          fh_dm: payload.fh_dm ?? false,
          fh_ba: payload.fh_ba ?? false,
          fh_cancer: payload.fh_cancer ?? false,
          fh_others: payload.fh_others ?? false,
          fh_others_text: payload.fh_others_text ?? null,

          // ─── OB-GYNE ──────────────────────────
          ob_score: payload.ob_score ?? null,
          ob_nvsd: payload.ob_nvsd ?? false,
          ob_cs: payload.ob_cs ?? false,

          menarche: payload.menarche ?? null,
          interval: payload.interval ?? null,
          duration: payload.duration ?? null,
          amount: payload.amount ?? null,
          ob_symptoms: payload.ob_symptoms ?? null,

          // ─── PERSONAL HISTORY ────────────────
          cigarette_use: payload.cigarette_use ?? false,
          alcohol_use: payload.alcohol_use ?? false,
          drug_use: payload.drug_use ?? false,
          exercise: payload.exercise ?? false,
          hygiene_prac: payload.hygiene_prac ?? false,
          coffee_cons: payload.coffee_cons ?? false,
          soda_cons: payload.soda_cons ?? false,

          // ─── SOCIAL HISTORY ──────────────────
          sh_allergy: payload.sh_allergy ?? false,
          sh_admission: payload.sh_admission ?? false,

          travel_history: payload.travel_history ?? null,
          diet: payload.diet ?? null,
          stress: payload.stress ?? null,
          occupation: payload.occupation ?? null,
        }
    });
         
    return {patient, vitals};
  });
};

export const getAllConsultationRequest = async () => {
  return prisma.$transaction( async (tx) => {
    const patientRequest = await tx.consultationRequest.findMany();
    return patientRequest;
  });
};
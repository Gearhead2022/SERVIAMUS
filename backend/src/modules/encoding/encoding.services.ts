import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { upsertStructuredLabResult } from "../lab/lab.result-writers";
import {
  normalizeLabForm,
  resolveLabSchemaKey,
  toSchemaKey,
  type LabSchemaKey,
} from "../lab/lab.utils";
import type { EncodingConsultationPayload, EncodingFollowUpPayload, EncodingLabResultPayload } from "./encoding.types";

const parseEncodingDate = (value: string | undefined, label: string) => {
  if (!value?.trim()) {
    return new Date();
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} is invalid.`);
  }

  return parsed;
};

const getOrCreateLabTest = async (
  tx: Prisma.TransactionClient,
  testName: string,
  schemaKey?: string | null
) => {
  const normalizedName = testName.trim();

  if (!normalizedName) {
    throw new Error("Laboratory test is required.");
  }

  const existing = await tx.laboratoryTest.findFirst({
    where: {
      OR: [
        { name: normalizedName },
        ...(schemaKey ? [{ schema_key: schemaKey }] : []),
      ],
    },
    orderBy: { test_id: "asc" },
  });

  if (existing) {
    return existing;
  }

  return tx.laboratoryTest.create({
    data: {
      name: normalizedName,
      category: "OTHER",
      schema_key: schemaKey ?? toSchemaKey(normalizedName),
    },
  });
};

const getEncoderName = async (
  tx: Prisma.TransactionClient,
  userId?: number,
  fallback?: string
) => {
  const trimmedFallback = fallback?.trim();

  if (trimmedFallback) {
    return trimmedFallback;
  }

  if (!userId) {
    return "ADMIN";
  }

  const user = await tx.users.findUnique({
    where: { user_id: userId },
    select: { name: true },
  });

  return user?.name?.trim() || "ADMIN";
};

const syncEncodedResultDate = async (
  tx: Prisma.TransactionClient,
  labId: number,
  schemaKey: LabSchemaKey,
  resultDate: Date
) => {
  if (schemaKey === "CBC" || schemaKey === "BT" || schemaKey === "hematology") {
    await tx.hematologyResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (
    schemaKey === "dengue" ||
    schemaKey === "hbsag" ||
    schemaKey === "syphilis" ||
    schemaKey === "serumPT" ||
    schemaKey === "urinePT" ||
    schemaKey === "serology"
  ) {
    await tx.serologyResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (schemaKey === "parasitology") {
    await tx.parasitologyResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (schemaKey === "urinalysis") {
    await tx.urinalysisResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (
    schemaKey === "FBS" ||
    schemaKey === "RBS" ||
    schemaKey === "BUN" ||
    schemaKey === "uricacid" ||
    schemaKey === "totalcholesterol" ||
    schemaKey === "HDL" ||
    schemaKey === "LDL" ||
    schemaKey === "triglycerides" ||
    schemaKey === "SGPT" ||
    schemaKey === "clinical_chemistry"
  ) {
    await tx.clinicalChemistryResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (schemaKey === "hba1c") {
    await tx.hbA1cResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

    if (schemaKey === "FOBT") {
    await tx.fOBTResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (schemaKey === "sodium" || schemaKey === "potassium" || schemaKey === "chemistry") {
    await tx.chemistryResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
    return;
  }

  if (
    schemaKey === "OGTT" ||
    schemaKey === "onehOGTT" ||
    schemaKey === "twohOGTT" ||
    schemaKey === "ogtt"
  ) {
    await tx.ogttResult.updateMany({
      where: { lab_id: labId },
      data: { result_date: resultDate },
    });
  }
};

export const getEncodingLatestConsultationService = async (patientId: number) => {
  return prisma.consultation.findFirst({
    where: { patient_id: patientId },
    orderBy: [{ consultation_date: "desc" }, { consultation_id: "desc" }],
    select: {
      consultation_id: true,
      consultation_date: true,
      chief_complaint: true,
      assessment: true,
      plans: true,
      follow_up_date: true,
    },
  });
};

export const getEncodingConsultationsService = async (patientId: number) => {
  return prisma.consultation.findMany({
    where: { patient_id: patientId },
    orderBy: [{ consultation_date: "desc" }, { consultation_id: "desc" }],
    select: {
      consultation_id: true,
      consultation_date: true,
      chief_complaint: true,
      assessment: true,
      plans: true,
      follow_up_date: true,
    },
  });
};

const asBoolean = (value?: string) => value === "true";
const asNullableText = (value?: string) => value?.trim() || null;

export const saveEncodingConsultationService = async (
  payload: EncodingConsultationPayload
) => {
  return prisma.$transaction(async (tx) => {
    const patient = await tx.patients.findUnique({
      where: { patient_id: payload.patientId },
      select: { patient_id: true },
    });
    if (!patient) throw new Error("Selected patient was not found.");

    const encoder = payload.userId
      ? await tx.users.findUnique({ where: { user_id: payload.userId }, select: { user_id: true } })
      : null;
    if (!encoder) throw new Error("An active encoder account is required to save a consultation.");

    const fields = payload.fields;
    const consultationDate = parseEncodingDate(payload.consultationDate, "Consultation date");
    const vitals = await tx.vitallSign.create({
      data: {
        patient_id: payload.patientId,
        bp: asNullableText(fields.bp), temp: asNullableText(fields.temp),
        cr: asNullableText(fields.cr), rr: asNullableText(fields.rr),
        wt: asNullableText(fields.wt), ht: asNullableText(fields.ht),
      },
    });
    const request = await tx.request.create({
      data: { patient_id: payload.patientId, req_type: "CONSULTATION", status: "DONE", req_date: consultationDate },
    });
    await tx.request.update({
      where: { req_id: request.req_id },
      data: { request_code: `ENC${request.req_id.toString().padStart(5, "0")}` },
    });
    const consultationRequest = await tx.consultationRequest.create({
      data: { req_id: request.req_id, vs_id: vitals.vs_id, physician: encoder.user_id, is_follow_up: false },
    });
    const records = await tx.consultationRecords.upsert({
      where: { patient_id: payload.patientId },
      create: {
        patient_id: payload.patientId,
        pmh_allergy: asBoolean(fields.pmh_allergy), pmh_admission: asBoolean(fields.pmh_admission), pmh_others: asBoolean(fields.pmh_others), pmh_others_text: asNullableText(fields.pmh_others_text),
        fh_htn: asBoolean(fields.fh_htn), fh_dm: asBoolean(fields.fh_dm), fh_ba: asBoolean(fields.fh_ba), fh_cancer: asBoolean(fields.fh_cancer), fh_others: asBoolean(fields.fh_others), fh_others_text: asNullableText(fields.fh_others_text),
        ob_score: asNullableText(fields.ob_score), ob_nvsd: asBoolean(fields.ob_nvsd), ob_cs: asBoolean(fields.ob_cs),
        menarche: asNullableText(fields.menarche), interval: asNullableText(fields.interval), duration: asNullableText(fields.duration), amount: asNullableText(fields.amount), ob_symptoms: asNullableText(fields.ob_symptoms),
        cigarette_use: asBoolean(fields.cigarette_use), alcohol_use: asBoolean(fields.alcohol_use), drug_use: asBoolean(fields.drug_use), exercise: asBoolean(fields.exercise), hygiene_prac: asBoolean(fields.hygiene_prac), coffee_cons: asBoolean(fields.coffee_cons), soda_cons: asBoolean(fields.soda_cons),
        travel_history: asNullableText(fields.travel_history), diet: asNullableText(fields.diet), stress: asNullableText(fields.stress), occupation: asNullableText(fields.occupation),
      },
      update: {
        pmh_allergy: asBoolean(fields.pmh_allergy), pmh_admission: asBoolean(fields.pmh_admission), pmh_others: asBoolean(fields.pmh_others), pmh_others_text: asNullableText(fields.pmh_others_text),
        fh_htn: asBoolean(fields.fh_htn), fh_dm: asBoolean(fields.fh_dm), fh_ba: asBoolean(fields.fh_ba), fh_cancer: asBoolean(fields.fh_cancer), fh_others: asBoolean(fields.fh_others), fh_others_text: asNullableText(fields.fh_others_text),
        ob_score: asNullableText(fields.ob_score), ob_nvsd: asBoolean(fields.ob_nvsd), ob_cs: asBoolean(fields.ob_cs),
        menarche: asNullableText(fields.menarche), interval: asNullableText(fields.interval), duration: asNullableText(fields.duration), amount: asNullableText(fields.amount), ob_symptoms: asNullableText(fields.ob_symptoms),
        cigarette_use: asBoolean(fields.cigarette_use), alcohol_use: asBoolean(fields.alcohol_use), drug_use: asBoolean(fields.drug_use), exercise: asBoolean(fields.exercise), hygiene_prac: asBoolean(fields.hygiene_prac), coffee_cons: asBoolean(fields.coffee_cons), soda_cons: asBoolean(fields.soda_cons),
        travel_history: asNullableText(fields.travel_history), diet: asNullableText(fields.diet), stress: asNullableText(fields.stress), occupation: asNullableText(fields.occupation),
      },
    });
    return tx.consultation.create({
      data: {
        patient_id: payload.patientId, cons_id: consultationRequest.cons_id, vs_id: vitals.vs_id, phr_id: records.phr_id,
        consultation_date: consultationDate, chief_complaint: asNullableText(fields.chief_complain), hist_illness: asNullableText(fields.hist_illness),
        examination: asNullableText(fields.examination), assessment: asNullableText(fields.assessment), plans: asNullableText(fields.plans),
        follow_up_date: fields.follow_up_date ? parseEncodingDate(fields.follow_up_date, "Follow-up date") : null,
      },
    });
  });
};

export const saveEncodingLabResultService = async (
  payload: EncodingLabResultPayload
) => {
  return prisma.$transaction(async (tx) => {
    const patient = await tx.patients.findUnique({
      where: { patient_id: payload.patientId },
      select: { patient_id: true, name: true },
    });

    if (!patient) {
      throw new Error("Selected patient was not found.");
    }

    const test = await getOrCreateLabTest(tx, payload.testName, payload.schemaKey);
    const resultDate = parseEncodingDate(payload.resultDate, "Result date");
    const requestedBy = await getEncoderName(tx, payload.userId, payload.requestedBy);

    const request = await tx.request.create({
      data: {
        patient_id: payload.patientId,
        req_type: "LABORATORY",
        status: "DONE",
        req_date: resultDate,
      },
    });

    await tx.request.update({
      where: { req_id: request.req_id },
      data: { request_code: `ENC${request.req_id.toString().padStart(5, "0")}` },
    });

    const lab = await tx.laboratoryRequest.create({
      data: {
        req_id: request.req_id,
        req_by: requestedBy,
      },
    });

    const item = await tx.laboratoryRequestItem.create({
      data: {
        laboratory_request_id: lab.id,
        test_id: test.test_id,
        status: "DONE",
        result_payload: normalizeLabForm(payload.form),
        processed_by: payload.medTechUserId ?? payload.userId ?? null,
        completed_at: resultDate,
      },
    });

    await upsertStructuredLabResult({
      tx,
      patientId: payload.patientId,
      labId: item.item_id,
      testName: test.name,
      schemaKey: test.schema_key ?? payload.schemaKey,
      form: payload.form,
      medTechUserId: payload.medTechUserId ?? payload.userId ?? null,
      pathologistUserId: payload.pathologistUserId ?? null,
    });

    await syncEncodedResultDate(
      tx,
      item.item_id,
      resolveLabSchemaKey(test.name, test.schema_key ?? payload.schemaKey),
      resultDate
    );

    return {
      labId: item.item_id,
      laboratoryRequestId: lab.id,
      patientId: payload.patientId,
      requestId: request.req_id,
      testName: test.name,
    };
  });
};

export const saveEncodingFollowUpService = async (
  payload: EncodingFollowUpPayload
) => {
  return prisma.$transaction(async (tx) => {
    if (!payload.consultationId) {
      throw new Error("Select an existing consultation before encoding a follow-up.");
    }
    const consultation = await tx.consultation.findFirst({
      where: { consultation_id: payload.consultationId, patient_id: payload.patientId },
    });

    if (!consultation) throw new Error("The selected consultation was not found for this patient.");

    const followupDate = parseEncodingDate(payload.followupDate, "Follow-up date");
    const vitals = await tx.vitallSign.create({
      data: {
        patient_id: payload.patientId,
        bp: payload.bp?.trim() || null,
        temp: payload.temp?.trim() || null,
        cr: payload.cr?.trim() || null,
        rr: payload.rr?.trim() || null,
        wt: payload.wt?.trim() || null,
        ht: payload.ht?.trim() || null,
      },
    });

    return tx.consultationFollowUp.create({
      data: {
        consultation_id: consultation.consultation_id,
        followup_date: followupDate,
        vs_id: vitals.vs_id,
        impression: payload.impression?.trim() || null,
        instruction: payload.instruction?.trim() || null,
      },
      include: {
        consult: {
          select: {
            consultation_id: true,
            consultation_date: true,
            chief_complaint: true,
          },
        },
        vitals: true,
      },
    });
  });
};

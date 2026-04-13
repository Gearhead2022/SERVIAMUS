import { Prisma } from "@prisma/client";
import {
  LabSchemaKey,
  resolveLabSchemaKey,
  toNullableDate,
  trimFormValue,
} from "./lab.utils";

type UpsertStructuredLabResultInput = {
  tx: Prisma.TransactionClient;
  patientId: number;
  labId: number;
  testName: string;
  schemaKey?: string | null;
  form: Record<string, string>;
  medTechUserId?: number | null;
  pathologistUserId?: number | null;
};

const resultAuditFields = (
  medTechUserId?: number | null,
  pathologistUserId?: number | null
) => ({
  med_tech_user_id: medTechUserId ?? null,
  pth_user_id: pathologistUserId ?? null,
  result_date: new Date(),
});

const knownSchemaKeys = new Set<LabSchemaKey>([
  "hematology",
  "serology",
  "parasitology",
  "urinalysis",
  "clinical_chemistry",
  "hba1c",
  "chemistry",
  "ogtt",
  "general",
]);

export const upsertStructuredLabResult = async ({
  tx,
  patientId,
  labId,
  testName,
  schemaKey,
  form,
  medTechUserId,
  pathologistUserId,
}: UpsertStructuredLabResultInput) => {
  const resolvedSchemaKey =
    schemaKey && knownSchemaKeys.has(schemaKey as LabSchemaKey)
      ? (schemaKey as LabSchemaKey)
      : resolveLabSchemaKey(testName);

  if (resolvedSchemaKey === "hematology") {
    const data = {
      patient_id: patientId,
      hemoglobin: trimFormValue(form, "Hemoglobin", "hemoglobin"),
      rbc_count: trimFormValue(form, "rbc_count"),
      wbc_count: trimFormValue(form, "wbc_count"),
      platelet_count: trimFormValue(form, "platelet_count"),
      others_mcv: trimFormValue(form, "others_mcv"),
      mchc: trimFormValue(form, "mchc"),
      reticulocyte_count: trimFormValue(form, "reticulocyte_count"),
      nss_1: trimFormValue(form, "nss_1"),
      nss_2: trimFormValue(form, "nss_2"),
      nss_3: trimFormValue(form, "nss_3"),
      lymphocytes: trimFormValue(form, "lymphocytes"),
      monocytes: trimFormValue(form, "monocytes"),
      eosinophils: trimFormValue(form, "eosinophils"),
      basophils: trimFormValue(form, "basophils"),
      others1: trimFormValue(form, "others1"),
      clotting_time: trimFormValue(form, "clotting_time"),
      bleeding_time: trimFormValue(form, "bleeding_time"),
      blood_type: trimFormValue(form, "blood_type", "abo_type"),
      abo_type: trimFormValue(form, "abo_type"),
      rh_type: trimFormValue(form, "rh_type"),
      others2: trimFormValue(form, "others2"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.hematologyResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "serology") {
    const data = {
      patient_id: patientId,
      test_name: trimFormValue(form, "test", "test_name") ?? testName,
      method: trimFormValue(form, "method"),
      specimen: trimFormValue(form, "specimen"),
      result: trimFormValue(form, "result"),
      day_of_fever: trimFormValue(form, "day_of_fever", "dayoffever"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.serologyResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "parasitology") {
    const data = {
      patient_id: patientId,
      time_collected: trimFormValue(form, "time_collected"),
      time_received: trimFormValue(form, "time_received", "time_recieved"),
      color: trimFormValue(form, "color"),
      consistency: trimFormValue(form, "consistency"),
      pus_cells: trimFormValue(form, "pus_cells"),
      rbc: trimFormValue(form, "rbc"),
      bacteria: trimFormValue(form, "bacteria"),
      hookworm: trimFormValue(form, "hookworm"),
      ascaris: trimFormValue(form, "ascaris"),
      trichuris: trimFormValue(form, "trichuris"),
      strongloides: trimFormValue(form, "strongloides"),
      histolytica_cyst: trimFormValue(form, "histolytica_cyst"),
      histolytica_trophozoite: trimFormValue(form, "histolytica_trophozoite"),
      coli_cyst: trimFormValue(form, "coli_cyst"),
      coli_trophozoite: trimFormValue(form, "coli_trophozoite"),
      others: trimFormValue(form, "others"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.parasitologyResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "urinalysis") {
    const data = {
      patient_id: patientId,
      color: trimFormValue(form, "color"),
      transparency: trimFormValue(form, "transparency"),
      ph_result: trimFormValue(form, "ph_result"),
      spec_grav_result: trimFormValue(form, "spec_grav_result"),
      protein: trimFormValue(form, "protein"),
      nitrite: trimFormValue(form, "nitrite"),
      glucose: trimFormValue(form, "glucose"),
      ketones: trimFormValue(form, "ketones"),
      leukocytes: trimFormValue(form, "leukocytes"),
      blood: trimFormValue(form, "blood"),
      pus_cells: trimFormValue(form, "pus_cells"),
      rbc: trimFormValue(form, "rbc"),
      bacteria: trimFormValue(form, "bacteria"),
      squamous_cell: trimFormValue(form, "squamous_cell"),
      round_cell: trimFormValue(form, "round_cell"),
      mucous: trimFormValue(form, "mucous"),
      crystals: trimFormValue(form, "crystals"),
      casts: trimFormValue(form, "casts"),
      others: trimFormValue(form, "others"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.urinalysisResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "clinical_chemistry") {
    const data = {
      patient_id: patientId,
      fbs: trimFormValue(form, "FBS", "fbs"),
      rbs: trimFormValue(form, "RBS", "rbs"),
      bun: trimFormValue(form, "BUN", "bun"),
      creatinine: trimFormValue(form, "creatinine"),
      uric_acid: trimFormValue(form, "uric_acid"),
      cholesterol: trimFormValue(form, "cholesterol"),
      hdl_cholesterol: trimFormValue(form, "hdl_cholesterol"),
      ldl_cholesterol: trimFormValue(form, "ldl_cholesterol"),
      triglycerides: trimFormValue(form, "triglycerides"),
      sgpt: trimFormValue(form, "sgpt"),
      fbs_conv: trimFormValue(form, "FBS_conv", "fbs_conv"),
      rbs_conv: trimFormValue(form, "RBS_conv", "rbs_conv"),
      bun_conv: trimFormValue(form, "BUN_conv", "bun_conv"),
      creatinine_conv: trimFormValue(form, "creatinine_conv"),
      uric_acid_conv: trimFormValue(form, "uric_acid_conv"),
      cholesterol_conv: trimFormValue(form, "cholesterol_conv"),
      hdl_cholesterol_conv: trimFormValue(form, "hdl_cholesterol_conv"),
      ldl_cholesterol_conv: trimFormValue(form, "ldl_cholesterol_conv"),
      triglycerides_conv: trimFormValue(form, "triglycerides_conv"),
      last_meal: trimFormValue(form, "last_meal"),
      time_taken: trimFormValue(form, "time_taken"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.clinicalChemistryResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "hba1c") {
    const data = {
      patient_id: patientId,
      test_method: trimFormValue(form, "test_method"),
      lot_no: trimFormValue(form, "lot_no"),
      exp_date: toNullableDate(trimFormValue(form, "exp_date")),
      specimen: trimFormValue(form, "specimen"),
      result: trimFormValue(form, "result"),
      result_interpretation: trimFormValue(form, "result_interpretation"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.hbA1cResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "chemistry") {
    const data = {
      patient_id: patientId,
      sodium: trimFormValue(form, "sodium"),
      potassium: trimFormValue(form, "potassium"),
      chloride: trimFormValue(form, "chloride"),
      ionized_calcium: trimFormValue(form, "ionized_calcium"),
      others: trimFormValue(form, "others"),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.chemistryResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });

    return;
  }

  if (resolvedSchemaKey === "ogtt") {
    const data = {
      patient_id: patientId,
      test_type: trimFormValue(form, "test_type") ?? "OGTT",
      fbs: trimFormValue(form, "FBS", "fbs"),
      fbs_conv: trimFormValue(form, "FBS_conv", "fbs_conv"),
      one_hour_after_load: trimFormValue(form, "onehagl", "one_hour_after_load"),
      one_hour_after_load_conv: trimFormValue(
        form,
        "onehagl_conv",
        "one_hour_after_load_conv"
      ),
      two_hour_after_load: trimFormValue(form, "twohagl", "two_hour_after_load"),
      two_hour_after_load_conv: trimFormValue(
        form,
        "twohagl_conv",
        "two_hour_after_load_conv"
      ),
      three_hour_after_load: trimFormValue(
        form,
        "threehagl",
        "three_hour_after_load"
      ),
      three_hour_after_load_conv: trimFormValue(
        form,
        "threehagl_conv",
        "three_hour_after_load_conv"
      ),
      ...resultAuditFields(medTechUserId, pathologistUserId),
    };

    await tx.ogttResult.upsert({
      where: { lab_id: labId },
      create: {
        lab_id: labId,
        ...data,
      },
      update: data,
    });
  }
};

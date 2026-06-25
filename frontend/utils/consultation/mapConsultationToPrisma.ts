import { RegisterConsultationFormValues } from "@/schemas/consultation.schema";

export function mapConsultationToPrisma(
    data: RegisterConsultationFormValues,
    patientId: number,
    cons_id: number
) {
    return {
        // ─── IDENTIFIERS ───────────────────
        cons_id: cons_id,
        patient_id: patientId,

        name: data.name,
        consultation_date: new Date(data.consultation_date),
        address: data.address,
        contact_number: data.contact_number,
        birth_date: new Date(data.birth_date),
        sex: data.sex,
        age: Number(data.age),

        religion: data.religion ?? "",
        chief_complaint: data.chief_complaint,

        // ─── STEP 2 ─────────────────────────
        hist_illness: data.hist_illness ?? "",
        bp: data.bp ?? "",
        temp: data.temp ?? "",
        cr: data.cr ?? "",
        rr: data.rr ?? "",
        wt: data.wt ?? "",
        ht: data.ht ?? "",

        // ─── STEP 3: PMH ────────────────────
        pmh_allergy: data.pmh_allergy ?? false,
        pmh_admission: data.pmh_admission ?? false,
        pmh_others: data.pmh_others ?? false,
        pmh_others_text: data.pmh_others_text ?? "",

        // ─── FAMILY HISTORY ─────────────────
        fh_htn: data.fh_htn ?? false,
        fh_dm: data.fh_dm ?? false,
        fh_ba: data.fh_ba ?? false,
        fh_cancer: data.fh_cancer ?? false,
        fh_others: data.fh_others ?? false,
        fh_others_text: data.fh_others_text ?? "",

        // ─── OB-GYNE ───────────────────────
        ob_score: data.ob_score ?? "",
        ob_nvsd: data.ob_nvsd ?? false,
        ob_cs: data.ob_cs ?? false,

        menarche: data.menarche ?? "",
        interval: data.interval ?? "",
        duration: data.duration ?? "",
        amount: data.amount ?? "",
        ob_symptoms: data.ob_symptoms ?? "",

        // ─── PERSONAL HISTORY ──────────────
        cigarette_use: data.cigarette_use ?? false,
        alcohol_use: data.alcohol_use ?? false,
        drug_use: data.drug_use ?? false,
        exercise: data.exercise ?? false,
        hygiene_prac: data.hygiene_prac ?? false,
        coffee_cons: data.coffee_cons ?? false,
        soda_cons: data.soda_cons ?? false,

        // ─── SOCIAL HISTORY ────────────────
        sh_allergy: data.sh_allergy ?? false,
        sh_admission: data.sh_admission ?? false,

        travel_history: data.travel_history ?? "",
        diet: data.diet ?? "",
        stress: data.stress ?? "",
        occupation: data.occupation ?? "",

        // ─── MEDICAL ───────────────────────
        examination: data.examination ?? "",
        assessment: data.assessment ?? "",
        plans: data.plans ?? "",

        // ─── FOLLOW UP ─────────────────────
        follow_up_date: data.follow_up_date
            ? new Date(data.follow_up_date)
            : undefined,
    };
}
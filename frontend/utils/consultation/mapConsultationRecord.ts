import { ConsultationResultProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";

export function mapConsultationRecordToForm(
    consultation: ConsultationResultProps,
    patient?: PatientProps,
    cons_id?: number,
) {
    return {
        // patient info (needed for preview header + printable form)
        cons_id,
        name: patient?.name ?? "",
        address: patient?.address ?? "",
        contact_number: patient?.contact_number ?? "",
        birth_date: patient?.birth_date ?? "",
        sex:
            consultation.sex
                ? consultation.sex.toLowerCase() as "male" | "female"
                : "male",
        age: String(patient?.age ?? ""),

        // consultation details
        consultation_date: consultation.consultation_date ? new Date(consultation.consultation_date).toISOString().split("T")[0] : "",

        chief_complaint: consultation.chief_complaint ?? "",
        hist_illness: consultation.hist_illness ?? "",
        examination: consultation.examination ?? "",
        assessment: consultation.assessment ?? "",
        plans: consultation.plans ?? "",
        follow_up_date: consultation.follow_up_date ? new Date(consultation.follow_up_date).toISOString().split("T")[0] : "",

        // vitals (from your include: vitals)
        bp: consultation.bp ?? "",
        temp: consultation.temp ?? "",
        cr: consultation.cr ?? "",
        rr: consultation.rr ?? "",
        wt: consultation.wt ?? "",
        ht: consultation.ht ?? "",

        // PMH / history flags (safe defaults if not present)
        pmh_allergy: consultation.pmh_allergy ?? false,
        pmh_admission: consultation.pmh_admission ?? false,
        pmh_others: consultation.pmh_others ?? false,
        pmh_others_text: consultation.pmh_others_text ?? "",

        fh_htn: consultation.fh_htn ?? false,
        fh_dm: consultation.fh_dm ?? false,
        fh_ba: consultation.fh_ba ?? false,
        fh_cancer: consultation.fh_cancer ?? false,
        fh_others: consultation.fh_others ?? false,
        fh_others_text: consultation.fh_others_text ?? "",
        ob_score: consultation.ob_score ?? "",
        ob_nvsd: consultation.ob_nvsd ?? false,
        ob_cs: consultation.ob_cs ?? false,

        menarche: consultation.menarche ?? "",
        interval: consultation.interval ?? "",
        duration: consultation.duration ?? "",
        amount: consultation.amount ?? "",
        ob_symptoms: consultation.ob_symptoms ?? "",

        // ─── PERSONAL HISTORY ──────────────
        cigarette_use: consultation.cigarette_use ?? false,
        alcohol_use: consultation.alcohol_use ?? false,
        drug_use: consultation.drug_use ?? false,
        exercise: consultation.exercise ?? false,
        hygiene_prac: consultation.hygiene_prac ?? false,
        coffee_cons: consultation.coffee_cons ?? false,
        soda_cons: consultation.soda_cons ?? false,

        // ─── SOCIAL HISTORY ────────────────
        sh_allergy: consultation.sh_allergy ?? false,
        sh_admission: consultation.sh_admission ?? false,

        travel_history: consultation.travel_history ?? "",
        diet: consultation.diet ?? "",
        stress: consultation.stress ?? "",
        occupation: consultation.occupation ?? "",


    };
};
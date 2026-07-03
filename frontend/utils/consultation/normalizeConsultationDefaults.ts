// utils/consultation/normalizeConsultationDefaults.ts

import { ConsultationResultProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";
import { VitalSignProps } from "@/types/RequestTypes";

export function normalizeConsultationDefaults(
    patient?: PatientProps,
    consult?: ConsultationResultProps,
    vitals?: VitalSignProps
) {
    return {
        // Patient Info
        name: patient?.name ?? "",
        contact_number: patient?.contact_number ?? "",
        address: patient?.address ?? "",
        birth_date: patient?.birth_date
            ? new Date(patient.birth_date).toISOString().split("T")[0]
            : "",
        sex: patient?.sex?.toLowerCase() === "female" ? "female" : "male",
        age: patient?.age?.toString() ?? "",
        religion: consult?.religion ?? "",

        // Consultation Info
        consultation_date: new Date().toISOString().split("T")[0],
        chief_complaint: consult?.chief_complaint ?? "",
        hist_illness: consult?.hist_illness ?? "",
        is_follow_up: consult?.is_follow_up ?? false,

        // Vitals
        bp: vitals?.bp ?? "",
        temp: vitals?.temp ?? "",
        cr: vitals?.cr ?? "",
        rr: vitals?.rr ?? "",
        wt: vitals?.wt ?? "",
        ht: vitals?.ht ?? "",

        // Personal Medical History
        pmh_allergy: consult?.pmh_allergy ?? false,
        pmh_admission: consult?.pmh_admission ?? false,
        pmh_others: consult?.pmh_others ?? false,
        pmh_others_text: consult?.pmh_others_text ?? "",

        // Family History
        fh_htn: consult?.fh_htn ?? false,
        fh_dm: consult?.fh_dm ?? false,
        fh_ba: consult?.fh_ba ?? false,
        fh_cancer: consult?.fh_cancer ?? false,
        fh_others: consult?.fh_others ?? false,
        fh_others_text: consult?.fh_others_text ?? "",

        // OB History
        ob_score: consult?.ob_score ?? "",
        ob_nvsd: consult?.ob_nvsd ?? false,
        ob_cs: consult?.ob_cs ?? false,

        menarche: consult?.menarche ?? "",
        interval: consult?.interval ?? "",
        duration: consult?.duration ?? "",
        amount: consult?.amount ?? "",
        ob_symptoms: consult?.ob_symptoms ?? "",

        // Social History
        cigarette_use: consult?.cigarette_use ?? false,
        alcohol_use: consult?.alcohol_use ?? false,
        drug_use: consult?.drug_use ?? false,
        exercise: consult?.exercise ?? false,
        hygiene_prac: consult?.hygiene_prac ?? false,
        coffee_cons: consult?.coffee_cons ?? false,
        soda_cons: consult?.soda_cons ?? false,

        sh_allergy: consult?.sh_allergy ?? false,
        sh_admission: consult?.sh_admission ?? false,

        // Lifestyle
        travel_history: consult?.travel_history ?? "",
        diet: consult?.diet ?? "",
        stress: consult?.stress ?? "",
        occupation: consult?.occupation ?? "",

        // Medical
        examination: consult?.examination ?? "",
        assessment: consult?.assessment ?? "",
        plans: consult?.plans ?? "",

        // Follow-up
        follow_up_date: consult?.follow_up_date
            ? new Date(consult.follow_up_date).toISOString().split("T")[0]
            : "",
    };
}
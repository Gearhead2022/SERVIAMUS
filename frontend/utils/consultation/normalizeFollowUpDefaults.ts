// utils/consultation/normalizeConsultationDefaults.ts

import { ConsultationResultProps, FollowupConsultationResultProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";
import { VitalSignProps } from "@/types/RequestTypes";

export function normalizeFollowUpDefaults(
    patient?: PatientProps,
    followups?: FollowupConsultationResultProps,
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
        religion: followups?.religion ?? "",

        // Consultation Info
        consultation_date: new Date().toISOString().split("T")[0],

        // Vitals
        bp: vitals?.bp ?? "",
        temp: vitals?.temp ?? "",
        cr: vitals?.cr ?? "",
        rr: vitals?.rr ?? "",
        wt: vitals?.wt ?? "",
        ht: vitals?.ht ?? "",

        // Personal Medical History
        pmh_allergy: followups?.pmh_allergy ?? false,
        pmh_admission: followups?.pmh_admission ?? false,
        pmh_others: followups?.pmh_others ?? false,
        pmh_others_text: followups?.pmh_others_text ?? "",

        // Family History
        fh_htn: followups?.fh_htn ?? false,
        fh_dm: followups?.fh_dm ?? false,
        fh_ba: followups?.fh_ba ?? false,
        fh_cancer: followups?.fh_cancer ?? false,
        fh_others: followups?.fh_others ?? false,
        fh_others_text: followups?.fh_others_text ?? "",

        // OB History
        ob_score: followups?.ob_score ?? "",
        ob_nvsd: followups?.ob_nvsd ?? false,
        ob_cs: followups?.ob_cs ?? false,

        menarche: followups?.menarche ?? "",
        interval: followups?.interval ?? "",
        duration: followups?.duration ?? "",
        amount: followups?.amount ?? "",
        ob_symptoms: followups?.ob_symptoms ?? "",

        // Social History
        cigarette_use: followups?.cigarette_use ?? false,
        alcohol_use: followups?.alcohol_use ?? false,
        drug_use: followups?.drug_use ?? false,
        exercise: followups?.exercise ?? false,
        hygiene_prac: followups?.hygiene_prac ?? false,
        coffee_cons: followups?.coffee_cons ?? false,
        soda_cons: followups?.soda_cons ?? false,

        sh_allergy: followups?.sh_allergy ?? false,
        sh_admission: followups?.sh_admission ?? false,

        // Lifestyle
        travel_history: followups?.travel_history ?? "",
        diet: followups?.diet ?? "",
        stress: followups?.stress ?? "",
        occupation: followups?.occupation ?? "",

        // Follow-up
        follow_up_date: followups?.follow_up_date
            ? new Date(followups.follow_up_date).toISOString().split("T")[0]
            : "",
    };
}
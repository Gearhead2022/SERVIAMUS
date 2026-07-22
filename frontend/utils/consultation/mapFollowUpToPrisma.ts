// utils/consultation/normalizeConsultationDefaults.ts

import { RegisterFollowupFormValues } from "@/schemas/consultation.schema";

export function mapFollowUpToPrisma(
    followups?: RegisterFollowupFormValues,
    patientId?: number,
    const_id?: number,
) {
    return {
        cons_id: const_id,
        consultation_id: followups?.consultation_id ?? 0,
        vs_id: followups?.vs_id,
        // Patient Info
        patient_id: patientId,
        name: followups?.name ?? "",
        contact_number: followups?.contact_number ?? "",
        address: followups?.address ?? "",
        birth_date: followups?.birth_date
            ? new Date(followups.birth_date).toISOString().split("T")[0]
            : "",
        sex: followups?.sex?.toLowerCase() === "female" ? "female" : "male",
        age: followups?.age?.toString() ?? "",
        religion: followups?.religion ?? "",

        // Consultation Info
        consultation_date: new Date().toISOString().split("T")[0],

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

        followup: {
            consultation_id: followups?.followup.consultation_id,
            vs_id: followups?.followup.vs_id,
            follow_up_date: followups?.followup.follow_up_date
                ? new Date(followups.followup.follow_up_date).toISOString().split("T")[0]
                : "",
            impression: followups?.followup.impression ?? "",
            instruction: followups?.followup.instruction ?? "",
        },
    };
}
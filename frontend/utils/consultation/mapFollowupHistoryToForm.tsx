import { RegisterFollowupFormValues } from "@/schemas/consultation.schema";
import {
    FollowupConsultationProps,
    FollowupConsultationResultProps,
} from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";

export function mapFollowupHistoryToForm(
    history: FollowupConsultationResultProps,
    patient: PatientProps,
    selectedFollowup?: FollowupConsultationProps
): RegisterFollowupFormValues {

    // If we're viewing a follow-up, use its vitals.
    // Otherwise use the initial consultation vitals.
    const vitals =
        selectedFollowup?.vitals ??
        history.initialConsultation.initialVitals;

    return {

        consultation_id: history.followups[0].consultation_id,
        vs_id: selectedFollowup?.vs_id ?? 0,
        patient_id: patient.patient_id,

        // --------------------------------------------------
        // Patient Information
        // --------------------------------------------------

        name: patient.name,
        address: patient.address ?? '',
        contact_number: patient.contact_number ?? '',
        birth_date:
            typeof patient.birth_date === "string"
                ? patient.birth_date
                : new Date(patient.birth_date ?? '')
                    .toISOString()
                    .split("T")[0],

        sex: patient.sex ? patient.sex.toLowerCase() as "male" | "female" : "male",

        age: String(patient.age),

        religion: patient.religion ?? "",

        // --------------------------------------------------
        // Current consultation date
        // (always the initial consultation)
        // --------------------------------------------------

        consultation_date:
            history.initialConsultation.consultation_date
                ? new Date(history.initialConsultation.consultation_date)
                    .toISOString()
                    .split("T")[0]
                : "",

        // --------------------------------------------------
        // Current Vitals
        // --------------------------------------------------

        bp: vitals?.bp ?? "",
        temp: vitals?.temp ?? "",
        cr: vitals?.cr ?? "",
        rr: vitals?.rr ?? "",
        wt: vitals?.wt ?? "",
        ht: vitals?.ht ?? "",

        // --------------------------------------------------
        // Baseline History
        // --------------------------------------------------

        pmh_allergy: history.pmh_allergy,
        pmh_admission: history.pmh_admission,
        pmh_others: history.pmh_others,
        pmh_others_text: history.pmh_others_text ?? "",

        fh_htn: history.fh_htn,
        fh_dm: history.fh_dm,
        fh_ba: history.fh_ba,
        fh_cancer: history.fh_cancer,
        fh_others: history.fh_others,
        fh_others_text: history.fh_others_text ?? "",

        ob_score: history.ob_score ?? "",
        ob_nvsd: history.ob_nvsd,
        ob_cs: history.ob_cs,

        menarche: history.menarche ?? "",
        interval: history.interval ?? "",
        duration: history.duration ?? "",
        amount: history.amount ?? "",
        ob_symptoms: history.ob_symptoms ?? "",

        cigarette_use: history.cigarette_use,
        alcohol_use: history.alcohol_use,
        drug_use: history.drug_use,
        exercise: history.exercise,
        hygiene_prac: history.hygiene_prac,
        coffee_cons: history.coffee_cons,
        soda_cons: history.soda_cons,

        sh_allergy: history.sh_allergy,
        sh_admission: history.sh_admission,

        travel_history: history.travel_history ?? "",
        diet: history.diet ?? "",
        stress: history.stress ?? "",
        occupation: history.occupation ?? "",

        // --------------------------------------------------
        // Follow-up Object
        // --------------------------------------------------

        follow_up_date:
            selectedFollowup?.followup_date
                ? new Date(selectedFollowup.followup_date)
                    .toISOString()
                    .split("T")[0]
                : "",

        followup: {

            consultation_id: history.followups[0].consultation_id,

            vs_id:
                selectedFollowup?.vs_id ??
                history.followups[0].vs_id,

            follow_up_date:
                selectedFollowup?.followup_date
                    ? new Date(selectedFollowup.followup_date)
                        .toISOString()
                        .split("T")[0]
                    : "",

            impression:
                selectedFollowup?.impression ?? "ywasda",

            instruction:
                selectedFollowup?.instruction ?? "",
        },
    };
}
import { Prisma } from "@prisma/client";

export interface PatientConsultationRecordsPayload {
    phr_id: number;
    cons_id: number;
    vs_id: number;
    patient_id: number;
    consultation_date: string;
    chief_complaint: string;
    hist_illness: string,

    pmh_allergy?: boolean;
    pmh_admission?: boolean;
    pmh_others?: boolean;
    pmh_others_text?: string;
    fh_htn?: boolean;
    fh_dm?: boolean;
    fh_ba?: boolean;
    fh_cancer?: boolean;
    fh_others?: boolean;
    fh_others_text?: string;
    ob_score?: string;
    ob_nvsd?: boolean;
    ob_cs?: boolean;

    menarche?: string;
    interval?: string;
    duration?: string;
    amount?: string;
    ob_symptoms?: string;

    cigarette_use?: boolean;
    alcohol_use?: boolean;
    drug_use?: boolean;
    exercise?: boolean;
    hygiene_prac?: boolean;
    coffee_cons?: boolean;
    soda_cons?: boolean;

    sh_allergy?: boolean;
    sh_admission?: boolean;

    travel_history?: string;
    diet?: string;
    stress?: string;
    occupation?: string;

    examination?: string;
    assessment?: string;
    plans?: string
    follow_up_date?: string;

    //vital signs 

    bp?: string;
    cr?: string;
    temp?: string;
    rr?: string;
    wt?: string;
    ht?: string;
}

export interface ConsultationVitalsPayload {
    bp?: string;
    temp?: string;
    cr?: string;
    rr?: string;
    wt?: string;
    ht?: string;
}


export interface PrescriptionPayload {
    consultation_id: number;
    followup_id: number;
    patient_id: number;
    doctor_id: number;

    gen_notes?: string;
    consultationRequestCons_id?: number;
    issued_date: string;

    medicines: PrescriptionMedicine[];
}

export interface PrescriptionMedicine {
    medicine_name: string;
    strength?: string;
    brand_name: string;
    quantity?: string;
    instruction?: string;
}

export interface MedicalCertificatePayload {
    mcr_id: number;
    patient_id: number;
    purpose: string;
    impression: string;
    recommendation: string;
    med_tech_user_id: number;
    result_date: string;
}

export interface WeeklyTally {
    day: string;
    total: number;
};

export interface FollowupConsultationProps {
    followup_id: number;
    consultation_id: number;
    followup_date: Date;
    vs_id: number;
    impression?: string;
    instruction?: string;

    vitals?: {
        bp?: string;
        temp?: string;
        cr?: string;
        rr?: string;
        wt?: string;
        ht?: string;
    };

}

export type FollowupWithRelations =
    Prisma.ConsultationFollowUpGetPayload<{
        include: {
            vitals: true;
            consult: true;
        };
    }>;

export interface CreateFollowupPayload {
    consultation_id: number;
    cons_id?: number;
    patient_id?: number;
    vs_id: number;

    name: string;
    contact_number: string;
    address: string;
    birth_date: string;
    sex: string;
    age: string;
    religion: string;

    consultation_date: string;

    pmh_allergy: boolean;
    pmh_admission: boolean;
    pmh_others: boolean;
    pmh_others_text: string;

    fh_htn: boolean;
    fh_dm: boolean;
    fh_ba: boolean;
    fh_cancer: boolean;
    fh_others: boolean;
    fh_others_text: string;

    ob_score: string;
    ob_nvsd: boolean;
    ob_cs: boolean;

    menarche: string;
    interval: string;
    duration: string;
    amount: string;
    ob_symptoms: string;

    cigarette_use: boolean;
    alcohol_use: boolean;
    drug_use: boolean;
    exercise: boolean;
    hygiene_prac: boolean;
    coffee_cons: boolean;
    soda_cons: boolean;

    sh_allergy: boolean;
    sh_admission: boolean;

    travel_history: string;
    diet: string;
    stress: string;
    occupation: string;

    follow_up_date: string;

    followup: {
        consultation_id?: number;
        vs_id?: number;
        follow_up_date: string;
        impression: string;
        instruction: string;
    };
}

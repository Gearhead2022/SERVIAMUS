/* =====================
   TYPES
===================== */
import { RequestStatus } from "./LabTypes";
import { PatientProps } from "./PatientTypes";
import { RequestProps, UsersProps, VitalSignProps } from "./RequestTypes";

export interface ConsultationResultProps {
    consultation_id?: number;
    cons_id?: number;
    name: string;
    consultation_date: Date;
    chief_complaint: string;
    address: string;
    contact_number: string;
    hist_illness?: string;
    birth_date: Date;
    sex: string;
    age: number;
    religion?: string;
    bp?: string;
    temp?: string;
    cr?: string;
    rr?: string;
    wt?: string;
    ht?: string;
    pmh_allergy: boolean;
    pmh_admission: boolean;
    pmh_others: boolean;
    pmh_others_text?: string;
    fh_htn: boolean;
    fh_dm: boolean;
    fh_ba: boolean;
    fh_cancer: boolean;
    fh_others: boolean;
    fh_others_text?: string;
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

    travel_history?: string;
    diet?: string;
    stress?: string;
    occupation?: string;

    examination?: string;
    assessment?: string;
    plans?: string;
    follow_up_date?: Date;
    is_follow_up: boolean;
}

export interface ConsultationHistoryRecordsProps {
    consultation: ConsultationResultProps;
    consultationRequest: ConsultationRequestProps;
    prescription: PrescriptionProps;
}

export interface MedCertRequestProps {
    mcr_id: number;
    req_id: number;
    physician: number;
    purpose: string;
    certificate: MedicalCertificateProps;
    doctor: UsersProps;
    request: RequestProps;
}

export interface medCertHistoryRecordsProps {
    medCert: MedicalCertificateProps;
    medCertRequest: MedCertRequestProps;
}

export interface MedicalCertificateProps {
    mcr_id?: number;
    patient_id: number;
    purpose: string;
    impression?: string;
    recommendation?: string;
    physician: number;
    result_date: string;
}


// edited 6/22/26
export interface ConsultationRequestProps {
    cons_id: number;
    req_id: number;
    physician: number;
    request: RequestProps;
    consultation: ConsultationProps;
    doctor: UsersProps;
    vitals: VitalSignProps;
}

export interface medCertHistoryRecordsProps {
    medCert: MedicalCertificateProps;
    medCertRequest: MedCertRequestProps;
}


export interface PrescriptionProps {
    presc_id?: number;
    consultation_id: number;
    patient_id: number;
    doctor_id: number;
    gen_notes?: string;
    medicines: PrescriptionMedicine[];
    issued_date: string;
}

export interface CreatePrescriptionPayload {
    consultation_id: number;
    patient_id: number;
    doctor_id: number;
    gen_notes: string;
    issued_date: string;

    medicines: {
        medicine_name: string;
        strength: string;
        form: string;
        dose: string;
        frequency: string;
        route: string;
        duration: string;
        quantity: string;
        instruction: string;
    }[];
}

export interface PrescriptionMedicine {
    item_id?: number;
    presc_id?: number;
    medicine_name: string;
    strength?: string;

    form: string;
    dose: string;
    frequency: string;
    route: string;
    duration: string;

    quantity?: string;
    instruction?: string;
}

export interface ConsultationProps {
    consultation_id: number
    consultation_date: string,
    chief_complaint: string,
    hist_illness?: string,
    examination?: string,
    assessment?: string,
    plans?: string,
    follow_up_date?: string,
}

export interface ConsultationWithRequestProps {
    consultation_id: number
    consultation_date: string,
    chief_complaint: string,
    hist_illness?: string,
    examination?: string,
    assessment?: string,
    plans?: string,
    follow_up_date?: string,
    doctor: UsersProps,
}

export type RequestTypes = 'CONSULTATION' | 'LABORATORY' | 'CERTIFICATE';

export type Status = "WAITING" | "SERVING" | "DONE" | "CANCELED";

export interface LabRequestProps {
    id: number;
    req_id: number;
    req_by: string;
}

export interface LabBillingProp {
    status: "PENDING" | "DONE";
}

export interface LabRequestItems {
    item_id: number,
    laboratory_request_id: number,
    test_id: number,
    status: RequestStatus,
    result_payload: string,
    processed_by: string,
    completed_at: string,

    request: LabRequestProps;
    patient: PatientProps;
    billing: LabBillingProp;

}

export interface ConsultationPrintDTO {
    consultation_id?: number;
    cons_id: number;
    name: string;
    consultation_date: Date;
    chief_complaint: string;
    address: string;
    contact_number: string;
    hist_illness?: string;
    birth_date: Date;
    sex: string;
    age: number;
    religion?: string;
    bp?: string;
    temp?: string;
    cr?: string;
    rr?: string;
    wt?: string;
    ht?: string;
    pmh_allergy: boolean;
    pmh_admission: boolean;
    pmh_others: boolean;
    pmh_others_text?: string;
    fh_htn: boolean;
    fh_dm: boolean;
    fh_ba: boolean;
    fh_cancer: boolean;
    fh_others: boolean;
    fh_others_text?: string;
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

    travel_history?: string;
    diet?: string;
    stress?: string;
    occupation?: string;

    examination?: string;
    assessment?: string;
    plans?: string;
    follow_up_date?: Date;
}

// for initial consultation  list

export interface InitialConsultationProps {
    consultation_id: number
    consultation_date: string,
    chief_complaint: string,
    hist_illness?: string,
    examination?: string,
    assessment?: string,
    plans?: string,
    follow_up_date?: string,

    doctor: UsersProps;
    prescription: PrescriptionProps;
}

export interface FollowupConsultationProps {
    followup_id: number;
    consultation_id: number;
    followup_date: Date;
    vs_id: number;
    impression?: string;
    instruction?: string;

    vitals?: VitalSignProps
    consult?: ConsultationProps

}

export interface FollowupConsultationResultProps {
    consultation_id?: number;
    cons_id?: number;
    name: string;
    consultation_date: Date;
    address: string;
    contact_number: string;
    birth_date: Date;
    sex: string;
    age: number;
    religion?: string;
    pmh_allergy: boolean;
    pmh_admission: boolean;
    pmh_others: boolean;
    pmh_others_text?: string;
    fh_htn: boolean;
    fh_dm: boolean;
    fh_ba: boolean;
    fh_cancer: boolean;
    fh_others: boolean;
    fh_others_text?: string;
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

    travel_history?: string;
    diet?: string;
    stress?: string;
    occupation?: string;
    follow_up_date?: Date;

    followups: FollowupConsultationProps[];

    initialConsultation: InitialConsultationProps;
}
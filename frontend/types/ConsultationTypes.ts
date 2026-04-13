/* =====================
   TYPES
===================== */
import { PatientProps } from "./PatientTypes";

export interface ConsultaionResultProps {
    consultation_id: number;
    full_name: string;
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

    sh_allergy?: boolean
    sh_admission?: boolean

    travel_history?: string
    diet?: string
    stress?: string
    occupation?: string

    examination?: string
    assesment?: string
    plans?: string
    follow_up_date?: Date
}

export interface RequestProps {
    cons_id: number
    req_id: number
    patient_id: number
    req_type: string
    status: string
    req_date: string
    patient: PatientProps
}

export interface ConsultationRequestProps {
    cons_id: number
    req_id: number
    request: RequestProps
}

export interface PrescriptionProps {
    cons_id: number;
    patient_id: number;
    doctor_id: number;

    gen_notes?: string;
    consultationRequestCons_id?: number;

    medicines: PrescriptionMedicine[];
}

export interface PrescriptionMedicine {
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
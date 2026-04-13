
export interface PatientConsultationRecordsPayload {
    phr_id: number;
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
    assesment?: string;
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


export interface PrescriptionPayload {
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
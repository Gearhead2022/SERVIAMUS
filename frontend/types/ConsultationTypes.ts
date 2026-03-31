/* =====================
   TYPES
===================== */

export interface consultaionResultProps {
    full_name: string;
    consultation_date: Date; 
    chief_complaint: string;
    address: string;
    contact_number: string;
    birth_date: Date;
    sex: string;
    age: number;
    religion?: string;
    prev_bp?: string;
    prev_temp?: string;
    prev_pulse?: string;
    prev_rr?: string;
    prev_weight?: string;
    prev_height?: string;
    curr_bp?: string;
    curr_temp?: string;
    curr_pulse?: string;
    curr_rr?: string;
    curr_weight?: string;
    curr_height?: string;
    pmh_allergy?: boolean;
    pmh_admission?: boolean;
    pmh_others?: boolean;
    pmh_others_text?: string;
    fh_htn?: boolean;
    fh_dm?: boolean;
    fh_ba?: boolean;
    fh_cancer?: boolean;
    fh_others?: boolean;
    fh_others_text?:string;
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

    sh_allergy?:  boolean
    sh_admission?:  boolean

    travel_history?: string
    diet?: string
    stress?: string
    occupation?: string
}
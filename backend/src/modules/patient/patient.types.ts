

export interface PatientPayload {
    patient_id: number;
    patient_code: string;
    name: string;
    address: string;
    contact_number: string;
    birth_date: Date;
    sex: string;
    age: number;
    religion: string;
    philhealth_id?: string;
}

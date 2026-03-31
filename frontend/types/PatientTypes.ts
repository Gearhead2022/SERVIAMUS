/* =====================
   TYPES
===================== */

export interface PatientProps {
    patient_id?: number;
    patient_code: string;
    name: string;
    age?: number;
    sex?: string;
    contact_number?: string;
    address?: string;
    imageUrl?: string;
    religion?: string;
    birth_date?: string;
  }
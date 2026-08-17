/* =====================
   TYPES
===================== */

export interface PatientProps {
   patient_id?: number;
   patient_code: string;
   philhealth_id?: string;
   name: string;
   age?: number;
   sex?: string;
   contact_number?: string;
   address?: string;
   imageUrl?: string;
   religion?: string;
   birth_date?: string;
   last_medical_assistance_year?: string;

}

export type PatientDeletionOutcome = {
  action: "deleted" | "approval_required";
  patient_id?: number;
  deletion_request_id?: number;
  already_pending?: boolean;
};

export type PatientDeletionRequest = {
  deletion_request_id: number;
  patient_id: number | null;
  patient_name: string;
  patient_code: string | null;
  requested_by: number;
  reviewed_by: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string;
  reviewed_at: string | null;
  requester: { name: string; username: string };
  reviewer: { name: string; username: string } | null;
};

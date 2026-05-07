
export interface VitalSignProps {
  patient_id: number;
  patient_code: string;
  consultation_date: string;
  bp?: string;
  temp?: string;
  cr?: string;
  rr?: string;
  wt?: string;
  ht?: string;
  created_at: string;
}

export type CreateRequestProps =
  | {
    req_type: "CONSULTATION";
    patient_id: number;
    patient_code: string;
    name: string;
    req_date: string;

    // vitals
    prev_bp?: string;
    prev_temp?: string;
    prev_cr?: string;
    prev_rr?: string;
    prev_wt?: string;
    prev_ht?: string;

    bp?: string;
    temp?: string;
    cr?: string;
    rr?: string;
    wt?: string;
    ht?: string;
    physician: number;

    created_at?: string;
  }
  | {
    req_type: "LABORATORY";
    patient_id: number;
    patient_code: string;
    name: string;
    req_date: string;

    req_by: string;
    test: string[];
  }
  | {
    req_type: "CERTIFICATE";
    patient_id: number;
    patient_code: string;
    purpose: string;
    req_date: string;
    physician: number;
  }

export interface UsersProps {
  user_id: number;
  username: string;
  name: string;
  license_no: string;
  title: string;
  ptr_no: string;
}

export interface PrintableLabRequestPayload {
  patientCode: string;
  patientName: string;
  age: string;
  sex?: string | null;
  address: string;
  requestDate: string;
  requestedBy: string;
  tests: string[];
}

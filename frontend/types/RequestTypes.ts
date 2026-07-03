import { BillingProps } from "./BillingTypes";
import { ConsultationProps, MedCertRequestProps, PrescriptionMedicine, Status } from "./ConsultationTypes";
import { LabCategory, LabResultPayload, LabSchemaKey, RequestStatus } from "./LabTypes";
import { PatientProps } from "./PatientTypes";

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
    is_follow_up: boolean;
    consultation_id?: number | null;

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
  is_active: boolean;
  created_at: string;
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

export interface RequestProps {
  req_id: number;
  patient_id: number;
  request_code: string;
  req_type: string;
  status: Status;
  req_date: string;
  patient: PatientProps;
  consult?: ConsultationRequestProps;
  cert?: MedCertRequestProps;
  prescription: PrescriptionMedicine;
  laboratory: LaboratoryProps;
  billing: BillingProps;
  workflowStatus: string;
}

export interface ConsultationRequestProps {
  cons_id: number;
  req_id: number;
  physician: number;
  vs_id: number;
  vitals: VitalSignProps;
  consultation: ConsultationProps;
  is_follow_up: boolean;
}

export interface LaboratoryProps {
  id: number;
  req_id: string;
  req_by: string;
  items: LaboratoryItems[];
}

export interface LaboratoryItems {
  item_id: number;
  laboratory_request_id: number;
  test_id: number;
  status: RequestStatus;
  result_payload: LabResultPayload | null;
  completed_at: string;
  test: ItemsInfo;
}

export interface ItemsInfo {
  test_id: number;
  name: string;
  category: LabCategory;
  schema_key: LabSchemaKey;
}

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type LabRecordGroupRequest =
  | "clinical_chemistry"
  | "clinical_microscopy"
  | "hematology"
  | "other"
  | "serology";
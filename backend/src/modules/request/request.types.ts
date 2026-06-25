
export interface vitallSignProps {
  vs_id: number;
  patient_id: number;
  bp?: string;
  cr?: string;
  temp?: string;
  rr?: string;
  wt?: string;
  ht?: string;

}

export interface CreateRequestProps {
  patient_id: number;
  patient_code: string;
  physician: number;
  req_date: string;
  req_type: string,
  req_by: string,
  status: string,
  vs_id: number;
  bp?: string;
  temp?: string;
  cr?: string;
  rr?: string;
  wt?: string;
  ht?: string;
  test: string[];
  test_id: number;
  purpose: string;
  created_at: string;
}

export interface UsersProps {
  user_id: number;
  username: string;
  name: string;
  license_no: string;
  title: string;
  ptr_no: string;
}

export type Status = "WAITING" | "SERVING" | "DONE" | "CANCELED";

export interface RegisterPayload {
  user_id?: number;
  name: string;
  username: string;
  password: string;
  role_id: number;
  license_no?: string;
  title?: string;
  ptr_no?: string;
  is_active: boolean;
}

export type UpdateUserPayload = Omit<RegisterPayload, 'password'>;
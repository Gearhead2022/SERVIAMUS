
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
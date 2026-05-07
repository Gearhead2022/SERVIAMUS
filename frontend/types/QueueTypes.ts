export interface QueueProps {
  queue_id: number;
  patient_id: number;
  queue_type: "CONSULTATION" | "LABORATORY";
  queue_number: number;
  status: "WAITING" | "SERVING" | "COMPLETED" | "SKIPPED";
  serving_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  patient: {
    patient_id: number;
    patient_code?: string;
    name: string;
    contact_number: string;
  };
}

export interface AddToQueuePayload {
  patient_id: number;
  queue_type: "CONSULTATION" | "LABORATORY";
}
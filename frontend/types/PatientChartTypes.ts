export type PatientChartAttachment = {
  attachment_id: number;
  patient_id: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  uploader: { name: string };
};

export type PatientChartUploadPayload = {
  file: File;
  patientId: number;
  onProgress?: (percent: number) => void;
};

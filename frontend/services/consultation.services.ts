import api from "./axios";
import { ConsultationResultProps, MedicalCertificateProps, PrescriptionProps, Status, RequestTypes } from "@/types/ConsultationTypes";

type ModifRequestTypes = Exclude<RequestTypes, 'LABORATORY'>;

export const consultationResults = async (
  data: ConsultationResultProps
) => {
  const res = await api.post("/api/consultation/results", data);
  return res.data.data;
};

export const fetchAllConsultationRequest = async (search: string, req_types: ModifRequestTypes[]) => {
  const res = await api.get("/api/consultation/requestList", {
    params: {
      search,
      req_types: req_types.join(","),
    }
  }
  );
  return res.data.data;
};

export const updateStatus = async (requestId: number, status: Status) => {
  const res = await api.patch(`/api/consultation/${requestId}/status`, {
    status,
  });
  return res.data.data;
}

export const getConsultationRecord = async (patientId: number) => {
  const res = await api.get(`/api/consultation/${patientId}/patientRecord`);
  return res.data.data;
};

export const getStatisticsRecord = async () => {
  const res = await api.get(`/api/consultation/statisticsRecord`);
  return res.data.data;
};

export const createPrescription = async (data: PrescriptionProps) => {
  const res = await api.post(`/api/consultation/createPrescription`, data);
  return res.data.data;
}

export const getAllPatientConsultationList = async (patient_id: number, search?: string) => {
  const res = await api.get(`/api/consultation/${patient_id}/getAllPatientConsultationRecords`, {
    params: { search }
  });
  return res.data.data;
}

export const getAllPatientMedCertList = async (patient_id: number, search?: string) => {
  const res = await api.get(`/api/consultation/${patient_id}/getAllPatientMedCertRecords`, {
    params: { search }
  });
  return res.data.data;
}

export const getPatientPrescription = async (consultation_id: number) => {
  const res = await api.get(`/api/consultation/${consultation_id}/getPrescriptionRecord`);
  return res.data.data;
}

export const getConsultationRecordhistory = async () => {
  const res = await api.get(`/api/consultation/consultationRecordHistory`);
  return res.data.data;
}

export const getPrescriptionRecordhistory = async () => {
  const res = await api.get(`/api/consultation/prescriptionRecordHistory`);
  return res.data.data;
}

export const getMedicalCertificateRecordhistory = async () => {
  const res = await api.get(`/api/consultation/medCertRecordHistory`);
  return res.data.data;
}

export const medicalCertificateResult = async (
  data: MedicalCertificateProps
) => {
  const res = await api.post("/api/consultation/medicalCertificateResult", data);
  return res.data.data;
};

export const getConsultationById = async (cons_id: number) => {
  const res = await api.get(`/api/consultation/${cons_id}/getConsultationRecordById`);
  return res.data.data;
}

export const getRequestPerWeek = async (req_types: RequestTypes[]) => {
  const res = await api.get(`/api/consultation/getRequestPerWeek`, {
    params: {
      req_types: req_types.join(","),
    },
  });

  return res.data;
};

export const getLabRequestByName = async (name: string, patientId: number) => {
  const res = await api.get(`/api/consultation/${patientId}/getLabRequestByName`, {
    params: {
      name
    }
  });
  return res.data;
}

export const getConsultationPrint = async (req_id: number) => {
  const res = await api.get(`/api/consultation/${req_id}/getConsultationRecordByIdz`);
  return res.data;
}

export const getDoctorInfo = async (doctor_id: number) => {
  const res = await api.get(`/api/consultation/${doctor_id}/getDoctorById`);
  return res.data.data;
}

export const getConsultationRxPrint = async (req_id: number) => {
  const res = await api.get(`/api/consultation/${req_id}/getConsultationRxById`);
  return res.data;
}

export const getMedicalCertificatePrint = async (req_id: number) => {
  const res = await api.get(`/api/consultation/${req_id}/getMedicalCertificateById`);
  return res.data;
}
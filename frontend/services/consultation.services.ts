import api from "./axios";
import { ConsultationResultProps, MedicalCertificateProps, Status, RequestTypes, CreatePrescriptionPayload, CreateFollowupPayload } from "@/types/ConsultationTypes";
import { PaginationMeta } from "@/types/RequestTypes";

export const consultationResults = async (
  data: ConsultationResultProps
) => {
  const res = await api.post("/api/consultation/results", data);
  return res.data.data;
};

export const fetchAllConsultationRequest = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  type: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {
  const res = await api.get("/api/consultation/requestList", {
    params: {
      page,
      limit,
      search,
      status,
      type,
      dateFrom,
      dateTo,
      sort
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

export const getConsultationRecord = async (patientId: number, requestId: number) => {
  const res = await api.get(`/api/consultation/${patientId}/patientRecord`, {
    params: {
      request_id: requestId
    }
  });
  return res.data.data;
};

export const getStatisticsRecord = async () => {
  const res = await api.get(`/api/consultation/statisticsRecord`);
  return res.data.data;
};

export const createPrescription = async (data: CreatePrescriptionPayload) => {
  const res = await api.post(`/api/consultation/createPrescription`, data);
  return res.data.data;
}

export const getAllPatientConsultationList = async (patient_id: number, search?: string, page = 1, limit = 10) => {
  const res = await api.get(`/api/consultation/${patient_id}/getAllPatientConsultationRecords`, {
    params: { search, page, limit }
  });
  return { data: res.data.data ?? [], pagination: res.data.pagination as PaginationMeta };
}

export const getAllPatientMedCertList = async (patient_id: number, search?: string, page = 1, limit = 10) => {
  const res = await api.get(`/api/consultation/${patient_id}/getAllPatientMedCertRecords`, {
    params: { search, page, limit }
  });
  return { data: res.data.data ?? [], pagination: res.data.pagination as PaginationMeta };
}

export const getAllPatientPrescriptionList = async (patient_id: number, search?: string) => {
  const res = await api.get(`/api/consultation/${patient_id}/getAllPatientPrescriptionRecords`, {
    params: { search }
  });
  return res.data.data;
}

export const getPatientPrescription = async (consultation_id: number) => {
  const res = await api.get(`/api/consultation/${consultation_id}/getPrescriptionRecord`);
  return res.data.data;
}

export const getConsultationRecordhistory = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string) => {
  const res = await api.get(`/api/consultation/consultationRecordHistory`, {
    params: {
      page,
      limit,
      search,
      status,
      dateFrom,
      dateTo,
      sort
    }
  });
  return res.data.data;
}

export const getPrescriptionRecordhistory = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {
  const res = await api.get(`/api/consultation/prescriptionRecordHistory`, {
    params: {
      page,
      limit,
      search,
      status,
      dateFrom,
      dateTo,
      sort
    }
  });
  return res.data.data;
}

export const getMedicalCertificateRecordhistory = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {
  const res = await api.get(`/api/consultation/medCertRecordHistory`, {
    params: {
      page,
      limit,
      search,
      status,
      dateFrom,
      dateTo,
      sort
    }
  });
  return res.data.data;
}

export const getLaboratoryRecordHistory = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) => {
  const res = await api.get(`/api/consultation/laboratoryRecordHistory`, {
    params: {
      page,
      limit,
      search,
      status,
      dateFrom,
      dateTo,
      sort
    }
  });
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

export const getFollowupPrint = async (req_id: number) => {
  const res = await api.get(`/api/consultation/${req_id}/getFollowupRecordByIdz`);
  return res.data;
}

//added 07-91-26

export const getFollowupRecords = async (cons_id: number) => {
  const res = await api.get(`/api/consultation/${cons_id}/getFollowupRecords`);
  return res.data.data;
}

export const getInitialConsultations = async (patient_id: number) => {
  const res = await api.get(`/api/consultation/${patient_id}/consultation-cases`);
  return res.data.data;
}

export const consultationFollowupResults = async (
  data: CreateFollowupPayload
) => {
  // console.log('datra', data)
  const res = await api.post("/api/consultation/createFollowup", data);
  return res.data.data;
};

export const getInitialConsultationWithPrevFollowups = async (patient_id: number, consultation_id: number) => {
  const res = await api.get(`/api/consultation/${patient_id}/patient/${consultation_id}/followups`);
  return res.data.data;
}

import api from "./axios";
import { ConsultaionResultProps, PrescriptionProps } from "@/types/ConsultationTypes";


export const consultationResults = async (
  data: ConsultaionResultProps
) => {
  const res = await api.post("/api/consultation/results", data);
  return res.data.data;
};
export const fetchAllConsultationRequest = async (search: string) => {
  const res = await api.get("/api/consultation/requestList", {
    params: {
      search
    }
  }
  );
  return res.data.data;
};

export const updateStatus = async (requestId: number, status: "SERVING" | "CANCELED" | "DONE") => {
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
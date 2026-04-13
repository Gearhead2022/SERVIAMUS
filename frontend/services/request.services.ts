import api from "./axios";
import { CreateRequestProps } from "@/types/RequestTypes";

export const getPrevVitalSigns = async (patient_id: number) => {
  const res = await api.get("/api/request/prevVitals", {
    params: { patient_id }
  });
  return res.data.data;
}

export const createRequest = async (
  data: CreateRequestProps
) => {
  const res = await api.post("/api/request/requestAdd", data);
  return res.data.data;
};
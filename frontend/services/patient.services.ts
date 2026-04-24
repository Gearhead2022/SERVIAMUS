import api from "./axios";
import { PatientProps } from "@/types/PatientTypes";

export const fetchAllPatient = async (search: string) => {
  const res = await api.get("/api/patient/getAllPatients", { 
      params: { search }
    }
  );
  return res.data.data;
};

export const createPatient = async (
  data: PatientProps
) => {
  const res = await api.post("/api/patient/patientAdd", data);
  return res.data.data;
};

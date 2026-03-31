import api from "./axios";
import { consultaionResultProps } from "@/types/RequestTypes";


export const consultationResults = async (
  data: consultaionResultProps
) => {
  const res = await api.post("/api/consultation/results", data);
  return res.data.data;
};
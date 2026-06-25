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

export const getAllUsers = async () => {
  const res = await api.get("/api/request/getAllUsers");
  return res.data.data;
};

export const getRequestData = async (req_id: number) => {
  const res = await api.get(`/api/request/${req_id}/requestData`);
  return res.data.data;
}

export const fetchAllRequest = async (
  page: number,
  limit: number,
  search: string,
  status: string,
  type: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string,) => {
  const res = await api.get("/api/request/requestList", {
    params: {
      page,
      limit,
      search,
      status,
      req_type: type,
      dateFrom,
      dateTo,
      sort
    }
  }
  );
  return res.data.data;
};


export const deleteRequest = async (request_id: number) => {
  const res = await api.delete(`/api/request/${request_id}/deleteRequest`);
  return res.data.data;
};

export const updateRequest = async (request_id: number, data: CreateRequestProps) => {
  const res = await api.put(`/api/request/${request_id}/updateRequest`, data);
  return res.data.data;
};

export const getLastRecord = async (patient_id: number) => {
  const res = await api.get(`/api/request/${patient_id}/lastRecord`);
  return res.data.data;
}



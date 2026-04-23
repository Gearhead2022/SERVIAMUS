import api from "./axios";
import { AddToQueuePayload } from "@/types/QueueTypes";

export const addToQueue = async (payload: AddToQueuePayload) => {
  const res = await api.post("/api/queue/add", payload);
  return res.data.data;
};

export const getQueueByType = async (queue_type: "CONSULTATION" | "LABORATORY") => {
  const res = await api.get(`/api/queue/type/${queue_type}`);
  return res.data.data;
};

export const getServingPatient = async (queue_type: "CONSULTATION" | "LABORATORY") => {
  const res = await api.get(`/api/queue/serving/${queue_type}`);
  return res.data.data;
};

export const moveToNextQueue = async (queue_type: "CONSULTATION" | "LABORATORY") => {
  const res = await api.put(`/api/queue/next/${queue_type}`);
  return res.data.data;
};

export const skipQueue = async (queue_id: number) => {
  const res = await api.put(`/api/queue/skip/${queue_id}`);
  return res.data.data;
};

export const getAllQueues = async () => {
  const res = await api.get("/api/queue");
  return res.data.data;
};
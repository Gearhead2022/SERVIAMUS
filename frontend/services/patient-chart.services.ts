import api from "./axios";
import { PatientChartAttachment, PatientChartAttachmentList, PatientChartBatchPatient, PatientChartUploadPayload, PatientChartUploadResult } from "@/types/PatientChartTypes";
import { resolvePatientChartMimeType } from "@/utils/patient-chart-file";

export const fetchPatientChartAttachments = async (
  patientId: number,
  page = 1,
  limit = 10,
  search = ""
) => {
  const response = await api.get(`/api/patient-chart/patients/${patientId}/attachments`, {
    params: { page, limit, ...(search.trim() ? { search: search.trim() } : {}) },
  });
  return {
    data: (response.data.data ?? []) as PatientChartAttachment[],
    pagination: response.data.pagination,
  } as PatientChartAttachmentList;
};

export const uploadPatientChartAttachment = async ({ file, patientId, onProgress }: PatientChartUploadPayload) => {
  const mimeType = resolvePatientChartMimeType(file.type, file.name);
  if (!mimeType) {
    throw new Error("Only PDF, JPG, and PNG patient chart files can be uploaded.");
  }

  const response = await api.post("/api/patient-chart/attachments", file, {
    params: { patientId },
    headers: {
      "Content-Type": "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name),
      "x-file-type": mimeType,
    },
    onUploadProgress: (event) => {
      if (!event.total) return;
      onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    },
  });
  return {
    attachment: response.data.data as PatientChartAttachment,
    duplicate: Boolean(response.data.duplicate),
  } as PatientChartUploadResult;
};

export const resolvePatientChartBatchPatients = async (patientCodes: string[]) => {
  const response = await api.post("/api/patient-chart/batch/resolve-patients", { patientCodes });
  return (response.data.data ?? []) as PatientChartBatchPatient[];
};

export const openPatientChartAttachment = async (attachmentId: number) => {
  const response = await api.get(`/api/patient-chart/attachments/${attachmentId}/file`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data as Blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const deletePatientChartAttachment = async (attachmentId: number) => {
  await api.delete(`/api/patient-chart/attachments/${attachmentId}`);
};

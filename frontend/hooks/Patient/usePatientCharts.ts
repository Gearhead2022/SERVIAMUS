import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePatientChartAttachment, fetchPatientChartAttachments, uploadPatientChartAttachment } from "@/services/patient-chart.services";
import { PatientChartUploadPayload } from "@/types/PatientChartTypes";

export const usePatientChartAttachments = (
  patientId?: number,
  page = 1,
  limit = 10,
  search = ""
) =>
  useQuery({
    queryKey: ["patient-chart", patientId, page, limit, search],
    queryFn: () => fetchPatientChartAttachments(patientId as number, page, limit, search),
    enabled: typeof patientId === "number" && patientId > 0,
  });

export const useUploadPatientChartAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientChartUploadPayload) => uploadPatientChartAttachment(payload),
    onSuccess: (_, { patientId }) => queryClient.invalidateQueries({ queryKey: ["patient-chart", patientId] }),
  });
};

export const useDeletePatientChartAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) => deletePatientChartAttachment(attachmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patient-chart"] }),
  });
};

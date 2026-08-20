import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPatientChartAttachments, uploadPatientChartAttachment } from "@/services/patient-chart.services";
import { PatientChartUploadPayload } from "@/types/PatientChartTypes";

export const usePatientChartAttachments = (patientId?: number) =>
  useQuery({
    queryKey: ["patient-chart", patientId],
    queryFn: () => fetchPatientChartAttachments(patientId as number),
    enabled: typeof patientId === "number" && patientId > 0,
  });

export const useUploadPatientChartAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientChartUploadPayload) => uploadPatientChartAttachment(payload),
    onSuccess: (_, { patientId }) => queryClient.invalidateQueries({ queryKey: ["patient-chart", patientId] }),
  });
};

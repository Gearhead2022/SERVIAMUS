import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLatestEncodingConsultation,
  saveEncodingFollowUp,
  saveEncodingLabResult,
  SaveEncodingFollowUpPayload,
  SaveEncodingLabPayload,
} from "@/services/encoding.services";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";

export const useLatestEncodingConsultation = (patientId?: number) =>
  useQuery({
    queryKey: ["encoding", "latest-consultation", patientId],
    queryFn: () => fetchLatestEncodingConsultation(patientId as number),
    enabled:
      typeof patientId === "number" &&
      Number.isFinite(patientId) &&
      patientId > 0,
  });

export const useSaveEncodingLabResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveEncodingLabPayload) => saveEncodingLabResult(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["lab", "patient-records", payload.patientId],
      });
      SweetAlert.successAlert("Saved", "Laboratory result encoded successfully.");
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Save Failed",
        getApiErrorMessage(error, "Unable to save the laboratory result.")
      );
    },
  });
};

export const useSaveEncodingFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveEncodingFollowUpPayload) =>
      saveEncodingFollowUp(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["encoding", "latest-consultation", payload.patientId],
      });
      queryClient.invalidateQueries({ queryKey: ["consultation"] });
      SweetAlert.successAlert("Saved", "Latest consultation encoded successfully.");
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Save Failed",
        getApiErrorMessage(error, "Unable to save the consultation follow-up.")
      );
    },
  });
};

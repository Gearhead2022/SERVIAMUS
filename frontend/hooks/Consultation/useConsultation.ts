import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationResults, createPrescription, fetchAllConsultationRequest, getConsultationRecord, getStatisticsRecord, updateStatus } from "@/services/consultation.services";
import SweetAlert from "@/utils/SweetAlert";
import { ConsultaionResultProps, ConsultationRequestProps } from "@/types/ConsultationTypes";

export const consultationKeys = {
  all: ["consultation"] as const,
  list: (search: string) => ["consultation", "list", search] as const,
  records: (id: number) => ["consultation", "records", id] as const,
  stats: ["consultation", "stats"] as const,
};

export const useConsultaion = (onClose: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consultationResults,

    onSuccess: (_, variables) => {
      SweetAlert.successAlert(
        "Success",
        "Patient request registered successfully"
      );
      queryClient.invalidateQueries({ queryKey: consultationKeys.all });
      onClose();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useGetAllRequest = (search: string) => {
  return useQuery<ConsultationRequestProps[]>({
    queryKey: consultationKeys.list(search),
    queryFn: () => fetchAllConsultationRequest(search),
  });
}

export const useRequestAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request_id,
      status,
    }: {
      request_id: number;
      status: "SERVING" | "CANCELED" | "DONE";
    }) => updateStatus(request_id, status),

    onSuccess: (_, variables) => {
      SweetAlert.successAlert(
        "Success",
        `Request ${variables.status} successfully`
      );

      queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useConsultationRecords = (patient_id?: number) => {
  return useQuery<ConsultaionResultProps | null>({
    queryKey: patient_id
      ? consultationKeys.records(patient_id)
      : ["consultation", "records"],

    queryFn: async () => {
      if (!patient_id) return null;
      return getConsultationRecord(patient_id);
    },

    enabled: typeof patient_id === "number" && patient_id > 0,
  });
};

export const useStatisticsRecords = () => {
  return useQuery({
    queryKey: consultationKeys.all,
    queryFn: () => getStatisticsRecord(),
  });
};

export const usePrescription = (onClose: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrescription,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Prescription saved successfully"
      );
      queryClient.invalidateQueries({ queryKey: consultationKeys.all });
      onClose();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Prescription saving Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};
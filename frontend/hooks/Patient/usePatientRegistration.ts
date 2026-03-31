import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPatient, fetchAllPatient } from "@/services/patient.services";
import { getPrevVitalSigns, createRequest } from "@/services/request.services";
import SweetAlert from "@/utils/SweetAlert";
import { PatientProps, VitalSignProps } from "@/types/RequestTypes";

export const useGetAllpatient = (search: string) => {
  return useQuery<PatientProps[]>({
    queryKey: ["patient", search],
    queryFn: () => fetchAllPatient(search),
  });
};

export const usePatient = (closeModal: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPatient,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Patient registered successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["patient"] });
      closeModal();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useGetPrevVitalSigns = (patient_id?: number) => {
  return useQuery<VitalSignProps | null>({
    queryKey: ["request", patient_id],

    queryFn: async () => {
      if (!patient_id) return null; // hard guard
      return getPrevVitalSigns(patient_id);
    },

    enabled: typeof patient_id === "number" && patient_id > 0, // strict check
  });
};


export const useRequest = (closeModal: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRequest,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Request created successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["request"] });
      closeModal();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

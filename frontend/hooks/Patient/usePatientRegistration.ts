import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPatient, fetchAllPatient, updatePatient } from "@/services/patient.services";
import SweetAlert from "@/utils/SweetAlert";
import { VitalSignProps} from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { getPrevVitalSigns, createRequest, getAllUsers as getAllRegisteredUsers } from "@/services/request.services";
import { UsersProps } from "@/types/RequestTypes";

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

    onSuccess: (data: Awaited<ReturnType<typeof createRequest>>) => {
      if (data?.request?.req_type === "LABORATORY") {
        SweetAlert.successAlert(
          "Request Sent to Cashier",
          "Laboratory request has been successfully submitted and sent to the billing queue."
        );
        queryClient.invalidateQueries({ queryKey: ["request"] });
        closeModal();
      } else {
        SweetAlert.successAlert(
          "Success",
          "Request created successfully"
        );
        queryClient.invalidateQueries({ queryKey: ["request"] });
        closeModal();
      }
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useUpdatePatient = (closeModal: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: PatientProps }) =>
      updatePatient(patientId, data),

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Patient updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["patient"] });
      closeModal();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};
export const useGetAllUsers = () => {
  return useQuery<UsersProps[]>({
    queryKey: ["users"],
    queryFn: getAllRegisteredUsers,
  });
};

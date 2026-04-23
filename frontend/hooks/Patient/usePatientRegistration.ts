import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPatient, fetchAllPatient } from "@/services/patient.services";
import { getPrevVitalSigns, createRequest, getAllUsers } from "@/services/request.services";
import { createPatient, fetchAllPatient, updatePatient } from "@/services/patient.services";
import { getPrevVitalSigns, createRequest } from "@/services/request.services";
import SweetAlert from "@/utils/SweetAlert";
import { VitalSignProps} from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { UsersProps, VitalSignProps } from "@/types/RequestTypes";
import api from "@/services/axios";

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

interface RequestResponse {
  request: {
    req_id: number;
    req_type: "LABORATORY" | "CONSULTATION";
  };
}

export const useRequest = (closeModal: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof createRequest>[0]) => {
      const response = await createRequest(data);
      
      // Auto-add to queue
      await api.post("/api/queue/add", {
        patient_id: data.patient_id,
        queue_type: data.req_type === "LABORATORY" ? "LABORATORY" : "CONSULTATION",
      });
      
      return response;
    },

    onSuccess: (data: RequestResponse) => {
      if (data?.request?.req_type === "LABORATORY") {
        SweetAlert.successAlert(
          "Success",
          "Laboratory request submitted! Patient added to queue."
        );
      } else {
        SweetAlert.successAlert(
          "Success",
          "Consultation request created successfully! Patient added to queue."
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ["request"] });
      queryClient.invalidateQueries({ queryKey: ["patient"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      closeModal();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Request Failed",
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
    queryKey: ["patient"],
    queryFn: () => getAllUsers(),
  });
};
};

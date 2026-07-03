import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPatient, fetchAllPatient, fetchPatientById, updatePatient } from "@/services/patient.services";
import SweetAlert from "@/utils/SweetAlert";
import { getApiErrorMessage } from "@/utils/api-error";
import { CreateRequestProps, PaginationMeta, RequestProps, VitalSignProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { getPrevVitalSigns, createRequest, getAllUsers as getAllRegisteredUsers, fetchAllRequest, deleteRequest, updateRequest, getLastRecord } from "@/services/request.services";
import { UsersProps } from "@/types/RequestTypes";

export const useGetAllpatient = (search: string) => {
  return useQuery<PatientProps[]>({
    queryKey: ["patient", "list", search],
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
        getApiErrorMessage(error, "Unable to register the patient.")
      );
    }
  });
};

export const useGetPrevVitalSigns = (patient_id?: number) => {
  return useQuery<VitalSignProps | null>({
    queryKey: ["prevVitalSigns", patient_id],

    queryFn: async () => {
      if (!patient_id) return null;
      return getPrevVitalSigns(patient_id);
    },

    enabled: typeof patient_id === "number" && patient_id > 0, // strict check
  });
};

export const useRequest = (closeModal: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRequest,

    onSuccess: async (data: Awaited<ReturnType<typeof createRequest>>) => {

      if (data?.result?.req_type === "LABORATORY") {
        SweetAlert.successAlert(
          "Request Sent to Cashier",
          "Laboratory request has been successfully submitted and sent to the billing queue."
        );

        queryClient.invalidateQueries({ queryKey: ["request"] });
        queryClient.invalidateQueries({ queryKey: ["lab"] });
        queryClient.invalidateQueries({ queryKey: ["billing"] });
        queryClient.invalidateQueries({ queryKey: ["consultation"] });
        queryClient.invalidateQueries({ queryKey: ["queue"] });
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
        getApiErrorMessage(error, "Unable to create the request.")
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
        getApiErrorMessage(error, "Unable to update the patient.")
      );
    }
  });
};
export const useGetAllUsers = () => {
  return useQuery<UsersProps[]>({
    queryKey: ["users", "registered"],
    queryFn: getAllRegisteredUsers,
  });
};

export const useGetPatientById = (patientId: number) => {
  return useQuery<PatientProps>({
    queryKey: ["patient", "detail", patientId],
    queryFn: () => fetchPatientById(patientId),
    enabled: !!patientId,
  });
};

export interface RequestListStats {
  total: number;
  waiting: number;
  serving: number;
  done: number;
  cancelled: number;
}

export interface TableRequestProps<TStats> {
  data: RequestProps[];
  stats?: TStats;
  pagination: PaginationMeta;
}

export const useGetAllRequests = (param: {
  page: number,
  limit: number,
  search: string,
  status: string,
  type: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string,
}
) => {
  return useQuery<TableRequestProps<RequestListStats>>({
    queryKey: ['request', 'list', param],
    queryFn: () => fetchAllRequest(param.page, param.limit, param.search, param.status, param.type, param.dateFrom, param.dateTo, param.sort),
  });
};

export const useDeleteRequest = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request_id: number) =>
      deleteRequest(request_id),

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Request deleted successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ['request'],
      });
    },
  });
};

export const useUpdateRequest = (
  closeModal: () => void
) => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: ({
      request_id,
      data,
    }: {
      request_id: number;
      data: CreateRequestProps;
    }) => updateRequest(request_id, data),

    onSuccess: async (
      data: Awaited<
        ReturnType<
          typeof updateRequest
        >
      >
    ) => {

      if (data?.request?.req_type === "LABORATORY") {
        SweetAlert.successAlert(
          "Request Updated",
          "Laboratory request has been successfully updated."
        );

      } else {
        SweetAlert.successAlert(
          "Success",
          "Request updated successfully."
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["request"], });
      closeModal();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Update Failed",
        getApiErrorMessage(
          error,
          "Unable to update the request."
        )
      );
    },
  });
};

export const useLastRecord = (patientId: number) => {
  return useQuery<RequestProps>({
    queryKey: ["patient", "last-record", patientId],
    queryFn: () => getLastRecord(patientId),
    enabled: !!patientId,
  });
};
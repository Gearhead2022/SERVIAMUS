import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationResults, createPrescription, fetchAllConsultationRequest, getAllPatientConsultationList, getAllPatientMedCertList, getConsultationById, getConsultationRecord, getConsultationRecordhistory, getMedicalCertificateRecordhistory, getPatientPrescription, getPrescriptionRecordhistory, getStatisticsRecord, medicalCertificateResult, updateStatus } from "@/services/consultation.services";
import SweetAlert from "@/utils/SweetAlert";
import { ConsultationResultProps, Status, RequestProps, PrescriptionProps, ConsultationProps, MedicalCertificateProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";
import { getRequestData } from "@/services/request.services";

interface ConsultationHistoryItem {
  consultation: ConsultationResultProps;
  patient: PatientProps;
  request: RequestProps;
}

interface PrescriptionHistoryItem {
  prescription: PrescriptionProps;
  patient: PatientProps;
  request: RequestProps;
  consultation: ConsultationProps;
}

interface MedicalCertificateHistoryItem {
  certificate: MedicalCertificateProps;
  patient: PatientProps;
  request: RequestProps;
}

export const consultationKeys = {
  all: ["consultation"] as const,

  lists: () => [...consultationKeys.all, "list"] as const,

  list: (params: { patient_id?: number; search?: string }) =>
    [...consultationKeys.lists(), params.patient_id, params.search] as const,

  records: (id: number) =>
    [...consultationKeys.all, "records", id] as const,

  stats: () => [...consultationKeys.all, "stats"] as const,
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
  return useQuery<RequestProps[]>({
    queryKey: [...consultationKeys.lists(), search],
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
      status: Status;
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
  return useQuery<ConsultationResultProps | null>({
    queryKey: patient_id
      ? consultationKeys.records(patient_id)
      : consultationKeys.records(0),

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

export const useAllConsultationRecords = (param: { patient_id: number, search: string }) => {
  return useQuery<ConsultationResultProps[]>({
    queryKey: ["consultation", "consult", param.patient_id, param.search],
    queryFn: () => getAllPatientConsultationList(param.patient_id, param.search),
  });
};

export const useAllMedCertRecords = (param: { patient_id: number, search: string }) => {
  return useQuery<MedicalCertificateProps[]>({
    queryKey: ["consultation", "medcert", param.patient_id, param.search],
    queryFn: () => getAllPatientMedCertList(param.patient_id, param.search),
  });
};

export const useConsultationPrescription = (consultation_id: number) => {
  return useQuery<ConsultationResultProps[]>({
    queryKey: consultationKeys.records(consultation_id),
    queryFn: () => getPatientPrescription(consultation_id),
  });
};

export const useConsultationRecordsHistory = () => {
  return useQuery<ConsultationHistoryItem[]>({
    queryKey: ['consultation', 'consultation-history'],
    queryFn: getConsultationRecordhistory,
  });
};

export const usePrescriptionRecordsHistory = () => {
  return useQuery<PrescriptionHistoryItem[]>({
    queryKey: ['consultation', 'prescription-history'],
    queryFn: getPrescriptionRecordhistory,
  });
};

export const useMedicalCertificateRecordsHistory = () => {
  return useQuery<MedicalCertificateHistoryItem[]>({
    queryKey: ['consultation', 'medical-history'],
    queryFn: getMedicalCertificateRecordhistory,
  });
};

export const useMedicalCertificateResult = (onClose: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: medicalCertificateResult,

    onSuccess: (_, variables) => {
      SweetAlert.successAlert(
        "Success",
        "Patient medical certificate processed successfully"
      );

      const requestId = Number(localStorage.getItem("request_id"));

      queryClient.invalidateQueries({ queryKey: consultationKeys.all });

      if (requestId) {
        queryClient.invalidateQueries({
          queryKey: consultationKeys.records(requestId),
        });
      }

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

//Request

export const useRequestData = (req_id?: number) => {
  return useQuery<RequestProps | null>({
    queryKey: ["request", req_id],

    queryFn: () => getRequestData(req_id!),
    enabled: !!req_id,
  });
};

export const useConsultationById = (cons_id: number) => {
  return useQuery<ConsultationProps>({
    queryKey: consultationKeys.records(cons_id),
    queryFn: () => getConsultationById(cons_id),
  });
};

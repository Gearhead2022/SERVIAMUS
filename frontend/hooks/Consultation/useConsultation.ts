import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationFollowupResults, consultationResults, createPrescription, fetchAllConsultationRequest, getAllPatientConsultationList, getAllPatientMedCertList, getConsultationById, getConsultationPrint, getConsultationRecord, getConsultationRecordhistory, getConsultationRxPrint, getDoctorInfo, getFollowupPrint, getFollowupRecords, getInitialConsultations, getInitialConsultationWithPrevFollowups, getLaboratoryRecordHistory, getLabRequestByName, getMedicalCertificatePrint, getMedicalCertificateRecordhistory, getPatientPrescription, getPrescriptionRecordhistory, getRequestPerWeek, getStatisticsRecord, medicalCertificateResult, updateStatus } from "@/services/consultation.services";
import SweetAlert from "@/utils/SweetAlert";
import { ConsultationResultProps, Status, PrescriptionProps, ConsultationProps, MedicalCertificateProps, RequestTypes, LabRequestItems, ConsultationHistoryRecordsProps, medCertHistoryRecordsProps, ConsultationRequestProps, ConsultationWithRequestProps, FollowupConsultationResultProps, InitialConsultationProps, InitialConsultationWithPrevFollowupsProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";
import { getRequestData } from "@/services/request.services";
import { MedCertFormValues, patientConsultationSchema, PrescriptionValues, RegisterFollowupFormValues } from "@/schemas/consultation.schema";
import z from "zod";
import { RegisterPayload } from "@/types/AuthTypes";
import { LaboratoryItems, LaboratoryProps, PaginationMeta, RequestProps } from "@/types/RequestTypes";
import { PatientLabRequestResponse } from "@/types/LabTypes";

export interface ConsultationHistoryItem {
  consultation: ConsultationResultProps;
  patient: PatientProps;
  request: RequestProps;
  consultationRequest: ConsultationRequestProps;
  prescription: PrescriptionProps;
}

export interface PrescriptionHistoryItem {
  prescription: PrescriptionProps;
  patient: PatientProps;
  request: RequestProps;
  consultation: ConsultationWithRequestProps;
}

export interface MedicalCertificateHistoryItem {
  certificate: MedicalCertificateProps;
  patient: PatientProps;
  request: RequestProps;
}

export interface LaboratoryHistoryItem {
  laboratory: LaboratoryProps,
  patient: PatientProps,
  request: RequestProps,
  tests: LaboratoryItems[],
  lab: PatientLabRequestResponse
}

export interface BillingStats {
  total: number;
  pending: number;
  completed: number;
  revenue: number;
}


export interface PaymentStats {
  total: number;
  completed: number;
  revenue: number;
}

export interface RequestStats {
  total: number;
  waiting: number;
  serving: number;
  completed: number;
  cancelled: number;
}

export interface TableRequestProps<T, TStats> {
  data: T[];
  stats?: TStats;
  pagination: PaginationMeta;
}

export type HistoryParams = {
  page: number;
  limit: number;
  search: string;
  status: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  method?: string;
};

// type ModifRequestTypes = Exclude<RequestTypes, 'LABORATORY'>;
type RegisterConsultationFormValues = z.infer<typeof patientConsultationSchema>;

export const useConsultaion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consultationResults,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Patient request registered successfully"
      );
      queryClient.invalidateQueries({ queryKey: ['consultation'] });
      queryClient.invalidateQueries({ queryKey: ['request'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });

    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useGetAllRequest = (param: HistoryParams) => {
  return useQuery<TableRequestProps<RequestProps, RequestStats>>({
    queryKey: ["consultation", "list", param],
    queryFn: () => fetchAllConsultationRequest(param.page, param.limit, param.search, param.status, param.type ?? 'ALL', param.dateFrom, param.dateTo, param.sort),
  });
};

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

      queryClient.invalidateQueries({ queryKey: ['consultation'] });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useConsultationRecords = (patient_id?: number, request_id?: number) => {
  return useQuery<ConsultationResultProps | null>({
    queryKey: ["consultation", "record", patient_id, request_id],

    queryFn: async () => {
      if (!patient_id || !request_id) return null;
      return getConsultationRecord(patient_id, request_id);
    },

    enabled: typeof patient_id === "number" && patient_id > 0,
  });
};

export const useStatisticsRecords = () => {
  return useQuery({
    queryKey: ['consultation', 'stats'],
    queryFn: () => getStatisticsRecord(),
  });
};

export const usePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrescription,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Prescription saved successfully"
      );
      queryClient.invalidateQueries({ queryKey: ['consultation'] });
      queryClient.invalidateQueries({ queryKey: ['request'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
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
  return useQuery<ConsultationHistoryRecordsProps[]>({
    queryKey: ["consultation", "consult-list", param.patient_id, param.search],
    queryFn: () => getAllPatientConsultationList(param.patient_id, param.search),
  });
};

export const useAllMedCertRecords = (param: { patient_id: number, search: string }) => {
  return useQuery<medCertHistoryRecordsProps[]>({
    queryKey: ["consultation", "medcert", param.patient_id, param.search],
    queryFn: () => getAllPatientMedCertList(param.patient_id, param.search),
  });
};

export const useConsultationPrescription = (consultation_id: number) => {
  return useQuery<ConsultationResultProps[]>({
    queryKey: ["consultation", "prescription-list", consultation_id],
    queryFn: () => getPatientPrescription(consultation_id),
  });
};

export const useConsultationRecordsHistory = (param: HistoryParams) => {
  return useQuery<TableRequestProps<ConsultationHistoryItem, RequestStats>>({
    queryKey: ['consultation', 'consultation-history', param],
    queryFn: () => getConsultationRecordhistory(param.page, param.limit, param.search, param.status, param.dateFrom, param.dateTo, param.sort),
  });
};

export const usePrescriptionRecordsHistory = (param: HistoryParams) => {
  return useQuery<TableRequestProps<PrescriptionHistoryItem, RequestStats>>({
    queryKey: ['consultation', 'prescription-history', param],
    queryFn: () => getPrescriptionRecordhistory(param.page, param.limit, param.search, param.status, param.dateFrom, param.dateTo, param.sort),
  });
};

export const useMedicalCertificateRecordsHistory = (param: HistoryParams) => {
  return useQuery<TableRequestProps<MedicalCertificateHistoryItem, RequestStats>>({
    queryKey: ['consultation', 'medical-history', param],
    queryFn: () => getMedicalCertificateRecordhistory(param.page, param.limit, param.search, param.status, param.dateFrom, param.dateTo, param.sort),
  });
};

export const useLaboratoryRecordHistory = (param: HistoryParams) => {
  return useQuery<TableRequestProps<LaboratoryHistoryItem, RequestStats>>({
    queryKey: ['consultation', 'laboratory-history', param],
    queryFn: () => getLaboratoryRecordHistory(param.page, param.limit, param.search, param.status, param.dateFrom, param.dateTo, param.sort),
  });
};


export const useMedicalCertificateResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: medicalCertificateResult,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Patient medical certificate processed successfully"
      );

      queryClient.invalidateQueries({ queryKey: ['consultation'] });
      queryClient.invalidateQueries({ queryKey: ['request'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });

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
    queryKey: ["request", "datail", req_id],

    queryFn: () => getRequestData(req_id!),
    enabled: !!req_id,
  });
};

export const useConsultationById = (cons_id: number) => {
  return useQuery<ConsultationProps>({
    queryKey: ['consultation', "consultation-id", cons_id],
    queryFn: () => getConsultationById(cons_id),
    enabled: !!cons_id,
  });
};

export const useRequestPerWeek = (req_types: RequestTypes[]) => {
  return useQuery({
    queryKey: ["request", "weekly", req_types],
    queryFn: () => getRequestPerWeek(req_types),
  });
};

export const useGetLabRequestByName = (name: string, patient_id: number) => {
  return useQuery<LabRequestItems[]>({
    queryKey: ["consultation", "labRequests", name, patient_id],
    queryFn: () => getLabRequestByName(name, patient_id),
    enabled: !!name && !!patient_id
  });
};

export const useConsultationPrint = (req_id: number) => {
  return useQuery<RegisterConsultationFormValues>({
    queryKey: ["consultation", "consultation-print", req_id],
    queryFn: () => getConsultationPrint(req_id),
    enabled: !!req_id,
  });
};

export const useGetDoctorById = (doctorId: number) => {
  return useQuery<RegisterPayload>({
    queryKey: ["consultation", "doctor-id", doctorId],
    queryFn: () => getDoctorInfo(doctorId),
    enabled: !!doctorId,
  });
};

export const useConsultationRxPrint = (req_id: number) => {
  return useQuery<PrescriptionValues>({
    queryKey: ["consultation", "prescription-print", req_id],
    queryFn: () => getConsultationRxPrint(req_id),
    enabled: !!req_id,
  });
};

export const useMedicalCertificatePrint = (req_id: number) => {
  return useQuery<MedCertFormValues>({
    queryKey: ["consultation", "certificate-print", req_id],
    queryFn: () => getMedicalCertificatePrint(req_id),
    enabled: !!req_id,
  });
};

export const useFollowupPrint = (req_id: number) => {
  return useQuery<RegisterFollowupFormValues>({
    queryKey: ["consultation", "followup-print", req_id],
    queryFn: () => getFollowupPrint(req_id),
    enabled: !!req_id,
  });
};

export const useFollowupRecords = (cons_id: number) => {
  return useQuery<FollowupConsultationResultProps>({
    queryKey: ['consultation', "follow-up", cons_id],
    queryFn: () => getFollowupRecords(cons_id),
    enabled: !!cons_id,
  });
};

// Request Initial Consutations //

export const useGetInitialConsultations = (patient_id: number) => {
  return useQuery<InitialConsultationProps[]>({
    queryKey: ["consultation", "labRequests", patient_id],
    queryFn: () => getInitialConsultations(patient_id),
    enabled: !!patient_id
  });
};

export const useConsultaionFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consultationFollowupResults,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Patient request registered successfully"
      );
      queryClient.invalidateQueries({ queryKey: ['consultation'] });
      queryClient.invalidateQueries({ queryKey: ['request'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useGetInitialConsultationWithFollowups = (patient_id: number, consultation_id: number) => {
  return useQuery<InitialConsultationWithPrevFollowupsProps>({
    queryKey: ["consultation", "prev-follow-ups", patient_id, consultation_id],
    queryFn: () => getInitialConsultationWithPrevFollowups(patient_id, consultation_id),
    enabled: !!patient_id || !!consultation_id
  });
};

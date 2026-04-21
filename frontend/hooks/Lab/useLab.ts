import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLabRequest,
  fetchLabTests,
  fetchLabRequests,
  fetchPatientLabRecords,
  fetchPatientRecords,
  saveLabResult,
  updateLabRequestStatus,
} from "@/services/lab.service";
import {
  LabRequest,
  LabTestCatalogItem,
  PatientLabRecordFilters,
  PatientRecord,
  SaveLabResultPayload,
  UpdateLabRequestStatusPayload,
} from "@/types/LabTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";

const LAB_REQUESTS_QUERY_KEY = ["lab", "requests"] as const;
const LAB_TESTS_QUERY_KEY = ["lab", "tests"] as const;
const LAB_PATIENT_DIRECTORY_QUERY_KEY = ["lab", "patient-directory"] as const;
const LAB_PATIENT_RECORDS_QUERY_KEY = ["lab", "patient-records"] as const;

const getLabRequestQueryKey = (labId: number) => ["lab", "request", labId] as const;

const getPatientLabRecordsQueryKey = (
  patientId: number,
  filters: PatientLabRecordFilters
) =>
  [
    ...LAB_PATIENT_RECORDS_QUERY_KEY,
    patientId,
    filters.dateFrom ?? "",
    filters.dateTo ?? "",
    filters.recordGroup ?? "all",
  ] as const;

const mergeUpdatedLabRequest = (
  requests: LabRequest[] | undefined,
  updated: LabRequest
) => {
  if (!requests?.length) {
    return [updated];
  }

  let foundUpdatedItem = false;

  const nextRequests = requests.map((request) => {
    if (request.requestId !== updated.requestId) {
      return request;
    }

    if (request.labId === updated.labId) {
      foundUpdatedItem = true;
      return updated;
    }

    return {
      ...request,
      requestStatus: updated.requestStatus,
      tests: updated.tests,
      completedTests: updated.completedTests,
      pendingTests: updated.pendingTests,
      totalTests: updated.totalTests,
      completedCount: updated.completedCount,
    };
  });

  if (foundUpdatedItem) {
    return nextRequests;
  }

  return [...nextRequests, updated];
};

export const useLabRequests = () =>
  useQuery<LabRequest[]>({
    queryKey: LAB_REQUESTS_QUERY_KEY,
    queryFn: fetchLabRequests,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

export const useLabTestCatalog = () =>
  useQuery<LabTestCatalogItem[]>({
    queryKey: LAB_TESTS_QUERY_KEY,
    queryFn: fetchLabTests,
    staleTime: 5 * 60 * 1000,
  });

export const useLabRequest = (labId?: number) =>
  useQuery<LabRequest>({
    queryKey: labId ? getLabRequestQueryKey(labId) : ["lab", "request", "unknown"],
    queryFn: () => fetchLabRequest(labId as number),
    enabled: typeof labId === "number" && Number.isFinite(labId) && labId > 0,
  });

export const useLabPatientDirectory = (search: string) =>
  useQuery<PatientRecord[]>({
    queryKey: [...LAB_PATIENT_DIRECTORY_QUERY_KEY, search],
    queryFn: () => fetchPatientRecords(search),
    staleTime: 30 * 1000,
  });

export const usePatientLabRecords = (
  patientId?: number,
  filters: PatientLabRecordFilters = {}
) =>
  useQuery<LabRequest[]>({
    queryKey: patientId
      ? getPatientLabRecordsQueryKey(patientId, filters)
      : [...LAB_PATIENT_RECORDS_QUERY_KEY, "unknown"],
    queryFn: () => fetchPatientLabRecords(patientId as number, filters),
    enabled: typeof patientId === "number" && Number.isFinite(patientId) && patientId > 0,
  });

export const useUpdateLabRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labId, status }: UpdateLabRequestStatusPayload) =>
      updateLabRequestStatus(labId, status),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData<LabRequest[]>(
        LAB_REQUESTS_QUERY_KEY,
        (currentRequests) => mergeUpdatedLabRequest(currentRequests, updatedRequest)
      );
      queryClient.setQueryData(getLabRequestQueryKey(updatedRequest.labId), updatedRequest);
      queryClient.invalidateQueries({
        queryKey: [...LAB_PATIENT_RECORDS_QUERY_KEY, updatedRequest.rawPatientId],
      });
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Update Failed",
        getApiErrorMessage(error, "Unable to update the laboratory request.")
      );
    },
  });
};

export const useSaveLabResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveLabResultPayload) => saveLabResult(payload),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData<LabRequest[]>(
        LAB_REQUESTS_QUERY_KEY,
        (currentRequests) => mergeUpdatedLabRequest(currentRequests, updatedRequest)
      );
      queryClient.setQueryData(getLabRequestQueryKey(updatedRequest.labId), updatedRequest);
      queryClient.invalidateQueries({
        queryKey: [...LAB_PATIENT_RECORDS_QUERY_KEY, updatedRequest.rawPatientId],
      });
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Save Failed",
        getApiErrorMessage(error, "Unable to save laboratory results.")
      );
    },
  });
};

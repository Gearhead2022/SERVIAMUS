import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLabRequest,
  fetchLabTests,
  fetchLabUsers,
  fetchPatientLabRequests,
  fetchLabRequests,
  fetchPatientLabRecords,
  fetchPatientRecords,
  saveLabResult,
  updateLabRequestStatus,
  fetchLabResultPreview,
  fetchExternalLabAttachments,
  fetchExternalLabAttachmentWorklist,
  uploadExternalLabAttachment,
  UploadExternalLabAttachmentPayload,
} from "@/services/lab.service";
import {
  LabRequest,
  ExternalLabAttachmentWorklistItem,
  LabTestCatalogItem,
  LabUser,
  PatientLabRecordFilters,
  PatientLabRequestResponse,
  PatientRecord,
  SaveLabResultPayload,
  UpdateLabRequestStatusPayload,
} from "@/types/LabTypes";
import { PaginationMeta } from "@/types/RequestTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";

const LAB_REQUESTS_QUERY_KEY = ["lab", "requests"] as const;
const LAB_TESTS_QUERY_KEY = ["lab", "tests"] as const;
const LAB_USERS_QUERY_KEY = ["lab", "users"] as const;
const LAB_PATIENT_DIRECTORY_QUERY_KEY = ["lab", "patient-directory"] as const;
const LAB_PATIENT_REQUESTS_QUERY_KEY = ["lab", "patient-requests"] as const;
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
    filters.page ?? 1,
    filters.limit ?? 10,
  ] as const;

const getPatientLabRequestsQueryKey = (patientId: number) =>
  [...LAB_PATIENT_REQUESTS_QUERY_KEY, patientId] as const;

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
    refetchOnWindowFocus: true,
  });

export const useLabTestCatalog = () =>
  useQuery<LabTestCatalogItem[]>({
    queryKey: LAB_TESTS_QUERY_KEY,
    queryFn: fetchLabTests,
    staleTime: 5 * 60 * 1000,
  });

export const useLabUsers = () =>
  useQuery<LabUser[]>({
    queryKey: LAB_USERS_QUERY_KEY,
    queryFn: fetchLabUsers,
    staleTime: 5 * 60 * 1000,
  });

export const useLabRequest = (labId?: number) =>
  useQuery<LabRequest>({
    queryKey: labId ? getLabRequestQueryKey(labId) : ["lab", "request", "unknown"],
    queryFn: () => fetchLabRequest(labId as number),
    enabled: typeof labId === "number" && Number.isFinite(labId) && labId > 0,
  });

export const useLabPatientDirectory = (search: string, enabled = true) =>
  useQuery<PatientRecord[]>({
    queryKey: [...LAB_PATIENT_DIRECTORY_QUERY_KEY, search],
    queryFn: () => fetchPatientRecords(search),
    enabled,
    staleTime: 30 * 1000,
  });

export const usePatientLabRecords = (
  patientId?: number,
  filters: PatientLabRecordFilters = {}
) =>
  useQuery<{ data: LabRequest[]; pagination: PaginationMeta }>({
    queryKey: patientId
      ? getPatientLabRecordsQueryKey(patientId, filters)
      : [...LAB_PATIENT_RECORDS_QUERY_KEY, "unknown"],
    queryFn: () => fetchPatientLabRecords(patientId as number, filters),
    enabled: typeof patientId === "number" && Number.isFinite(patientId) && patientId > 0,
  });

export const usePatientLabRequests = (
  patientId?: number
) =>
  useQuery<PatientLabRequestResponse[]>({
    queryKey: patientId
      ? getPatientLabRequestsQueryKey(patientId)
      : [...LAB_PATIENT_REQUESTS_QUERY_KEY, "unknown"],

    queryFn: () =>
      fetchPatientLabRequests(patientId as number),

    enabled:
      typeof patientId === "number" &&
      Number.isFinite(patientId) &&
      patientId > 0,
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

      SweetAlert.successAlert(
        "Success",
        "Result is saved successfully"
      );
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Save Failed",
        getApiErrorMessage(error, "Unable to save laboratory results.")
      );
    },
  });
};


export const useLabResultPreview = (
  labid?: number,
  itemId?: number
) =>
  useQuery({
    queryKey: ["lab-preview", labid, itemId],
    queryFn: () =>
      fetchLabResultPreview(
        labid as number,
        itemId
      ),
    enabled:
      typeof labid === "number" &&
      labid > 0,
  });

export const useExternalLabAttachments = (patientId?: number) =>
  useQuery({
    queryKey: ["lab", "external-attachments", patientId],
    queryFn: () => fetchExternalLabAttachments(patientId as number),
    enabled: typeof patientId === "number" && Number.isFinite(patientId) && patientId > 0,
  });

export const useExternalLabAttachmentWorklist = () =>
  useQuery<ExternalLabAttachmentWorklistItem[]>({
    queryKey: ["lab", "external-attachment-worklist"],
    queryFn: fetchExternalLabAttachmentWorklist,
    refetchOnWindowFocus: true,
  });

export const useUploadExternalLabAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadExternalLabAttachmentPayload) =>
      uploadExternalLabAttachment(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["lab", "external-attachments", payload.patientId],
      });
      SweetAlert.successAlert("Attachment saved", "The external laboratory result is now linked to this patient.");
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Upload Failed",
        getApiErrorMessage(error, "Unable to attach the laboratory result.")
      );
    },
  });
};

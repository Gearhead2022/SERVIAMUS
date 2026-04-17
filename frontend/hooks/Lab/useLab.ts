import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLabRequests,
  saveLabResult,
  updateLabRequestStatus,
} from "@/services/lab.service";
import {
  LabRequest,
  SaveLabResultPayload,
  UpdateLabRequestStatusPayload,
} from "@/types/LabTypes";
import SweetAlert from "@/utils/SweetAlert";

const LAB_REQUESTS_QUERY_KEY = ["lab", "requests"];

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
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update the laboratory request."
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
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Save Failed",
        error instanceof Error ? error.message : "Unable to save laboratory results."
      );
    },
  });
};

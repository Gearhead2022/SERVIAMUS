import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToQueue,
  getQueueByType,
  getServingPatient,
  moveToNextQueue,
  skipQueue,
  getAllQueues,
} from "@/services/queue.services";
import SweetAlert from "@/utils/SweetAlert";
import { AddToQueuePayload } from "@/types/QueueTypes";

export const useAddToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToQueuePayload) => addToQueue(payload),

    onSuccess: (data) => {
      SweetAlert.successAlert(
        "Success",
        `Patient added to ${data.queue_type} queue (#${data.queue_number})`
      );
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Failed",
        error instanceof Error ? error.message : "Failed to add to queue"
      );
    },
  });
};

export const useGetQueueByType = (queue_type: "CONSULTATION" | "LABORATORY") => {
  return useQuery({
    queryKey: ["queue", queue_type],
    queryFn: () => getQueueByType(queue_type),
  });
};

export const useGetServingPatient = (queue_type: "CONSULTATION" | "LABORATORY") => {
  return useQuery({
    queryKey: ["serving", queue_type],
    queryFn: () => getServingPatient(queue_type),
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });
};

export const useMoveToNextQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queue_type: "CONSULTATION" | "LABORATORY") =>
      moveToNextQueue(queue_type),

    onSuccess: (data, queue_type) => {
      queryClient.invalidateQueries({ queryKey: ["queue", queue_type] });
      queryClient.invalidateQueries({ queryKey: ["serving", queue_type] });
      
      if (data) {
        SweetAlert.successAlert(
          "Success",
          `Patient ${data.queue_number} now serving`
        );
      }
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Failed",
        error instanceof Error ? error.message : "Failed to move queue"
      );
    },
  });
};

export const useSkipQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queue_id: number) => skipQueue(queue_id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      SweetAlert.successAlert("Success", "Patient skipped");
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Failed",
        error instanceof Error ? error.message : "Failed to skip queue"
      );
    },
  });
};

export const useGetAllQueues = () => {
  return useQuery({
    queryKey: ["queue"],
    queryFn: () => getAllQueues(),
    refetchInterval: 2000,
  });
};
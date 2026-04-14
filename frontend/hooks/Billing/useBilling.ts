import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBillingByRequestId,
  getBillingById,
  createBilling,
  processPayment,
  updateBillingStatus,
} from "@/services/billing.services";
import SweetAlert from "@/utils/SweetAlert";
import { PaymentProps } from "@/types/BillingTypes";

export const useGetBillingByRequestId = (req_id?: number) => {
  return useQuery({
    queryKey: ["billing", req_id],
    queryFn: () => getBillingByRequestId(req_id!),
    enabled: !!req_id,
  });
};

export const useGetBillingById = (billing_id?: number) => {
  return useQuery({
    queryKey: ["billing", billing_id],
    queryFn: () => getBillingById(billing_id!),
    enabled: !!billing_id,
  });
};

export const useCreateBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ req_id, serviceIds }: { req_id: number; serviceIds: number[] }) =>
      createBilling(req_id, serviceIds),

    onSuccess: () => {
      SweetAlert.successAlert("Success", "Billing created successfully");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Billing Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useProcessPayment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentProps) => processPayment(data),

    onSuccess: () => {
      SweetAlert.successAlert("Success", "Payment processed successfully");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      if (onSuccess) onSuccess();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Payment Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useUpdateBillingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billing_id, status }: { billing_id: number; status: "PENDING" | "DONE" }) =>
      updateBillingStatus(billing_id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};
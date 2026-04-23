import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBillings, payBilling } from "@/services/billing.service";
import { BillingRecord, PaymentMethod } from "@/types/BillingTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";

const BILLINGS_QUERY_KEY = ["billing", "records"];

const mergeUpdatedBilling = (
  currentBillings: BillingRecord[] | undefined,
  updatedBilling: BillingRecord
) => {
  if (!currentBillings?.length) {
    return [updatedBilling];
  }

  return currentBillings.map((billing) =>
    billing.billingId === updatedBilling.billingId ? updatedBilling : billing
  );
};

export const useBillings = () =>
  useQuery<BillingRecord[]>({
    queryKey: BILLINGS_QUERY_KEY,
    queryFn: fetchBillings,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

export const usePayBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      billingId,
      method,
    }: {
      billingId: number;
      method?: PaymentMethod;
    }) => payBilling(billingId, method),
    onSuccess: (updatedBilling) => {
      queryClient.setQueryData<BillingRecord[]>(
        BILLINGS_QUERY_KEY,
        (currentBillings) => mergeUpdatedBilling(currentBillings, updatedBilling)
      );

      SweetAlert.successAlert(
        "Payment Posted",
        `${updatedBilling.patientName}'s laboratory billing is now marked as paid.`
      );
    },
    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Payment Failed",
        getApiErrorMessage(error, "Unable to update the billing record.")
      );
    },
  });
};
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
      // Don't show alert here - let the component handle it
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      if (onSuccess) onSuccess();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Payment Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
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

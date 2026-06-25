import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBillingByRequestId,
  getBillingById,
  createBilling,
  processPayment,
  updateBillingStatus,
  updateBillingDiscount,
} from "@/services/billing.services";
import {
  fetchBillings,
  fetchPayment,
  payBilling as payBillingDirect,
} from "@/services/billing.service";
import { BillingRecord, PaymentMethod, PaymentProps, PaymentRecord } from "@/types/BillingTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";
import { BillingStats, HistoryParams, PaymentStats, TableRequestProps } from "../Consultation/useConsultation";

const BILLINGS_QUERY_KEY = ["billing", "request", "lab", "consulation"];

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

export const useBillings = (param: HistoryParams) =>
  useQuery<TableRequestProps<BillingRecord, BillingStats>>({
    queryKey: ["billing", param],
    queryFn: () => fetchBillings(param.page, param.limit, param.search, param.status, param.type ?? 'ALL', param.dateFrom, param.dateTo, param.sort),
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
    }) => payBillingDirect(billingId, method || "CASH"),
    onSuccess: (updatedBilling) => {
      queryClient.setQueryData<BillingRecord[]>(
        BILLINGS_QUERY_KEY,
        (currentBillings) => mergeUpdatedBilling(currentBillings, updatedBilling)
      );

      SweetAlert.successAlert(
        "Payment Posted",
        "Billing record has been marked as paid."
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

export const useGetAllPayment = (param: HistoryParams) => {
  return useQuery<TableRequestProps<PaymentRecord, PaymentStats>>({
    queryKey: ["billing", param],
    queryFn: () => fetchPayment(param.search, param.status, param.method, param.type, param.dateFrom, param.dateTo, param.sort),
    enabled: true,
  });
};

export const useUpdateBillingDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billing_id, discount, discount_reason }: { billing_id: number; discount: number, discount_reason?: string | null }) =>
      updateBillingDiscount(billing_id, discount, discount_reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing"],
      });

      queryClient.invalidateQueries({
        queryKey: ["billing-details"],
      });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};
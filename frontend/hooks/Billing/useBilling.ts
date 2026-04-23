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

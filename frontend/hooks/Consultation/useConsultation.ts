import { useMutation } from "@tanstack/react-query";
import { consultationResults } from "@/services/consultation.services";
import SweetAlert from "@/utils/SweetAlert";

export const useConsultaion = () => {
  return useMutation({
    mutationFn: consultationResults,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Patient request registered successfully"
      );
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};
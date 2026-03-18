import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services/auth.service";
import SweetAlert from "../utils/SweetAlert";

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "User registered successfully"
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

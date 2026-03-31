import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { fetchRoles,login, registerUser } from "../services/auth.service";
import SweetAlert from "../utils/SweetAlert";
import { Role } from "../types/AuthTypes";

export const useAuthRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["auth", "roles"],
    queryFn: fetchRoles
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({
      username,
      password
    }: {
      username: string;
      password: string;
    }) => login(username, password)
  });
};

export const useRegister = (closeModal: () => void) => {
  return useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "User registered successfully"
      );
      closeModal();
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

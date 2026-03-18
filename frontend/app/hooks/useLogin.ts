import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "@/app/services/auth.service";
import { useAuth } from "@/app/context/AuthContext";
import SweetAlert from "@/app/utils/SweetAlert";

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: ({
      username,
      password
    }: {
      username: string;
      password: string;
    }) => loginApi(username, password),

    onSuccess: (data) => {
      login(data.token, data.user);
      SweetAlert.successAlert(
        "Success",
        "Login successful"
      );
    },

    onError: () => {
      SweetAlert.errorAlert(
        "Error",
        "Invalid credentials"
      );
    }
  });
};

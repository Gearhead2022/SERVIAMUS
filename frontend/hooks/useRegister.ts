import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser, editUser, registerUser } from "../services/auth.service";
import SweetAlert from "../utils/SweetAlert";
import { UpdateUserPayload } from "@/types/AuthTypes";

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "User registered successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error: unknown) => {
      SweetAlert.errorAlert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ user_id, data }: {
      user_id: number;
      data: UpdateUserPayload;
    }) => editUser(user_id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      SweetAlert.successAlert(
        "Success",
        "User updated successfully"
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

export const useDeleteUser = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user_id: number) =>
      deleteUser(user_id),

    onSuccess: () => {
      SweetAlert.successAlert(
        "Success",
        "Request deleted successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });
};


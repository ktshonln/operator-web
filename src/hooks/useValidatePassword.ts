import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface ValidatePasswordRequest {
  password: string;
}

export const useValidatePassword = () => {
  return useMutation({
    mutationFn: async (data: ValidatePasswordRequest) => {
      const response = await axiosInstance.post(
        "/users/me/validate-password",
        data,
      );
      return response.status === 204;
    },
  });
};

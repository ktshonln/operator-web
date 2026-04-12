import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface Toggle2FARequest {
  enabled: boolean;
}

export interface Toggle2FAResponse {
  two_factor_enabled: boolean;
}

export const useToggle2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Toggle2FARequest) => {
      const response = await axiosInstance.patch<Toggle2FAResponse>(
        "/users/me/2fa",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate current user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

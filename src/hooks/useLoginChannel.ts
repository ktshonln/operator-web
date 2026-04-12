import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface RequestLoginChannelChangeRequest {
  channel: "phone" | "email";
}

export interface RequestLoginChannelChangeResponse {
  expires_in: number;
}

export interface ConfirmLoginChannelChangeRequest {
  channel: "phone" | "email";
  otp: string;
}

export interface ConfirmLoginChannelChangeResponse {
  login_channel: "phone" | "email";
}

export const useRequestLoginChannelChange = () => {
  return useMutation({
    mutationFn: async (data: RequestLoginChannelChangeRequest) => {
      const response =
        await axiosInstance.post<RequestLoginChannelChangeResponse>(
          "/users/me/login-channel",
          data,
        );
      return response.data;
    },
  });
};

export const useConfirmLoginChannelChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfirmLoginChannelChangeRequest) => {
      const response =
        await axiosInstance.post<ConfirmLoginChannelChangeResponse>(
          "/users/me/login-channel/confirm",
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

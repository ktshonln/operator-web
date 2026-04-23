import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface RequestLoginChannelChange {
  channel: "phone" | "email";
  identifier?: string; // change mode only
}

export interface RequestLoginChannelResponse {
  expires_in: number;
  masked_identifier: string;
}

export interface ConfirmLoginChannelChange {
  channel: "phone" | "email";
  otp: string;
}

export const useRequestLoginChannelChange = () => {
  return useMutation({
    mutationFn: async (data: RequestLoginChannelChange) => {
      const { data: res } = await axiosInstance.post<RequestLoginChannelResponse>(
        "/users/me/login-channel",
        data
      );
      return res;
    },
  });
};

export const useConfirmLoginChannelChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ConfirmLoginChannelChange) => {
      const { data: res } = await axiosInstance.post<{ login_channel: "phone" | "email" }>(
        "/users/me/login-channel/confirm",
        data
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useResendLoginChannelOtp = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.post("/auth/resend-otp", {
        user_id: userId,
        purpose: "login_channel_change",
      });
    },
  });
};

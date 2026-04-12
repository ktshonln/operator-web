import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface AcceptInviteRequest {
  token: string;
  password: string;
}

export interface AcceptInviteResponse {
  message: string;
  user_id: string;
  channels: ("phone" | "email")[];
}

export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: async (data: AcceptInviteRequest) => {
      const response = await axiosInstance.post<AcceptInviteResponse>(
        "/users/accept-invite",
        data,
      );
      return response.data;
    },
  });
};

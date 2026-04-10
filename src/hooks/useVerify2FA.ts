import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { AuthUser, Tokens } from "./useLogin";

export interface Verify2FAPayload {
  user_id: string;
  otp: string;
  device_name?: string;
}

export interface Verify2FAResponse {
  user: AuthUser;
  tokens: Tokens;
}

const apiClient = new APIClient<Verify2FAResponse>("/auth/verify-2fa");

const useVerify2FA = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation<Verify2FAResponse, Error, Verify2FAPayload>({
    mutationFn: async (payload: Verify2FAPayload) => {
      const response = await apiClient.post<Verify2FAPayload>(payload);
      return response;
    },
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("access_token", response.tokens.access_token);
      localStorage.setItem("refresh_token", response.tokens.refresh_token);
      localStorage.removeItem("user_id_pending_2fa");
      showToast("2FA verification successful", "success");
      navigate("/home");
    },
    onError: (error) => {
      showToast(error.message || "2FA verification failed", "error");
    },
  });
};

export default useVerify2FA;

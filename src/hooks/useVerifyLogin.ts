import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { AuthUser, Tokens } from "./useLogin";

export interface VerifyLoginPayload {
  user_id: string;
  otp: string;
  channel: "phone" | "email";
  device_name?: string;
}

export interface VerifyLoginResponse {
  user: AuthUser;
  tokens: Tokens;
}

const apiClient = new APIClient<VerifyLoginResponse>("/auth/verify-login");

const useVerifyLogin = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation<VerifyLoginResponse, Error, VerifyLoginPayload>({
    mutationFn: async (payload: VerifyLoginPayload) => {
      const response = await apiClient.post<VerifyLoginPayload>(payload);
      return response;
    },
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("access_token", response.tokens.access_token);
      localStorage.setItem("refresh_token", response.tokens.refresh_token);
      localStorage.removeItem("user_id_pending_verification");
      showToast("Account verified successfully", "success");
      navigate("/home");
    },
    onError: (error) => {
      showToast(error.message || "Verification failed", "error");
    },
  });
};

export default useVerifyLogin;

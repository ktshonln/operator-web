import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../stores/toastStore";
import { AuthUser, Tokens } from "./useLogin";
import authService from "../services/authService";
import { friendlyAuthError } from "../services/authService";

export interface Verify2FAPayload {
  user_id: string;
  otp: string;
  device_name?: string;
}

export interface Verify2FAResponse {
  user: AuthUser;
  tokens?: Tokens;
}

const useVerify2FA = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation<Verify2FAResponse, Error, Verify2FAPayload>({
    mutationFn: (payload: Verify2FAPayload) =>
      authService.verify2FA(payload) as Promise<Verify2FAResponse>,
    retry: false,
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.user));
      if (response.tokens) {
        localStorage.setItem("access_token", response.tokens.access_token);
        localStorage.setItem("refresh_token", response.tokens.refresh_token);
      }
      localStorage.removeItem("user_id_pending_2fa");
      showToast("Verification successful. Welcome back!", "success");
      navigate("/home");
    },
    onError: (error: any) => {
      const msg = friendlyAuthError(error) || error?.message || "Verification failed. Please try again.";
      showToast(msg, "error");
    },
  });
};

export default useVerify2FA;

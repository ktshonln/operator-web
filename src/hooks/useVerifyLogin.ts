import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../stores/toastStore";
import { AuthUser, Tokens } from "./useLogin";
import authService from "../services/authService";
import { friendlyAuthError } from "../services/authService";

export interface VerifyLoginPayload {
  user_id: string;
  otp: string;
  channel: "phone" | "email";
  device_name?: string;
}

export interface VerifyLoginResponse {
  user: AuthUser;
  tokens?: Tokens;
}

const useVerifyLogin = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation<VerifyLoginResponse, Error, VerifyLoginPayload>({
    mutationFn: (payload: VerifyLoginPayload) =>
      authService.verifyLogin(payload) as Promise<VerifyLoginResponse>,
    retry: false,
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.user));
      if (response.tokens) {
        localStorage.setItem("access_token", response.tokens.access_token);
        localStorage.setItem("refresh_token", response.tokens.refresh_token);
      }
      localStorage.removeItem("user_id_pending_verification");
      showToast("Account verified. Welcome!", "success");
      navigate("/home");
    },
    onError: (error: any) => {
      const msg = friendlyAuthError(error) || error?.message || "Verification failed. Please try again.";
      showToast(msg, "error");
    },
  });
};

export default useVerifyLogin;

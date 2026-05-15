import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface LoginDetails {
  identifier: string;
  password: string;
  user_type: "staff" | "passenger";
  device_name?: string;
}

export interface CaslRule {
  action: string;
  subject: string;
  conditions?: Record<string, unknown> | null;
  inverted?: boolean | null;
}

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  user_type: "passenger" | "staff";
  avatar_path: string | null;
  org_id: string | null;
  roles: string[];
  status: "active" | "pending_verification" | "suspended";
  two_factor_enabled: boolean;
  permissions?: CaslRule[];
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens?: Tokens;
}

export interface Login2FAResponse {
  requires_2fa: true;
  user_id: string;
  expires_in: number;
}

export interface LoginVerificationResponse {
  requires_verification: true;
  user_id: string;
  channel: "phone" | "email";
  expires_in: number;
}

// Map raw API error codes to user-friendly messages
function friendlyLoginError(code: string | undefined, fallback: string): string {
  switch (code) {
    case "INVALID_CREDENTIALS": return "Incorrect email/phone or password.";
    case "PHONE_LOGIN_REQUIRED": return "This account uses phone number to log in.";
    case "EMAIL_LOGIN_REQUIRED": return "This account uses email to log in.";
    case "ACCOUNT_SUSPENDED": return "Your account has been suspended. Please contact support.";
    case "VALIDATION_ERROR": return "Please check your email/phone and password and try again.";
    case "RATE_LIMIT_EXCEEDED": return "Too many login attempts. Please wait a few minutes and try again.";
    case "USER_NOT_FOUND": return "No account found with these credentials.";
    default: return fallback || "Login failed. Please try again.";
  }
}

const apiClient = new APIClient<LoginResponse | Login2FAResponse | LoginVerificationResponse>(
  "/auth/login",
);

const useLogin = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation<LoginResponse | Login2FAResponse | LoginVerificationResponse, any, LoginDetails>({
    mutationFn: apiClient.loginUser<LoginDetails>,
    onSuccess: (response) => {
      if ("requires_2fa" in response && response.requires_2fa) {
        localStorage.setItem("user_id_pending_2fa", response.user_id);
        navigate(`/login-mfa?expires_in=${response.expires_in}`);
        return;
      }

      if ("requires_verification" in response && response.requires_verification) {
        localStorage.setItem("user_id_pending_verification", response.user_id);
        navigate(`/login-mfa?user_id=${response.user_id}&channel=${response.channel}&expires_in=${response.expires_in}&mode=verify`);
        return;
      }

      const loginResponse = response as LoginResponse;
      localStorage.setItem("user", JSON.stringify(loginResponse.user));

      if (loginResponse.tokens) {
        localStorage.setItem("access_token", loginResponse.tokens.access_token);
        localStorage.setItem("refresh_token", loginResponse.tokens.refresh_token);
      }

      showToast("Successfully logged in", "success");
      navigate("/home");
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code ?? error?.response?.data?.code;
      const rawMessage = error?.response?.data?.error?.message ?? error?.message ?? "";
      showToast(friendlyLoginError(code, rawMessage), "error");
    },
  });
};

export default useLogin;

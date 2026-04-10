import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface LoginDetails {
  identifier: string;
  password: string;
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
  tokens: Tokens;
}

export interface Login2FAResponse {
  requires_2fa: true;
  user_id: string;
  expires_in: number;
}

const apiClient = new APIClient<LoginResponse | Login2FAResponse>(
  "/auth/login",
);
const useLogin = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<LoginResponse | Login2FAResponse, Error, LoginDetails>({
    mutationFn: apiClient.loginUser<LoginDetails>,
    onSuccess: (response: LoginResponse | Login2FAResponse) => {
      // Clear any sensitive data from memory on successful login
      if ("requires_2fa" in response && response.requires_2fa) {
        localStorage.setItem("user_id_pending_2fa", response.user_id);
        navigate(`/login-2fa?expires_in=${response.expires_in}`);
      } else {
        const loginResponse = response as LoginResponse;
        localStorage.setItem("user", JSON.stringify(loginResponse.user));
        localStorage.setItem("access_token", loginResponse.tokens.access_token);
        localStorage.setItem(
          "refresh_token",
          loginResponse.tokens.refresh_token,
        );
        showToast("Successfully logged in", "success");
        navigate("/home");
      }
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useLogin;

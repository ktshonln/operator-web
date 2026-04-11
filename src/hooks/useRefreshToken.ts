import { useMutation } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AuthUser, Tokens } from "./useLogin";

export interface RefreshResponse {
  user: AuthUser;
  tokens?: Tokens; // Optional - only present for mobile clients
}

const apiClient = new APIClient<RefreshResponse>("/auth/refresh");

const useRefreshToken = () => {
  return useMutation<RefreshResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post({});
      return response;
    },
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.user));

      // Handle tokens based on client type
      if (response.tokens) {
        // Mobile client - tokens in response body
        localStorage.setItem("access_token", response.tokens.access_token);
        localStorage.setItem("refresh_token", response.tokens.refresh_token);
      }
      // For web clients, tokens are automatically updated via cookies
    },
  });
};

export default useRefreshToken;

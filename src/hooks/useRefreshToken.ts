import { useMutation } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AuthUser, Tokens } from "./useLogin";

export interface RefreshResponse {
  user: AuthUser;
  tokens: Tokens;
}

const apiClient = new APIClient<RefreshResponse>("/auth/refresh");

const useRefreshToken = () => {
  return useMutation<RefreshResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post({});
      return response;
    },
    onSuccess: (response) => {
      localStorage.setItem("access_token", response.tokens.access_token);
      localStorage.setItem("refresh_token", response.tokens.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));
    },
  });
};

export default useRefreshToken;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface InviteUserRequest {
  first_name: string;
  last_name: string;
  role_slug: string;
  org_id?: string;
  email?: string;
  phone_number?: string;
  locale?: "rw" | "en" | "fr";
}

export interface InviteUserResponse {
  invite_token: string;
  expires_at: string;
}

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteUserRequest) => {
      const response = await axiosInstance.post<InviteUserResponse>(
        "/users/invite",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

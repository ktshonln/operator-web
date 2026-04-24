import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface ResendInvitationResponse {
  expires_at: string;
}

export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post<ResendInvitationResponse>(
        `/users/invitations/${id}/resend`
      );
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["invitation", id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
};

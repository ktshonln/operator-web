import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface UpdateInvitationRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role_slug?: string;
  locale?: "rw" | "en" | "fr";
}

export const useUpdateInvitation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInvitationRequest) => {
      const response = await axiosInstance.patch(
        `/users/invitations/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation", id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
};

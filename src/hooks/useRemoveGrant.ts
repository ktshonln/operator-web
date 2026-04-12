import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export const useRemoveGrant = (roleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (grantId: string) => {
      await axiosInstance.delete(`/roles/${roleId}/grants/${grantId}`);
    },
    onSuccess: () => {
      // Invalidate roles list and specific role
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
    },
  });
};

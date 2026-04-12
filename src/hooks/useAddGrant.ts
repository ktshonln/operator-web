import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { Role } from "./useRoles";

export interface AddGrantRequest {
  pattern: string;
}

export const useAddGrant = (roleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddGrantRequest) => {
      const response = await axiosInstance.post<Role>(
        `/roles/${roleId}/grants`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate roles list and specific role
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
    },
  });
};

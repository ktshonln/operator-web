import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { Role } from "./useRoles";

export interface UpdateRoleRequest {
  name: string;
}

export const useUpdateRole = (roleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRoleRequest) => {
      const response = await axiosInstance.patch<Role>(
        `/roles/${roleId}`,
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

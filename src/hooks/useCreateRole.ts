import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { Role } from "./useRoles";

export interface CreateRoleRequest {
  name: string;
  slug?: string;
  org_id?: string;
  patterns: string[];
}

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      const response = await axiosInstance.post<Role>("/roles", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

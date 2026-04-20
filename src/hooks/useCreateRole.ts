import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { Role } from "./useRoles";
import { useToastStore } from "../stores/toastStore";

export interface CreateRoleRequest {
  name: string;
  slug?: string;
  org_id?: string;
  patterns: string[];
}

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      const response = await axiosInstance.post<Role>("/roles", data);
      return response.data;
    },
    onSuccess: () => {
      showToast(`Successfully created a new role!`, "success");

      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

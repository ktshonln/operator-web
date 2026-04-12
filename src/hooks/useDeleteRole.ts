import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      await axiosInstance.delete(`/roles/${roleId}`);
    },
    onSuccess: () => {
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

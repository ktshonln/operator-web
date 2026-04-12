import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { Role } from "./useRoles";

export const useRole = (roleId: string) => {
  return useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      const response = await axiosInstance.get<Role>(`/roles/${roleId}`);
      return response.data;
    },
    enabled: !!roleId,
  });
};

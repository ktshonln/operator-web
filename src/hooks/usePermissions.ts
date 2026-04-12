import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface Permission {
  id: string;
  code: string;
  action: string;
  subject: string;
  display_name: string;
  description?: string | null;
  group: string;
}

export interface PermissionsResponse {
  data: Permission[];
}

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response =
        await axiosInstance.get<PermissionsResponse>("/permissions");
      return response.data;
    },
  });
};

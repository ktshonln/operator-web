import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface Grant {
  id: string;
  pattern: string;
  is_managed: boolean;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  org_id?: string | null;
  is_managed: boolean;
  grants?: Grant[]; // only present when fetched by ID
}

export interface RolesResponse {
  data: Role[];
}

// GET /roles — list without grants
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axiosInstance.get<RolesResponse>("/roles");
      return response.data;
    },
  });
};

// GET /roles/:id — single role WITH grants
export const useRoleById = (roleId: string) => {
  return useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const response = await axiosInstance.get<Role>(`/roles/${roleId}`);
      return response.data;
    },
    enabled: !!roleId,
  });
};

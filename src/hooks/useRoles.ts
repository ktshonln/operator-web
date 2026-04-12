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
  grants: Grant[];
}

export interface RolesResponse {
  data: Role[];
}

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axiosInstance.get<RolesResponse>("/roles");
      return response.data;
    },
  });
};

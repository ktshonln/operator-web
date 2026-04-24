import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface Permission {
  code: string;
  display_name: string;
  description: string;
  subject: string;
  action: string;
  group?: string;
  scopes?: ("own" | "org" | "platform")[];
}

export interface PermissionsResponse {
  data: Permission[];
}

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await axiosInstance.get<Permission[]>("/permissions");
      // Normalise: API may return array directly or wrapped in { data: [] }
      const raw = response.data as any;
      const list: Permission[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
      return { data: list };
    },
    staleTime: 1000 * 60 * 60, // 1 hour - permissions don't change often
  });
};

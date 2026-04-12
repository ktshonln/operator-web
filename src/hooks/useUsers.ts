import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface UserListItem {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  avatar_path?: string | null;
  user_type: "passenger" | "staff";
  status: "active" | "pending_verification" | "suspended";
  roles: string[];
  org_id?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

export interface UsersResponse {
  data: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  status?: "active" | "pending_verification" | "suspended";
  user_type?: "passenger" | "staff";
  org_id?: string;
}

export const useUsers = (filters: UsersFilters = {}) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.user_type) params.append("user_type", filters.user_type);
      if (filters.org_id) params.append("org_id", filters.org_id);

      const response = await axiosInstance.get<UsersResponse>(
        `/users?${params.toString()}`,
      );
      return response.data;
    },
  });
};

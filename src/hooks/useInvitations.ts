import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface Invitation {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  role_slug: string | null;
  org_id: string | null;
  invited_by: string;
  expires_at: string;
  expired: boolean;
  created_at: string;
}

export interface InvitationsResponse {
  data: Invitation[];
  total: number;
  page: number;
  limit: number;
}

export interface UseInvitationsParams {
  page?: number;
  limit?: number;
  org_id?: string;
  search?: string;
}

export const useInvitations = (params: UseInvitationsParams = {}) => {
  const { page = 1, limit = 20, org_id, search } = params;

  return useQuery({
    queryKey: ["invitations", page, limit, org_id, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (org_id) queryParams.append("org_id", org_id);
      if (search) queryParams.append("search", search);

      const response = await axiosInstance.get<InvitationsResponse>(
        `/users/invitations?${queryParams.toString()}`
      );
      return response.data;
    },
  });
};

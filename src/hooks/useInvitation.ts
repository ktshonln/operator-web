import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface InvitationDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  role_slug: string | null;
  org_id: string | null;
  locale: "rw" | "en" | "fr";
  invited_by: string;
  expires_at: string;
  expired: boolean;
  created_at: string;
  direct_grants?: Array<{
    subject: string;
    action: string;
    scope: "own" | "org" | "platform";
  }>;
}

export const useInvitation = (id: string | undefined) => {
  return useQuery({
    queryKey: ["invitation", id],
    queryFn: async () => {
      if (!id) throw new Error("Invitation ID is required");
      const response = await axiosInstance.get<InvitationDetail>(
        `/users/invitations/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "../stores/toastStore";
import { axiosInstance } from "../services/apiClient";

// ─── Types aligned with spec ──────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: "company" | "cooperative" | "coop_member";
  status: "unverified" | "pending" | "active" | "suspended" | "rejected";
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  contact_phone_verified_at?: string | null;
  contact_email_verified_at?: string | null;
  tin?: string | null;
  license_number?: string | null;
  logo_path?: string | null;
  address?: string | null;
  parent_org_id?: string | null;
  parent_org?: { id: string; name: string; slug: string; status: string } | null;
  child_orgs?: { id: string; name: string; slug: string; status: string }[];
  cooperative_approved_at?: string | null;
  cooperative_approved_by?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  business_certificate_path?: string | null;
  rep_id_path?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  org_type: "company" | "cooperative" | "coop_member";
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string; // E.164 format e.g. +250788000001
  tin: string;           // exactly 9 digits
  license_number?: string;
  address?: string;
  parent_org_id?: string; // required when org_type === 'coop_member'
}

export interface UpdateOrganizationPayload {
  name?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  logo_path?: string | null;
  // admin-only fields
  status?: "active" | "suspended" | "rejected";
  rejection_reason?: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useOrganization = () => {
  return useQuery({
    queryKey: ["organization", "me"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Organization>("/organizations/me");
      return data;
    },
  });
};

export const useOrganizations = (params?: {
  status?: Organization["status"];
  org_type?: Organization["org_type"];
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["organizations", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        | { data: Organization[]; total: number; page: number; limit: number }
        | Organization[]
      >("/organizations", { params });
      // Handle both paginated and legacy array responses
      if (Array.isArray(data)) {
        return { data, total: data.length, page: 1, limit: data.length };
      }
      return data;
    },
  });
};

export const useOrganizationById = (id: string) => {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Organization>(`/organizations/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrganizationPayload) => {
      const { data } = await axiosInstance.post<Organization>("/organizations", payload);
      return data;
    },
    onSuccess: () => {
      showToast("Organization created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to create organization", "error");
    },
  });
};

export const useUpdateOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationPayload }) => {
      const { data: updated } = await axiosInstance.patch<Organization>(`/organizations/${id}`, data);
      return updated;
    },
    onSuccess: (_, { id }) => {
      showToast("Organization updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", id] });
      queryClient.invalidateQueries({ queryKey: ["organization", "me"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to update organization", "error");
    },
  });
};

export const useDeleteOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/organizations/${id}`);
    },
    onSuccess: () => {
      showToast("Organization deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to delete organization", "error");
    },
  });
};

// Approve/reject via PATCH /organizations/:id { status: 'active' | 'rejected', rejection_reason? }
export const useApproveOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) => {
      const payload: UpdateOrganizationPayload =
        action === "approve"
          ? { status: "active" }
          : { status: "rejected", rejection_reason: reason };
      const { data } = await axiosInstance.patch<Organization>(`/organizations/${id}`, payload);
      return data;
    },
    onSuccess: (_, { action }) => {
      showToast(action === "approve" ? "Organization approved" : "Organization rejected", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to process organization", "error");
    },
  });
};

// Cooperative pre-approval: POST /organizations/:id/cooperative-approve
export const useCooperativeApprove = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post<Organization>(`/organizations/${id}/cooperative-approve`);
      return data;
    },
    onSuccess: () => {
      showToast("Cooperative pre-approval submitted", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to pre-approve", "error");
    },
  });
};

// Suspend: PATCH /organizations/:id { status: 'suspended' }
export const useSuspendOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.patch<Organization>(`/organizations/${id}`, { status: "suspended" });
      return data;
    },
    onSuccess: () => {
      showToast("Organization suspended", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to suspend organization", "error");
    },
  });
};

// Cooperative rejection: POST /organizations/:id/cooperative-reject
export const useCooperativeReject = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      await axiosInstance.post(`/organizations/${id}/cooperative-reject`, reason ? { reason } : {});
    },
    onSuccess: (_, { id }) => {
      showToast("Application rejected", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", id] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to reject", "error");
    },
  });
};

// Logo presigned URL
export const getOrgLogoPresignedUrl = async (
  contentType: string,
  orgId?: string // if provided → admin endpoint, else → me endpoint
): Promise<{ upload_url: string; path: string }> => {
  const url = orgId
    ? `/organizations/${orgId}/logo/presigned-url`
    : `/organizations/me/logo/presigned-url`;
  const { data } = await axiosInstance.get(url, { params: { content_type: contentType } });
  return data;
};

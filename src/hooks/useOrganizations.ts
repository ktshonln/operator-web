import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "../stores/toastStore";
import APIClient from "../services/apiClient";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: "company" | "cooperative";
  status: "pending" | "active" | "rejected" | "suspended";
  contact_email: string;
  contact_phone?: string;
  parent_org_id?: string | null;
  logo_path?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationPayload {
  name: string;
  org_type: "company" | "cooperative";
  contact_email: string;
  contact_phone?: string;
  parent_org_id?: string;
  logo_path?: string;
  address?: string;
}

export interface UpdateOrganizationPayload extends Partial<CreateOrganizationPayload> {
  status?: Organization["status"];
}

const apiClient = new APIClient<Organization>("/organizations");

// Get current user's organization
export const useOrganization = () => {
  return useQuery({
    queryKey: ["organization", "me"],
    queryFn: () => apiClient.get("me"),
  });
};

// Get all organizations (admin only)
export const useOrganizations = (params?: {
  status?: Organization["status"];
  org_type?: Organization["org_type"];
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["organizations", params],
    queryFn: () => apiClient.getAll({ params }),
  });
};

// Get single organization by ID
export const useOrganizationById = (id: string) => {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: () => apiClient.get(id),
    enabled: !!id,
  });
};

// Create organization
export const useCreateOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationPayload) => apiClient.post(data),
    onSuccess: () => {
      showToast("Organization created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to create organization", "error");
    },
  });
};

// Update organization
export const useUpdateOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrganizationPayload;
    }) => apiClient.patch(data, id),
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

// Delete organization
export const useDeleteOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(id),
    onSuccess: () => {
      showToast("Organization deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to delete organization", "error");
    },
  });
};

// Approve/reject organization (admin only)
export const useApproveOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    }) => apiClient.post({ action, reason }, `${id}/approve`),
    onSuccess: (_, { action }) => {
      const message =
        action === "approve"
          ? "Organization approved"
          : "Organization rejected";
      showToast(message, "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to process organization", "error");
    },
  });
};

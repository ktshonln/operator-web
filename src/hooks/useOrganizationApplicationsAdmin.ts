import { useMutation, useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface OrganizationApplication {
  id: string;
  name: string;
  org_type: "company" | "cooperative";
  tin: string;
  license_number: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  status: "pending" | "active" | "suspended";
  parent_org_id: string | null;
  created_at: string;
  updated_at?: string;
  logo_url?: string;
}

const apiClient = new APIClient<OrganizationApplication>(
  "/admin/organization-applications",
);

export const useOrganizationApplications = () => {
  return useQuery({
    queryKey: ["organization-applications"],
    queryFn: () => apiClient.getAll({}),
  });
};

export const useApproveOrganizationApplication = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch({ status }, id),
    onSuccess: () => {
      showToast("Organization application approved successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to approve application", "error"),
  });
};

export const useRejectOrganizationApplication = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(id),
    onSuccess: () => {
      showToast("Organization application rejected successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to reject application", "error"),
  });
};

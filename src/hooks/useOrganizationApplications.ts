import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface OrganizationApplicationPayload {
  name: string;
  org_type: "company" | "cooperative";
  tin: string;
  license_number: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  parent_org_id?: string;
  logo_url?: string;
}

export interface OrganizationApplicationResponse {
  id: string;
  name: string;
  slug: string;
  org_type: "company" | "cooperative";
  status: "pending" | "active" | "suspended";
  contact_email: string;
  contact_phone: string;
  parent_org_id: string | null;
  created_at: string;
  updated_at?: string;
  logo_url?: string;
}

const apiClient = new APIClient<OrganizationApplicationResponse>(
  "/organization-applications",
);

export const useSubmitOrganizationApplication = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OrganizationApplicationPayload) =>
      apiClient.registerUser<OrganizationApplicationPayload>(data),
    onSuccess: () => {
      showToast("Organization application submitted successfully", "success");
      navigate("/register/success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to submit application", "error"),
  });
};

export default useSubmitOrganizationApplication;

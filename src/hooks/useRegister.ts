import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface OrganizationRegistrationPayload {
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

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  org_type: "company" | "cooperative";
  status: "pending" | "active" | "suspended";
  contact_email: string;
  contact_phone: string;
  parent_org_id: string | null;
  created_at: string;
  logo_url?: string;
}

const apiClient = new APIClient<OrganizationResponse>("/api/v1/organizations");
const useRegister = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: apiClient.registerUser<OrganizationRegistrationPayload>,
    onSuccess: () => {
      showToast("Organization registered successfully", "success");
      navigate("/register/success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });
};

export default useRegister;

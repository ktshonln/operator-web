import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface AdminActivationPayload {
  token: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AdminActivationResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  organization_id?: string;
}

const apiClient = new APIClient<AdminActivationResponse>(
  "/api/v1/organizations/activate",
);

const useActivateOrganization = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<AdminActivationResponse, Error, AdminActivationPayload>({
    mutationFn: apiClient.registerUser<AdminActivationPayload>,
    onSuccess: () => {
      showToast("Admin account activated", "success");
      navigate("/login");
    },
    onError: (error: Error) => {
      showToast(error.message, "error");
      throw error;
    },
  });
};

export default useActivateOrganization;

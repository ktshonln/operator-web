import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface OrganizationApplicationPayload {
  name: string;
  org_type: "company" | "cooperative" | "coop_member";
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  tin: string;
  license_number: string;
  address: string;
  parent_org_id?: string;
  business_certificate_path: string;
  rep_id_path: string;
  logo_path?: string;
}

export interface OrganizationApplicationResponse {
  org_id: string;
  message: string;
}

export interface PresignedDocumentResponse {
  upload_url: string;
  key: string;
  path: string;
}

export const getOrganizationApplicationDocumentPresignedUrl = async (
  docType: "business_certificate" | "rep_id",
  contentType: string,
) => {
  return axiosInstance
    .get<PresignedDocumentResponse>(
      "/organizations/apply/documents/presigned-url",
      {
        params: {
          doc_type: docType,
          content_type: contentType,
        },
      },
    )
    .then((res) => res.data);
};

export const useSubmitOrganizationApplication = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: OrganizationApplicationPayload) =>
      axiosInstance
        .post<OrganizationApplicationResponse>("/organizations/apply", data)
        .then((res) => res.data),
    onError: (error: Error) =>
      showToast(error.message || "Failed to submit application", "error"),
  });
};

export const useVerifyOrganizationContact = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: { org_id: string; otp: string; channel: "phone" | "email" }) =>
      axiosInstance.post<void>("/organizations/verify-contact", data),
    onSuccess: () => {
      showToast("Organization contact verified successfully", "success");
    },
    onError: (error: Error) =>
      showToast(
        error.message || "Failed to verify organization contact",
        "error",
      ),
  });
};

export const useResendOrganizationVerificationOtp = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: { org_id: string; channel: "phone" | "email" }) =>
      axiosInstance
        .post<{ expires_in: number }>("/organizations/apply/resend-contact-otp", data)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Verification code resent successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to resend verification code", "error"),
  });
};

export default useSubmitOrganizationApplication;

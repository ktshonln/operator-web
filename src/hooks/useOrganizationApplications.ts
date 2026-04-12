import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
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
    mutationFn: (data: { org_id: string; otp: string }) =>
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
    mutationFn: (org_id: string) =>
      axiosInstance
        .post<{ message: string }>("/organizations/resend-otp", { org_id })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Verification code resent successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to resend verification code", "error"),
  });
};

export default useSubmitOrganizationApplication;

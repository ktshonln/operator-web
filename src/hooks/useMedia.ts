import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface PresignedUrlResponse {
  upload_url: string;
  path: string;
}

export const getUserAvatarPresignedUrl = async (
  contentType: string,
): Promise<PresignedUrlResponse> => {
  return axiosInstance
    .get<PresignedUrlResponse>("/users/me/avatar/presigned-url", {
      params: { content_type: contentType },
    })
    .then((res) => res.data);
};

export const getOrgLogoPresignedUrl = async (
  orgId: string,
  contentType: string,
): Promise<PresignedUrlResponse> => {
  return axiosInstance
    .get<PresignedUrlResponse>(`/organizations/${orgId}/logo/presigned-url`, {
      params: { content_type: contentType },
    })
    .then((res) => res.data);
};

export const getMyOrgLogoPresignedUrl = async (
  contentType: string,
): Promise<PresignedUrlResponse> => {
  return axiosInstance
    .get<PresignedUrlResponse>("/organizations/me/logo/presigned-url", {
      params: { content_type: contentType },
    })
    .then((res) => res.data);
};

export const useUpdateUserAvatar = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (avatarPath: string | null) =>
      axiosInstance.patch("/users/me", { avatar_path: avatarPath }),
    onSuccess: () => {
      showToast("Avatar updated successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to update avatar", "error"),
  });
};

export const useUpdateOrgLogo = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({
      orgId,
      logoPath,
    }: {
      orgId: string;
      logoPath: string | null;
    }) =>
      axiosInstance.patch(`/organizations/${orgId}`, { logo_path: logoPath }),
    onSuccess: () => {
      showToast("Logo updated successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to update logo", "error"),
  });
};

export const useUpdateMyOrgLogo = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (logoPath: string | null) =>
      axiosInstance.patch("/organizations/me", { logo_path: logoPath }),
    onSuccess: () => {
      showToast("Logo updated successfully", "success");
    },
    onError: (error: Error) =>
      showToast(error.message || "Failed to update logo", "error"),
  });
};

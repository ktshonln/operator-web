import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { USER_ME_KEY } from "./useUser";

export interface PresignedUrlResponse {
  upload_url: string;
  path: string;
}

export const useUserAvatar = () => {
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: GET presigned URL with content_type as query param (per spec)
      const { data } = await axiosInstance.get<PresignedUrlResponse>(
        `/users/me/avatar/presigned-url`,
        { params: { content_type: file.type } }
      );
      const { upload_url, path } = data;

      // Step 2: PUT file directly to presigned URL (no auth headers)
      await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Step 3: Commit path to user record
      await axiosInstance.patch("/users/me", { avatar_path: path });

      return path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ME_KEY });
    },
  });

  return { uploadAvatar };
};

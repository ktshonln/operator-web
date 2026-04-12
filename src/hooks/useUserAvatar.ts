import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface GetPresignedUrlResponse {
  upload_url: string;
  path: string;
}

export const useUserAvatar = () => {
  const queryClient = useQueryClient();

  const getPresignedUrl = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.get<GetPresignedUrlResponse>(
        "/users/me/avatar/presigned-url",
      );
      return response.data;
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      // First get the presigned URL
      const { upload_url, path } = await getPresignedUrl.mutateAsync();

      // Upload the file to the presigned URL
      const formData = new FormData();
      formData.append("file", file);

      await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Update the user's avatar path
      await axiosInstance.patch("/users/me", { avatar_path: path });

      return path;
    },
    onSuccess: () => {
      // Invalidate current user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    getPresignedUrl,
    uploadAvatar,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { USER_ME_KEY } from "./useUser";

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  avatar_path?: string | null;
  notif_channel?: ("sms" | "email" | "app")[]; // array per spec
  locale?: "rw" | "en" | "fr";
  two_factor_enabled?: boolean;
}

export interface UpdateUserMeRequest extends UpdateUserRequest {
  // Additional fields that can be updated for current user
}

export interface UpdateUserByIdRequest extends UpdateUserRequest {
  status?: "active" | "suspended";
  org_id?: string;
  role_slugs?: string[];
}

export type UserFullProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  phone_verified_at?: string | null;
  email_verified_at?: string | null;
  avatar_path?: string | null;
  user_type: "passenger" | "staff";
  status: "active" | "pending_verification" | "suspended";
  org_id?: string | null;
  roles: string[];
  driver_license_number?: string | null;
  driver_license_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
};

export const useUpdateUserMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserMeRequest) => {
      const response = await axiosInstance.patch("/users/me", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate current user data so useUser() re-fetches fresh profile
      queryClient.invalidateQueries({ queryKey: USER_ME_KEY });
    },
  });
};

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserByIdRequest) => {
      const response = await axiosInstance.patch<UserFullProfile>(
        `/users/${userId}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate users list and specific user
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

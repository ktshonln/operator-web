import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToastStore } from "../stores/toastStore";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../services/apiClient";

export const userRoles = ["admin", "agent", "agentManager"] as const;
export type Role = (typeof userRoles)[number] | string;

export interface StaffUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  email?: string | null;
  avatar_path?: string | null;
  user_type: "staff";
  status: "active" | "pending_verification" | "suspended";
  org_id: string | null;
  roles: string[];
  permissions: Array<{
    subject: string;
    action: string;
    conditions?: Record<string, unknown>;
    inverted?: boolean;
  }>;
  notif_channel: "sms" | "email" | "app" | "all";
  two_factor_enabled: boolean;
  driver_license_number?: string | null;
  driver_license_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PassengerUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  phone_verified_at?: string | null;
  email?: string | null;
  email_verified_at?: string | null;
  avatar_path?: string | null;
  user_type: "passenger";
  status: "active" | "pending_verification" | "suspended";
  notif_channel: "sms" | "email" | "app" | "all";
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type User = StaffUser | PassengerUser;

// ─── Shared query key ─────────────────────────────────────────────────────────
// All components that call useUser() share this key — one fetch, one cache entry.
export const USER_ME_KEY = ["user-me"] as const;

// ─── Public paths that don't require auth ─────────────────────────────────────
const PUBLIC_PATHS = [
  "/register",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-password-reset",
  "/accept-invite",
  "/i",
  "/login-mfa",
  "/activate",
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useUser = () => {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  const isPublicPath = PUBLIC_PATHS.some((p) =>
    window.location.pathname.startsWith(p)
  );

  const { data: user, isLoading: loading, error } = useQuery<User, Error>({
    queryKey: USER_ME_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<User>("/users/me");
      return res.data;
    },
    // Don't retry on 401 — just redirect to login
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
    // Cache for 5 minutes — user data rarely changes mid-session
    staleTime: 5 * 60 * 1000,
    // Keep cached data in memory for 10 minutes after component unmounts
    gcTime: 10 * 60 * 1000,
    // Don't fetch on public pages
    enabled: !isPublicPath,
  });

  // Handle auth errors — redirect to login if not on a public path
  useEffect(() => {
    if (!error || isPublicPath) return;
    const status = (error as any)?.response?.status;
    if (status === 401 || !user) {
      showToast("User not logged in", "error");
      navigate("/login");
    }
  }, [error, isPublicPath, navigate, showToast, user]);

  return { user: user ?? null, loading };
};

// ─── Helper to invalidate the user cache (call after profile updates) ─────────
export const useInvalidateUser = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: USER_ME_KEY });
};

export default useUser;

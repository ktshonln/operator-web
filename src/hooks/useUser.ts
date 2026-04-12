import { useEffect, useState } from "react";
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

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get<User>("/users/me")
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching logged in user", error);
        showToast("User not logged in", "error");
        navigate("/login");
        setLoading(false);
      });
  }, [navigate, showToast]);

  return { user, loading };
};

export default useUser;

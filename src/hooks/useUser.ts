import { useEffect, useState } from "react";
import { useToastStore } from "../stores/toastStore";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../services/apiClient";

export const userRoles = ["admin", "agent", "agentManager"] as const;
export type Role = (typeof userRoles)[number];
export interface LegacyUser {
  id?: string;
  firstName: string;
  lastName: string;
  userType: string;
  companyId: string;
  role: Role;
  branch: string;
}

export interface StaffUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  user_type: "staff";
  status: "active" | "pending_verification" | "suspended";
  org_id: string;
  roles: string[];
  permissions: Record<string, unknown>[];
  driver_license_number?: string | null;
  driver_license_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

const useUser = () => {
  const [user, setUser] = useState<LegacyUser>({} as LegacyUser);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get<LegacyUser>("/api/v1/users/me")
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

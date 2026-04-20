import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Role } from "./useUser";

export interface Agent {
  userId: string;
  inviteUserId: string;
  companyId: string;
  branch: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  status: string;
  joinedDate: string;
  avatarPath?: string | null;
  lastLoginAt?: string | null;
  userType?: 'passenger' | 'staff';
}

const apiClient = new APIClient<Agent>("/organizations");

const useAgent = (orgId: string, userId: string) =>
  useQuery<Agent, Error>({
    queryKey: ["organizations", orgId, "agents", userId],
    queryFn: () => apiClient.getAgent(orgId, userId),
    enabled: !!userId,
  });

export default useAgent;

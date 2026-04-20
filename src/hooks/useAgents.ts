import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { AgentQuery } from "../pages/ProfileSettings";
import { Agent } from "./useAgent";
import APIClient from "../services/apiClient";
import { CACHE_KEY_AGENTS } from "../utils/constants";

const apiClient = new APIClient<any>("/users");

const useAgents = (orgId: string, agentQuery: AgentQuery) =>
  useInfiniteQuery<Agent[], Error, InfiniteData<Agent[], number>>({
    queryKey: [CACHE_KEY_AGENTS, agentQuery, orgId],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        page: pageParam,
        limit: 20,
      };

      // Add org_id filter for platform admins
      if (orgId) {
        params.org_id = orgId;
      }

      // Add search filter if provided
      if (agentQuery.searchText) {
        params.search = agentQuery.searchText;
      }

      // Add status filter if provided
      if (agentQuery.status) {
        params.status = agentQuery.status;
      }

      // Add user_type filter if provided
      if (agentQuery.userType) {
        params.user_type = agentQuery.userType;
      }

      const res = await apiClient.getAll({ params });
      
      // Handle paginated response: { data: [], total: number, page: number, limit: number }
      const items = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      
      return items.map((user: any) => ({
         userId: user.id,
         firstName: user.first_name,
         lastName: user.last_name,
         email: user.email,
         phoneNumber: user.phone_number,
         role: (user.roles && user.roles.length > 0) ? user.roles[0] : 'user',
         status: user.status || 'pending_verification',
         joinedDate: user.created_at,
         orgId: user.org_id,
         avatarPath: user.avatar_path,
         lastLoginAt: user.last_login_at,
         userType: user.user_type as 'passenger' | 'staff' | undefined,
      }));
    },
    initialPageParam: 1,
    staleTime: 10 * 1000,
    placeholderData: (previousData, _previousQuery) =>
      previousData || { pages: [], pageParams: [] },
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: true, // Enable for all authenticated users
  });

export default useAgents;

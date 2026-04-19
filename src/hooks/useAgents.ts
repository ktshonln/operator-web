import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { AgentQuery } from "../pages/ProfileSettings";
import { Agent } from "./useAgent";
import APIClient from "../services/apiClient";
import { CACHE_KEY_AGENTS } from "../utils/constants";

const apiClient = new APIClient<any>("/users");

const useAgents = (orgId: string, agentQuery: AgentQuery) =>
  useInfiniteQuery<Agent[], Error, InfiniteData<Agent[], number>>({
    queryKey: [CACHE_KEY_AGENTS, agentQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.getAll({
        params: {
          org_id: orgId,
          search: agentQuery.searchText,
          page: pageParam,
        },
      });
      
      const items = res.data || (Array.isArray(res) ? res : []);
      return items.map((user: any) => ({
         userId: user.id,
         firstName: user.first_name || user.firstName,
         lastName: user.last_name || user.lastName,
         email: user.email,
         phoneNumber: user.phone_number || user.phoneNumber,
         role: (user.roles && user.roles.length > 0) ? user.roles[0] : (user.role || 'user'),
         status: user.status || 'invited',
         joinedDate: user.created_at || new Date().toISOString()
      }));
    },
    initialPageParam: 1,
    staleTime: 10 * 1000,
    placeholderData: (previousData, _previousQuery) =>
      previousData || { pages: [], pageParams: [] },
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: !!orgId,
  });

export default useAgents;

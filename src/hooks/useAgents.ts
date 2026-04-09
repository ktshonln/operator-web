import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { AgentQuery } from "../pages/ProfileSettings";
import { Agent } from "./useAgent";
import APIClient from "../services/apiClient";
import { CACHE_KEY_AGENTS } from "../utils/constants";

const apiClient = new APIClient<Agent[]>("/companies");

const useAgents = (companyId: string,agentQuery: AgentQuery) =>
  useInfiniteQuery<Agent[], Error, InfiniteData<Agent[], number>>({
    queryKey: [CACHE_KEY_AGENTS, agentQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllAgents(companyId,{
        params: {
          branch: agentQuery.branch?.name,
          ordering: agentQuery.sortOrder,
          search: agentQuery.searchText,
          page: pageParam,
        },
      }),
       initialPageParam: 1,
    staleTime: 10 * 1000,
    placeholderData: (previousData, _previousQuery) =>
      previousData || { pages: [], pageParams: [] },
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: !!companyId
  });

export default useAgents;

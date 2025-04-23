import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
import { AgentQuery } from "../pages/ProfileSettings";
import { Agent } from "./useAgent";
import APIClient from "../services/apiClient";

const apiClient = new APIClient<Agent[]>("/companies");

const useAgents = (companyId: string,agentQuery: AgentQuery) =>
  useInfiniteQuery<Agent[], Error>({
    queryKey: ["agents", agentQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllAgents(companyId,{
        params: {
          branch: agentQuery.branch?.name,
          ordering: agentQuery.sortOrder,
          search: agentQuery.searchText,
          page: pageParam,
        },
      }),
  });

export default useAgents;

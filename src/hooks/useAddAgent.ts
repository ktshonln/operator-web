import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_AGENTS } from "../utils/constants";
import { Agent } from "./useAgent";
import { Role } from "./useUser";


export  interface AgentDetails {
    inviteUserId: string;
    companyId: string;
    branch: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: Role;
}

interface EditAgentContext {
  previousAgents: Agent[];
}

const apiClient = new APIClient<Agent>("/companies");
const useAddAgent = (companyId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Agent, Error, AgentDetails, EditAgentContext>({
    mutationFn: (routeDetails: AgentDetails) =>
      apiClient.addAgent<AgentDetails>(routeDetails, companyId),
    onMutate: (newData) => {
        // Optimistic updates
        const previousData = queryClient.getQueryData<InfiniteData<Agent[]>>([CACHE_KEY_AGENTS]);
        // Create optimistic route object
      const optimisticAgent: Agent = {
        userId: `temp-${Date.now()}`,
        status: 'notActive',
        joinedDate: `temp-${Date.now()}`,
        ...newData
      };

      // Update cache for infinite query
      queryClient.setQueryData<InfiniteData<Agent[]>>(
        [CACHE_KEY_AGENTS],
        (oldData) => ({
          pages: oldData?.pages?.length 
            ? [[optimisticAgent], ...oldData.pages] 
            : [[optimisticAgent]],
          pageParams: oldData?.pageParams || [1]
        })
      );

      return { previousAgents: previousData?.pages?.flat() || [] };
    },
    onSuccess: (savedAgent) => {
        queryClient.setQueryData<InfiniteData<Agent[]>>(
    [CACHE_KEY_AGENTS],
    (oldData) => ({
      pages: oldData?.pages?.map(page => 
        page.map(agent => {
          // Find matching temp agent
          if (agent.userId === savedAgent.userId) {
            return {
              ...savedAgent,
            };
          }
          return agent;
        })
      ) || [],
      pageParams: oldData?.pageParams || []
    })
  );
  queryClient.invalidateQueries({
    queryKey: [CACHE_KEY_AGENTS],
    refetchType: 'active',
  });
      showToast("Successfully added a new agent!", "success");
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<Agent[]>(
        CACHE_KEY_AGENTS,
        context.previousAgents
      );
      showToast(error.message, "error");
    },
  });
};

export default useAddAgent;

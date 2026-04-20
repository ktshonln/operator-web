import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_AGENTS } from "../utils/constants";
import { Agent } from "./useAgent";
import { Role } from "./useUser";

export interface UserDetails {
  firstName: string;
  lastName: string;
  role: Role;
  orgId: string;
  email: string;
  phoneNumber: string;
  locale: string;
}

interface EditAgentContext {
  previousAgents: Agent[];
}

const useAddAgent = (orgId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Agent, Error, UserDetails, EditAgentContext>({
    mutationFn: async (routeDetails: UserDetails) => {
      const response = await axiosInstance.post("/users/invite", {
        first_name: routeDetails.firstName,
        last_name: routeDetails.lastName,
        role_slug: routeDetails.role,
        org_id: orgId,
        email: routeDetails.email,
        phone_number: routeDetails.phoneNumber,
        locale: "rw",
      });
      return {
        userId: response.data.id || `temp-${Date.now()}`,
        status: "invited",
        joinedDate: new Date().toISOString(),
        ...routeDetails,
      } as unknown as Agent;
    },
    onMutate: (newData) => {
      // Optimistic updates
      const previousData = queryClient.getQueryData<InfiniteData<Agent[]>>([
        CACHE_KEY_AGENTS,
      ]);
      // Create optimistic route object
      const optimisticAgent = {
        userId: `temp-${Date.now()}`,
        status: "notActive",
        joinedDate: `temp-${Date.now()}`,
        ...newData,
      } as unknown as Agent;

      // Update cache for infinite query
      queryClient.setQueryData<InfiniteData<Agent[]>>(
        [CACHE_KEY_AGENTS],
        (oldData) => ({
          pages: oldData?.pages?.length
            ? [[optimisticAgent], ...oldData.pages]
            : [[optimisticAgent]],
          pageParams: oldData?.pageParams || [1],
        }),
      );

      return { previousAgents: previousData?.pages?.flat() || [] };
    },
    onSuccess: (savedAgent) => {
      queryClient.setQueryData<InfiniteData<Agent[]>>(
        [CACHE_KEY_AGENTS],
        (oldData) => ({
          pages:
            oldData?.pages?.map((page) =>
              page.map((agent) => {
                // Find matching temp agent
                if (agent.userId === savedAgent.userId) {
                  return {
                    ...savedAgent,
                  };
                }
                return agent;
              }),
            ) || [],
          pageParams: oldData?.pageParams || [],
        }),
      );
      queryClient.invalidateQueries({
        queryKey: [CACHE_KEY_AGENTS],
        refetchType: "active",
      });
      showToast(`Successfully added a new ${savedAgent.role}!`, "success");
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<Agent[]>(
        CACHE_KEY_AGENTS,
        context.previousAgents,
      );
      showToast(error.message, "error");
    },
  });
};

export default useAddAgent;

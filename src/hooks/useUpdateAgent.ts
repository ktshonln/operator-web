import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_AGENTS } from "../utils/constants";
import { Agent } from "./useAgent";

interface UpdateAgentRoleInput {
  userId: string;
  role: string;
}

interface EditAgentContext {
  previousData?: InfiniteData<Agent[]>;
}

const useUpdateAgent = (orgId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<Agent, Error, UpdateAgentRoleInput, EditAgentContext>({
    mutationFn: ({ userId, role }) =>
      axiosInstance
        .put<Agent>(`/organizations/${orgId}/agents/${userId}`, { role })
        .then((res) => res.data),
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: CACHE_KEY_AGENTS });

      const previousData =
        queryClient.getQueryData<InfiniteData<Agent[]>>(CACHE_KEY_AGENTS);

      queryClient.setQueryData<InfiniteData<Agent[]>>(
        [CACHE_KEY_AGENTS],
        (oldData) => ({
          pages:
            oldData?.pages.map((page) =>
              page.map((agent) =>
                agent.userId === userId ? { ...agent, role } : agent,
              ),
            ) || [],
          pageParams: oldData?.pageParams || [],
        }),
      );

      return {
        previousData,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_AGENTS });
      showToast("User role updated successfully", "success");
    },
    onError: (error, _variables, context) => {
      if (!context?.previousData) return;
      queryClient.setQueryData<InfiniteData<Agent[]>>(
        [CACHE_KEY_AGENTS],
        context.previousData,
      );
      showToast(error.message, "error");
    },
  });
};

export default useUpdateAgent;

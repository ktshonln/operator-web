import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_ROUTES } from "../utils/constants";
import { Route } from "./useRoutes";

interface DeleteRouteResponse {
  routeId: string;
}

const apiClient = new APIClient<DeleteRouteResponse>("/organizations");
const useDeleteRoute = (orgId: string, routeId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<DeleteRouteResponse, Error>({
    mutationFn: () => apiClient.deleteRoute(orgId, routeId),
    onSuccess: (_savedData, _newData) => {
      // Invalidating cache for freshness
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) =>
        routes?.filter((route) => route.routeId !== routeId),
      );
      queryClient.invalidateQueries({
        queryKey: ["organization", orgId, "route", routeId],
      }); // Invalidate single route to get fresh data
      queryClient.invalidateQueries({
        queryKey: [CACHE_KEY_ROUTES],
        refetchType: "active",
      });
      showToast("Route deleted successfully!", "success");
      navigate(`/trips`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useDeleteRoute;

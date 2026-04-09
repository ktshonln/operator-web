import { useMutation, useQueryClient } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import {  CACHE_KEY_ROUTES } from "../utils/constants";
import { Route } from "./useRoutes";
import { RouteDetails } from "./useAddRoute";

interface EditRouteContext {
  previousRoutes: Route[];
}

const apiClient = new APIClient<Route>("/companies");
const useEditRoute = (companyId: string, routeId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Route, Error, RouteDetails, EditRouteContext>({
    mutationFn: (routeDetails: RouteDetails) =>
      apiClient.editRoute<RouteDetails>(routeDetails, companyId, routeId),
    onMutate: (newData) => {
      // Optimistic updates
      const previousRoutes =
        queryClient.getQueryData<Route[]>(CACHE_KEY_ROUTES) || [];
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) =>
        routes?.map((route) =>
          route.routeId === routeId ? { ...route,  price: newData.price,
          intermediateStops: [...route.intermediateStops], // !! aren't we neglecting newData intermediate stops?
          route: {
            ...route.route, // preserve startId and endId
            start: newData.route.start,
            end: newData.route.end,
          }, } : route
        )
      );
      return { previousRoutes };
    },
    onSuccess: (savedData, newData) => {
      // Invalidating cache for freshness
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) =>
        routes?.map((route) => ((route.routeId === routeId && route ===newData) ? savedData : route))
      );
      queryClient.invalidateQueries({
        queryKey: ["company", companyId, "route", routeId],
      }); // Invalidate single route to get fresh data
            queryClient.invalidateQueries({
    queryKey: [CACHE_KEY_ROUTES],
    refetchType: 'active',
  });
      showToast("Route successfully updated!", "success");
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<RouteDetails[]>(
        CACHE_KEY_ROUTES,
        context.previousRoutes
      );
      showToast(error.message, "error");
    },
  });
};

export default useEditRoute;

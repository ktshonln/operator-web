import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_ROUTES } from "../utils/constants";
import { Route } from "./useRoutes";

interface IntermediateStopDetails {
  name: string;
  price: number;
}

export interface RouteDetails {
  route: { start: string; end: string }; // origin stop id and destination id included
  price: number;
  intermediateStops?: IntermediateStopDetails[];
}

interface EditRouteContext {
  previousRoutes: Route[];
}

const apiClient = new APIClient<Route>("/organizations");
const useAddRoute = (orgId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<Route, Error, RouteDetails, EditRouteContext>({
    mutationFn: (routeDetails: RouteDetails) =>
      apiClient.addRoute<RouteDetails>(routeDetails, orgId),
    onMutate: (newData) => {
      // Optimistic updates
      const previousData = queryClient.getQueryData<InfiniteData<Route[]>>([
        CACHE_KEY_ROUTES,
      ]);
      // Create optimistic route object
      const optimisticRoute: Route = {
        routeId: `temp-${Date.now()}`,
        route: {
          startId: "temp-start",
          start: newData.route.start,
          endId: "temp-end",
          end: newData.route.end,
        },
        price: newData.price,
        intermediateStops: (newData.intermediateStops || []).map((stop) => ({
          stopId: `temp-stop-${Date.now()}`, // Generate temporary ID
          name: stop.name,
          price: stop.price,
        })),
      };

      // Update cache for infinite query
      queryClient.setQueryData<InfiniteData<Route[]>>(
        [CACHE_KEY_ROUTES],
        (oldData) => ({
          pages: oldData?.pages?.length
            ? [[optimisticRoute], ...oldData.pages]
            : [[optimisticRoute]],
          pageParams: oldData?.pageParams || [1],
        }),
      );

      /*  const previousRoutes =
        queryClient.getQueryData<Route[]>(CACHE_KEY_ROUTES) || [];
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) => routes?.map(route=>({
         ...route,  price: newData.price,
          intermediateStops: [...route.intermediateStops], // !! aren't we neglecting newData intermediate stops?
          route: {
            ...route.route, // preserve startId and endId
            start: newData.route.start,
            end: newData.route.end,
          }, 
      }))

      ); */
      return { previousRoutes: previousData?.pages?.flat() || [] };
    },
    onSuccess: (savedRoute) => {
      queryClient.setQueryData<InfiniteData<Route[]>>(
        [CACHE_KEY_ROUTES],
        (oldData) => ({
          pages:
            oldData?.pages?.map((page) =>
              page.map((route) => {
                // Find matching temp route
                if (route.routeId === savedRoute.routeId) {
                  return {
                    ...savedRoute,
                    intermediateStops: savedRoute.intermediateStops.map(
                      (serverStop, index) => ({
                        ...serverStop,
                        // Preserve temp ID if server ID missing (fallback)
                        stopId:
                          serverStop.stopId ||
                          route.intermediateStops[index]?.stopId,
                      }),
                    ),
                  };
                }
                return route;
              }),
            ) || [],
          pageParams: oldData?.pageParams || [],
        }),
      );
      queryClient.invalidateQueries({
        queryKey: [CACHE_KEY_ROUTES],
        refetchType: "active",
      });
      showToast("Successfully added a new route!", "success");
      navigate(`/trips`);
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<Route[]>(
        CACHE_KEY_ROUTES,
        context.previousRoutes,
      );
      showToast(error.message, "error");
    },
  });
};

export default useAddRoute;

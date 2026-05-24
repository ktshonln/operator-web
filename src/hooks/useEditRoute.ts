import { useMutation, useQueryClient } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_ROUTES } from "../utils/constants";
import { Route } from "./useRoutes";
import { RouteDetails } from "./useAddRoute";

interface EditRouteContext {
  previousRoutes: Route[];
}

const apiClient = new APIClient<Route>("/organizations");
const useEditRoute = (orgId: string, routeId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Route, Error, RouteDetails, EditRouteContext>({
    mutationFn: (routeDetails: RouteDetails) =>
      apiClient.editRoute<RouteDetails>(routeDetails, orgId, routeId),
    onMutate: (newData) => {
      const previousRoutes =
        queryClient.getQueryData<Route[]>(CACHE_KEY_ROUTES) || [];
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) =>
        (routes?.map((route) =>
          route.routeId === routeId
            ? ({
                ...route,
                price: newData.price,
                intermediateStops: [...(route.intermediateStops ?? [])],
                route: {
                  ...(route.route ?? {}),
                  start: newData.route.start,
                  end: newData.route.end,
                },
              } as Route)
            : route,
        )) as Route[] | undefined,
      );
      return { previousRoutes };
    },
    onSuccess: (savedData) => {
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) =>
        routes?.map((route) =>
          route.routeId === routeId ? savedData : route,
        ),
      );
      queryClient.invalidateQueries({
        queryKey: ["organization", orgId, "route", routeId],
      });
      queryClient.invalidateQueries({
        queryKey: [CACHE_KEY_ROUTES],
        refetchType: "active",
      });
      showToast("Route successfully updated!", "success");
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

export default useEditRoute;

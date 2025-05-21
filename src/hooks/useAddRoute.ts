import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const apiClient = new APIClient<Route>("/companies");
const useAddRoute = (companyId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<Route, Error, RouteDetails, EditRouteContext>({
    mutationFn: (routeDetails: RouteDetails) =>
      apiClient.addRoute<RouteDetails>(routeDetails, companyId),
    onMutate: (newData) => {
      // Optimistic updates
      const previousRoutes =
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

      /* 
      [
        {
          ...newData,
          routeId: "",
          intermediateStops: [newData?.intermediateStops], // !! aren't we neglecting newData intermediate stops?
          route: { ...newData.route, start: "", startId: "", endId: "" },
        },
        ...(routes || []),
      ]
      */
      );
      return { previousRoutes };
    },
    onSuccess: (savedData, newData) => {
      queryClient.setQueryData<Route[]>(CACHE_KEY_ROUTES, (routes) =>
        routes?.map((route) => (route === newData ? savedData : route))
      );
      showToast("Successfully added a new route!", "success");
      navigate(`/trips`);
    },
    onError: (error, newData, context) => {
      if (!context) return;
      queryClient.setQueryData<Route[]>(
        CACHE_KEY_ROUTES,
        context.previousRoutes
      );
      showToast(error.message, "error");
    },
  });
};

export default useAddRoute;

import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { CACHE_KEY_ROUTES } from "../utils/constants";

export interface RouteQuery {
  searchText: string;
  branch?: string;
}

export interface IntermediateStop {
  stopId: string;
  name: string;
  price: number;
}

export interface Route {
  routeId: string;
  route: { startId: string; start: string; endId: string; end: string }; // origin stop id and destination id included
  price: number;
  intermediateStops: IntermediateStop[];
}

const apiClient = new APIClient<Route[]>("/organizations");

const useRoutes = (orgId: string, routeQuery: RouteQuery) =>
  useInfiniteQuery<Route[], Error, InfiniteData<Route[], number>>({
    queryKey: [CACHE_KEY_ROUTES, routeQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllRoutes(orgId, {
        params: {
          branch: routeQuery.branch,
          search: routeQuery.searchText,
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
    enabled: !!orgId,
  });

export default useRoutes;

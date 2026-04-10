import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AnalyticsQuery } from "./useAnalytics";

const apiClient = new APIClient<PopularRoute[]>("/organizations");

interface PopularRoute {
  routeId: string;
  routeName: string;
  ticketsSold: number;
  rank: number;
}

const usePopularRoutes = (orgId: string, analyticsQuery: AnalyticsQuery) =>
  useQuery<PopularRoute[], Error>({
    queryKey: ["popularRoutes", analyticsQuery],
    queryFn: () =>
      apiClient.getPopularRoutes(orgId, {
        params: {
          branchId: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
    enabled: !!orgId,
  });

export default usePopularRoutes;

import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AnalyticsQuery } from "./useAnalytics";

const apiClient = new APIClient<PopularRoute[]>("/companies");

interface PopularRoute {
  routeId: string;
  routeName: string;
  ticketsSold: number;
  rank: number;
}

const usePopularRoutes = (companyId: string, analyticsQuery: AnalyticsQuery) =>
  useQuery<PopularRoute[], Error>({
    queryKey: ["popularRoutes", analyticsQuery],
    queryFn: () =>
      apiClient.getPopularRoutes(companyId, {
        params: {
          branchId: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
  });

export default usePopularRoutes;

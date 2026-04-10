import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AnalyticsQuery } from "./useAnalytics";

const apiClient = new APIClient<RevenueAnalytics[]>("/organizations");

export interface RevenueAnalytics {
  routeId: string;
  routeName: string;
  revenue: string;
}

const useRevenueAnalytics = (orgId: string, analyticsQuery: AnalyticsQuery) =>
  useQuery<RevenueAnalytics[], Error>({
    queryKey: ["revenueAnalytics", analyticsQuery],
    queryFn: () =>
      apiClient.getRevenueAnalytics(orgId, {
        params: {
          branchId: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
    enabled: !!orgId && !!analyticsQuery.startDate && !!analyticsQuery.endDate,
  });

export default useRevenueAnalytics;

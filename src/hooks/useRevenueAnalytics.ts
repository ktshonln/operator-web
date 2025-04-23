import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AnalyticsQuery } from "./useAnalytics";

const apiClient = new APIClient<RevenueAnalytics[]>("/companies");

interface RevenueAnalytics {
  routeId: string;
  routeName: string;
  revenue: string;
}

const useRevenueAnalytics = (
  companyId: string,
  analyticsQuery: AnalyticsQuery
) =>
  useQuery<RevenueAnalytics[], Error>({
    queryKey: ["revenueAnalytics", analyticsQuery],
    queryFn: () =>
      apiClient.getRevenueAnalytics(companyId, {
        params: {
          branchId: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
  });

export default useRevenueAnalytics;

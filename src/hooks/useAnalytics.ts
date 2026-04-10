import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

const apiClient = new APIClient<GeneralAnalytics>("/organizations");

export interface AnalyticsQuery {
  branch?: string;
  startDate: string;
  endDate: string;
}

interface GeneralAnalytics {
  companyId: string;
  timeRange: { start: string; end: string };
  totalTripsRun: number;
  totalTicketsSold: number;
  totalRevenue: { amount: number; currency: string };
  averageOccupacy: number;
}

const useAnalytics = (orgId: string, analyticsQuery: AnalyticsQuery) =>
  useQuery<GeneralAnalytics, Error>({
    queryKey: ["analytics", analyticsQuery],
    queryFn: () =>
      apiClient.getAnalytics(orgId, {
        params: {
          branch: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
    enabled: !!orgId && !!analyticsQuery.startDate && !!analyticsQuery.endDate,
  });

export default useAnalytics;

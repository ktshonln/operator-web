import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

const apiClient = new APIClient<GeneralAnalytics>("/companies");

export interface AnalyticsQuery {
  branch?: string ;
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

const useAnalytics = (companyId: string, analyticsQuery: AnalyticsQuery) =>
  useQuery<GeneralAnalytics, Error>({
    queryKey: ["analytics", analyticsQuery],
    queryFn: () =>
      apiClient.getAnalytics(companyId, {
        params: {
          branch: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
  });

export default useAnalytics;

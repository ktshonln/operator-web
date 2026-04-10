import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { AnalyticsQuery } from "./useAnalytics";

const apiClient = new APIClient<PeakTimes>("/organizations");

export interface PeakTimes {
  peakHours: [
    { hour: number; averageTickets: number },
    { hour: number; averageTickets: number },
  ];
  peakDaysOfWeek: [
    { day: number; dayName: string; averageTickets: number },
    { day: number; dayName: string; averageTickets: number },
  ];
}

const usePeakTimes = (orgId: string, analyticsQuery: AnalyticsQuery) =>
  useQuery<PeakTimes, Error>({
    queryKey: ["peakTimes", analyticsQuery],
    queryFn: () =>
      apiClient.getPeakTimes(orgId, {
        params: {
          branchId: analyticsQuery.branch,
          startDate: analyticsQuery.startDate,
          endDate: analyticsQuery.endDate,
        },
      }),
    enabled: !!orgId && !!analyticsQuery.startDate && !!analyticsQuery.endDate,
  });

export default usePeakTimes;

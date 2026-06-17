import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import type { PeakTimes } from "./usePeakTimes";

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface AnalyticsOverviewParams {
  period?: "today" | "yesterday" | "this_week" | "this_month" | "custom";
  from?: string;
  to?: string;
  tz?: string;
  peak?: "hour" | "day";
  compare?: boolean;
}

export interface AnalyticsOverview {
  period: {
    label: string;
    from: string;
    to: string;
    tz: string;
  };
  scope: { org_id: string | null };
  summary: {
    sold_tickets: { value: number; delta_pct: number };
    revenue: { value: number; currency: string; delta_pct: number };
    capacity: { total_seats: number; available: number; delta_pct: number };
  };
  revenue_by_route: Array<{
    route_id: string;
    name: string;
    amount: number;
    pct: number;
  }>;
  revenue_total: number;
  top_destinations: Array<{
    route_id: string;
    name: string;
    tickets: number;
  }>;
  peak_times: {
    granularity: "hour" | "day";
    buckets: Array<{ bucket: number; count: number }>;
  };
}

// ─── Mapped shapes (legacy-compatible) ───────────────────────────────────────

/** Shape that DonutChart / TableOne expect */
export interface MappedRevenueByRoute {
  routeId: string;
  routeName: string;
  revenue: string;
}

/** Shape that the top-destinations sidebar expects */
export interface MappedTopDestination {
  routeName: string;
  rank: number;
}

/** Shape that PeakTrafficChart expects (compatible with usePeakTimes.PeakTimes) */
export type MappedPeakTimes = PeakTimes;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAnalyticsOverview = (
  params: AnalyticsOverviewParams,
  enabled = true,
) => {
  const query = useQuery<AnalyticsOverview, Error>({
    queryKey: ["analytics-overview", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AnalyticsOverview>(
        "/analytics/overview",
        {
          params: {
            period: params.period ?? "today",
            ...(params.from ? { from: params.from } : {}),
            ...(params.to ? { to: params.to } : {}),
            tz: params.tz ?? "Africa/Kigali",
            peak: params.peak ?? "hour",
            compare: params.compare ?? true,
          },
        },
      );
      return data;
    },
    enabled,
  });

  const overview = query.data;

  // ── Map revenue_by_route → RevenueAnalytics shape ──────────────────────────
  const revAnalytics: MappedRevenueByRoute[] = (
    overview?.revenue_by_route ?? []
  ).map((r) => ({
    routeId: r.route_id,
    routeName: r.name,
    revenue: String(r.amount),
  }));

  // ── Map top_destinations → popular routes shape ─────────────────────────────
  const popularRoutes: MappedTopDestination[] = (
    overview?.top_destinations ?? []
  ).map((d, i) => ({
    routeName: d.name,
    rank: i + 1,
  }));

  // ── Map peak_times → PeakTimes shape ────────────────────────────────────────
  const peakTimes: MappedPeakTimes = (() => {
    const granularity = overview?.peak_times?.granularity ?? "hour";
    const buckets = overview?.peak_times?.buckets ?? [];

    if (granularity === "hour") {
      return {
        peakHours: buckets.map((b) => ({
          hour: b.bucket,
          averageTickets: b.count,
        })),
        peakDaysOfWeek: [],
      } as unknown as PeakTimes;
    } else {
      return {
        peakHours: [],
        peakDaysOfWeek: buckets.map((b) => ({
          day: b.bucket,
          dayName: DAY_NAMES[b.bucket] ?? String(b.bucket),
          averageTickets: b.count,
        })),
      } as unknown as PeakTimes;
    }
  })();

  return {
    ...query,
    overview,
    revAnalytics,
    popularRoutes,
    peakTimes,
  };
};

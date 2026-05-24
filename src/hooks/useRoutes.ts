import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

export interface FleetRoute {
  id: string;
  name: string;
  org_id?: string;
  is_active?: boolean;
  color?: string;
  route_stops?: Array<{
    order: number;
    stop: { id: string; name: string; lat?: number; lng?: number; city?: string };
  }>;
  // Legacy fields (old API shape — kept for backward compat with legacy hooks)
  routeId?: string;
  route?: {
    startId: string;
    start: string;
    endId: string;
    end: string;
  };
  price?: number;
  intermediateStops?: Array<{
    stopId: string;
    name: string;
    price: number;
  }>;
}

// Keep backward compat alias
export type Route = FleetRoute;

export const useRoutes = (q?: string, _query?: RouteQuery) => {
  return useQuery({
    queryKey: ["routes", q],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/routes", {
        params: q ? { q } : {},
      });
      if (Array.isArray(data)) return data as Route[];
      return (data as any).data ?? (data as any).routes ?? [];
    },
  });
};

// Legacy compat — old components import useRoutes as default with RouteQuery
export interface RouteQuery {
  branch?: any;
  sortOrder?: string;
  searchText?: string;
}

export default useRoutes;

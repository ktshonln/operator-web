import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "../stores/toastStore";
import { axiosInstance } from "../services/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouteStop {
  id: string;
  location_id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface RouteListItem {
  id: string;
  name: string;
  status: "active" | "inactive";
  stops_count: number;
  origin: { id: string; name: string };
  destination: { id: string; name: string };
  created_at: string;
}

export interface RouteDetail {
  id: string;
  name: string;
  status: "active" | "inactive";
  org: { id: string; name: string };
  prices_complete: boolean;
  stops: RouteStop[];
  created_at: string;
  updated_at: string;
}

export interface RoutesListResponse {
  data: RouteListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRoutePayload {
  name?: string;
  stops: { location_id: string; order: number }[];
  org_id?: string;
}

export interface UpdateRoutePayload {
  name?: string;
  status?: "active" | "inactive";
  stops?: { location_id: string; order: number }[];
}

// ─── Query key ────────────────────────────────────────────────────────────────

const ROUTES_KEY = "routesV2";

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useRoutesList = (params?: {
  q?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [ROUTES_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<RoutesListResponse>("/routes", { params });
      return data;
    },
  });
};

export const useRouteById = (id: string) => {
  return useQuery({
    queryKey: [ROUTES_KEY, id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<RouteDetail>(`/routes/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoutePayload) => {
      const { data } = await axiosInstance.post<RouteDetail>("/routes", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROUTES_KEY] });
    },
    // 409 ROUTE_ALREADY_EXISTS and 422 INSUFFICIENT_STOPS propagate to caller
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoutePayload }) => {
      const { data: updated } = await axiosInstance.patch<RouteDetail>(`/routes/${id}`, data);
      return updated;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ROUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [ROUTES_KEY, id] });
    },
    // 400 PRICES_INCOMPLETE, 409 ROUTE_ALREADY_EXISTS propagate to caller
  });
};

export const useDeleteRoute = () => {
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROUTES_KEY] });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === "ROUTE_IN_USE") {
        const msg =
          error?.response?.data?.error?.message ||
          "This route is used by one or more trips and cannot be deleted.";
        showToast(msg, "error");
      }
    },
  });
};

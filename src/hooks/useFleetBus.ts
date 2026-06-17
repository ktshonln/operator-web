import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

// ─── Types (feature description shape) ───────────────────────────────────────

export interface BusDriver {
  id: string;
  first_name: string;
  last_name: string;
  avatar_path: string | null;
}

export interface BusRoute {
  id: string;
  name: string;
}

export interface BusOrg {
  id: string;
  name: string;
}

export interface FleetBus {
  id: string;
  plate: string;
  type: string;
  capacity: number;       // feature description uses "capacity"
  status: "active" | "inactive";
  driver: BusDriver | null;
  routes: BusRoute[];
  org: BusOrg | null;
  org_id?: string;
  device_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusTrip {
  id: string;
  departure_at: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  route: { id: string; name: string };
  booked_seats: number;
  total_seats: number;
  remaining_seats: number;
}

export interface BusTripsResponse {
  data: BusTrip[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBusPayload {
  plate: string;
  type: string;
  capacity: number;
  driver_id?: string;
  route_ids?: string[];
  org_id?: string;
}

export interface UpdateBusPayload {
  plate?: string;
  type?: string;
  capacity?: number;
  status?: "active" | "inactive";
  driver_id?: string | null;
  route_ids?: string[];
  device_id?: string | null;
}

export interface BusListParams {
  q?: string;
  status?: "active" | "inactive";
  org_id?: string;
  driver_id?: string;
  page?: number;
  limit?: number;
}

export interface BusListResponse {
  data: FleetBus[];
  total: number;
  page: number;
  limit: number;
}

// ─── GET /buses (paginated with filters) ─────────────────────────────────────

export const useFleetBusesPaginated = (params: BusListParams) => {
  return useQuery({
    queryKey: ["fleet-buses", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<BusListResponse | { buses: FleetBus[] } | FleetBus[]>(
        "/buses",
        { params }
      );
      // Normalise: feature description returns { data, total, page, limit }
      if (Array.isArray(data)) {
        return { data, total: data.length, page: 1, limit: data.length } as BusListResponse;
      }
      if ((data as any).data) return data as BusListResponse;
      const buses = (data as any).buses ?? [];
      return { data: buses, total: buses.length, page: 1, limit: buses.length } as BusListResponse;
    },
  });
};

// ─── GET /buses (simple, no filters — kept for BusDetails driver search) ─────

export const useFleetBuses = () => {
  return useQuery({
    queryKey: ["fleet-buses"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ buses: FleetBus[] } | FleetBus[]>("/buses");
      if (Array.isArray(data)) return data;
      return (data as any).buses ?? [];
    },
  });
};

// ─── GET /buses/:id ───────────────────────────────────────────────────────────

export const useFleetBusById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["fleet-bus", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ bus: FleetBus } | FleetBus>(`/buses/${id}`);
      // Handle both wrapped { bus: ... } and direct response
      if ((data as any).bus) return (data as any).bus as FleetBus;
      return data as FleetBus;
    },
    enabled: !!id,
  });
};

// ─── GET /buses/:id/trips ─────────────────────────────────────────────────────

export const useBusTrips = (busId: string | undefined, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["bus-trips", busId, page, limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get<BusTripsResponse>(
        `/buses/${busId}/trips`,
        { params: { page, limit } }
      );
      return data;
    },
    enabled: !!busId,
  });
};

// ─── POST /buses ──────────────────────────────────────────────────────────────

export const useCreateFleetBus = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (payload: CreateBusPayload) => {
      const { data } = await axiosInstance.post<{ bus: FleetBus } | FleetBus>("/buses", payload);
      if ((data as any).bus) return (data as any).bus as FleetBus;
      return data as FleetBus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-buses"] });
      showToast("Bus registered successfully", "success");
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "PLATE_ALREADY_EXISTS") {
        showToast("A bus with this plate already exists", "error");
      } else {
        showToast(err?.response?.data?.error?.message || "Failed to register bus", "error");
      }
    },
  });
};

// ─── PATCH /buses/:id ─────────────────────────────────────────────────────────

export const useUpdateFleetBus = (id: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (payload: UpdateBusPayload) => {
      const { data } = await axiosInstance.patch<{ bus: FleetBus } | FleetBus>(`/buses/${id}`, payload);
      if ((data as any).bus) return (data as any).bus as FleetBus;
      return data as FleetBus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-bus", id] });
      queryClient.invalidateQueries({ queryKey: ["fleet-buses"] });
      showToast("Bus updated successfully", "success");
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "DRIVER_NOT_FOUND") {
        showToast("Selected driver was not found", "error");
      } else if (code === "ROUTE_NOT_FOUND") {
        showToast("Selected route was not found", "error");
      } else {
        // PLATE_ALREADY_EXISTS is handled inline by the caller
        throw err;
      }
    },
  });
};

// ─── DELETE /buses/:id ────────────────────────────────────────────────────────

export const useDeleteFleetBus = (id: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/buses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-buses"] });
      showToast("Bus deleted successfully", "success");
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "BUS_IN_USE") {
        showToast("This bus is assigned to one or more upcoming trips and cannot be deleted", "error");
      } else {
        showToast(err?.response?.data?.error?.message || "Failed to delete bus", "error");
      }
    },
  });
};

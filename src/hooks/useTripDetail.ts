import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripStop {
  id: string;
  name: string;
}

export interface TripRouteStop {
  order: number;
  stop: TripStop;
}

export interface TripDetailRoute {
  id: string;
  name: string;
  route_stops?: TripRouteStop[];
}

// Stop as returned directly on the trip (real backend shape)
export interface TripDetailStop {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  order: number;
}

export interface TripDetailBus {
  id: string;
  plate: string;
  type: string;
}

export interface TripDetailDriver {
  id: string;
  first_name: string;
  last_name: string;
  avatar_path: string | null;
}

export interface TripDetailSeries {
  id: string;
  frequency_minutes: number | null;
  repeat_daily: boolean;
  starts_on: string;
  ends_on: string | null;
  is_only_in_series: boolean;
}

export interface TripDetail {
  id: string;
  departure_at: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  is_express: boolean;
  total_seats: number;
  booked_seats: number;
  remaining_seats: number;
  route: TripDetailRoute;
  bus: TripDetailBus | null;
  driver: TripDetailDriver | null;
  series: TripDetailSeries | null;
  // Real backend returns stops as a flat top-level array
  stops?: TripDetailStop[];
  created_at: string;
  updated_at: string;
}

export interface TripTicket {
  id: string;
  passenger_name: string;
  phone: string;
  boarding_stop: TripStop;
  alighting_stop: TripStop;
  seats_count: number;
  amount: number;
  currency: string;
  payment_method: "mtn" | "airtel" | "wallet" | "cash";
  status: "confirmed" | "cancelled" | "pending";
  created_by: "passenger" | "staff";
  booked_at: string;
}

export interface TripTicketsResponse {
  data: TripTicket[];
  total: number;
  page: number;
  limit: number;
}

export interface TripTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface TripPrice {
  boarding_stop_id: string;
  alighting_stop_id: string;
  amount: number;
  currency: string;
}

export interface CreateCashTicketPayload {
  trip_id: string;
  boarding_stop_id: string;
  alighting_stop_id: string;
  seats_count: number;
  payment_method: "cash";
  phone: string;
  passenger_name: string;
}

export interface CreateCashTicketResponse {
  id: string;
  status: "confirmed";
  passenger_name: string;
  phone: string;
  seats_count: number;
  amount: number;
  currency: string;
  payment_method: "cash";
  boarding_stop: TripStop;
  alighting_stop: TripStop;
}

// ─── useTripDetail ────────────────────────────────────────────────────────────

export const useTripDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["trip-detail", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TripDetail>(`/trips/${id}`);
      // Normalize: some backends wrap the trip in { trip: ... }
      const trip = (data as any).trip ?? data;
      return trip as TripDetail;
    },
    enabled: !!id,
  });
};

// ─── useTripTickets ───────────────────────────────────────────────────────────

export const useTripTickets = (id: string | undefined, params: TripTicketsParams) => {
  return useQuery({
    queryKey: ["trip-tickets", id, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TripTicketsResponse>(
        `/trips/${id}/tickets`,
        { params }
      );
      return data;
    },
    enabled: !!id,
  });
};

// ─── useTripPrice ─────────────────────────────────────────────────────────────

export const useTripPrice = (
  boardingStopId: string | undefined,
  alightingStopId: string | undefined
) => {
  return useQuery({
    queryKey: ["trip-price", boardingStopId, alightingStopId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TripPrice>("/prices", {
        params: {
          boarding_stop_id: boardingStopId,
          alighting_stop_id: alightingStopId,
        },
      });
      return data;
    },
    enabled: !!boardingStopId && !!alightingStopId,
    retry: false,
  });
};

// ─── useCreateCashTicket ──────────────────────────────────────────────────────

export const useCreateCashTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCashTicketPayload) => {
      const { data } = await axiosInstance.post<CreateCashTicketResponse>(
        "/tickets",
        payload
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["trip-tickets", vars.trip_id] });
      queryClient.invalidateQueries({ queryKey: ["trip-detail", vars.trip_id] });
    },
  });
};

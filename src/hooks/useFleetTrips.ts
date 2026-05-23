import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import type {
  Trip,
  TripsResponse,
  CreateTripPayload,
  UpdateTripPayload,
  DeleteTripPayload,
  UpdateTripResponse,
  DeleteTripResponse,
} from "../types/trips";

// ─── GET /trips ───────────────────────────────────────────────────────────────

export interface TripsQueryParams {
  route_id?: string;
  from?: string;
  to?: string;
  unassigned_only?: boolean;
  page?: number;
  limit?: number;
}

export const useFleetTrips = (params: TripsQueryParams, enabled = true) => {
  return useQuery({
    queryKey: ["fleet-trips", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TripsResponse>("/trips", { params });
      return data;
    },
    enabled: enabled && !!params.route_id,
  });
};

// ─── POST /trips ──────────────────────────────────────────────────────────────

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (payload: CreateTripPayload) => {
      const { data } = await axiosInstance.post<{ trips: Trip[]; series_id?: string; trips_created?: number }>(
        "/trips",
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-trips"] });
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      const msg = err?.response?.data?.error?.message;
      if (code === "ROUTE_NOT_FOUND") showToast("Route not found", "error");
      else if (code === "BUS_NOT_FOUND") showToast("Selected bus was not found", "error");
      else if (code === "DRIVER_NOT_FOUND") showToast("Selected driver was not found", "error");
      else if (code !== "TOTAL_SEATS_REQUIRED" && code !== "INVALID_DATE_RANGE") {
        showToast(msg || "Failed to create trip", "error");
      }
    },
  });
};

// ─── PATCH /trips/:id ─────────────────────────────────────────────────────────

export const useUpdateTrip = (id: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (payload: UpdateTripPayload) => {
      const { data } = await axiosInstance.patch<UpdateTripResponse>(`/trips/${id}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["fleet-trips"] });
      if (vars.scope === "future" && data.skipped?.length) {
        const updated = typeof (data as any).updated === 'number' ? (data as any).updated : ((data as any).updated?.length ?? 0);
        const skipped = data.skipped.length;
        showToast(
          `${updated} trip${updated !== 1 ? "s" : ""} updated. ${skipped} trip${skipped !== 1 ? "s" : ""} could not be updated because they have bookings`,
          "success"
        );
      } else {
        showToast("Trip updated", "success");
      }
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "HAS_BOOKINGS") {
        showToast("This trip cannot be changed because passengers have already booked it", "error");
      } else {
        showToast(err?.response?.data?.error?.message || "Failed to update trip", "error");
      }
    },
  });
};

// ─── DELETE /trips/:id ────────────────────────────────────────────────────────

export const useCancelTrip = (id: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (payload: DeleteTripPayload) => {
      const { data } = await axiosInstance.delete<DeleteTripResponse | null>(`/trips/${id}`, {
        data: payload,
      });
      return data;
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["fleet-trips"] });
      if (vars.scope === "future" && data?.skipped?.length) {
        const deleted = data.deleted ?? 0;
        const skipped = data.skipped.length;
        showToast(
          `${deleted} trip${deleted !== 1 ? "s" : ""} deleted. ${skipped} trip${skipped !== 1 ? "s" : ""} could not be deleted because they have bookings`,
          "success"
        );
      } else {
        showToast("Trip cancelled", "success");
      }
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "HAS_BOOKINGS") {
        showToast("This trip cannot be deleted because passengers have already booked it", "error");
      } else {
        showToast(err?.response?.data?.error?.message || "Failed to cancel trip", "error");
      }
    },
  });
};

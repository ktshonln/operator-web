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

// ─── Error code → human-readable message ─────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  ORG_REQUIRED: "You must belong to an organisation to perform this action",
  UNAUTHORIZED: "You are not authorised to perform this action",
  FORBIDDEN: "You do not have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  ROUTE_NOT_FOUND: "Route not found",
  BUS_NOT_FOUND: "The selected bus was not found",
  DRIVER_NOT_FOUND: "The selected driver was not found",
  HAS_BOOKINGS: "This trip already has passenger bookings",
  TRIP_NOT_FOUND: "Trip not found",
  INTERNAL_SERVER_ERROR: "Something went wrong on the server. Please try again",
};

/**
 * Returns a human-readable error message.
 * Prefers the mapped message for known codes, falls back to the server's
 * message if it looks like a sentence (not a SCREAMING_SNAKE_CASE code),
 * and finally falls back to the provided default.
 */
function friendlyError(
  code: string | undefined,
  serverMsg: string | undefined,
  fallback: string
): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  // If the server message is a sentence (contains a space or lowercase), use it
  if (serverMsg && /[a-z\s]/.test(serverMsg)) return serverMsg;
  return fallback;
}

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
      // TOTAL_SEATS_REQUIRED and INVALID_DATE_RANGE are handled inline
      if (code === "TOTAL_SEATS_REQUIRED" || code === "INVALID_DATE_RANGE") return;
      showToast(friendlyError(code, msg, "Failed to create trip"), "error");
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
      queryClient.invalidateQueries({ queryKey: ["trip-detail", id] });
      if (vars.scope === "future" && data.skipped?.length) {
        const updated = typeof (data as any).updated === "number"
          ? (data as any).updated
          : ((data as any).updated?.length ?? 0);
        const skipped = data.skipped.length;
        showToast(
          `${updated} trip${updated !== 1 ? "s" : ""} updated. ${skipped} trip${skipped !== 1 ? "s" : ""} could not be updated because they have bookings`,
          "success"
        );
      } else {
        showToast("Trip updated successfully", "success");
      }
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      const msg = err?.response?.data?.error?.message;
      showToast(
        friendlyError(code, msg, "Failed to update trip"),
        "error"
      );
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
      queryClient.invalidateQueries({ queryKey: ["trip-detail", id] });
      if (vars.scope === "future" && data?.skipped?.length) {
        const deleted = data.deleted ?? 0;
        const skipped = data.skipped.length;
        showToast(
          `${deleted} trip${deleted !== 1 ? "s" : ""} deleted. ${skipped} trip${skipped !== 1 ? "s" : ""} could not be deleted because they have bookings`,
          "success"
        );
      } else {
        showToast("Trip deleted successfully", "success");
      }
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      const msg = err?.response?.data?.error?.message;
      showToast(
        friendlyError(code, msg, "Failed to delete trip"),
        "error"
      );
    },
  });
};
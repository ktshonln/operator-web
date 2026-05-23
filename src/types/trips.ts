// ─── Trip Service Types ───────────────────────────────────────────────────────

export interface TripRoute {
  id: string;
  name: string;
  color?: string;
  is_active?: boolean;
  route_stops?: Array<{
    order: number;
    stop: { id: string; name: string; lat?: number; lng?: number; city?: string };
  }>;
}

export interface TripBus {
  id: string;
  plate: string;
  type: string;
  capacity?: number;
  total_seats?: number;
}

export interface TripDriver {
  id: string;
  first_name: string;
  last_name: string;
  avatar_path?: string | null;
}

export interface TripSeries {
  id: string;
  frequency_minutes: number | null;
  repeat_daily: boolean;
  starts_on: string;
  ends_on: string | null;
  is_only_in_series: boolean;
}

export type TripStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface Trip {
  id: string;
  series_id?: string | null;
  route_id: string;
  org_id?: string;
  bus_id?: string | null;
  driver_id?: string | null;
  departure_at: string;
  total_seats: number;
  booked_seats: number;
  remaining_seats: number;
  status: TripStatus;
  is_express: boolean;
  cancellation_allowed?: boolean;
  series?: TripSeries | null;
  bus?: TripBus | null;
  driver?: TripDriver | null;
  route?: TripRoute | null;
  // react-big-calendar fields
  title?: string;
  start?: Date;
  end?: Date;
}

export interface TripsResponse {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTripPayload {
  route_id: string;
  bus_id?: string | null;
  driver_id?: string | null;
  total_seats?: number;
  is_express?: boolean;
  departure_time: string; // HH:MM
  starts_on: string;      // YYYY-MM-DD
  ends_on?: string | null;
  repeat_daily?: boolean;
  frequency_minutes?: number | null;
}

export interface UpdateTripPayload {
  scope: "this" | "future";
  departure_time?: string; // HH:MM
  bus_id?: string | null;
  driver_id?: string | null;
  total_seats?: number;
  is_express?: boolean;
}

export interface DeleteTripPayload {
  scope: "this" | "future";
  reason?: string;
}

export interface TripSkipped {
  trip_id: string;
  departure_at: string;
  reason: string;
}

export interface UpdateTripResponse {
  // scope: "this" — returns single Trip directly (handled by casting)
  // scope: "future" — returns:
  updated?: number;   // count of updated trips
  skipped?: TripSkipped[];
}

export interface DeleteTripResponse {
  deleted?: number;
  skipped?: TripSkipped[];
}

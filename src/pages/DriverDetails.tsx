import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, buildCdnUrl } from "../services/apiClient";
import { format } from "date-fns";
import type { StaffDriver } from "./Drivers";

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useDriverById(id: string | undefined) {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/users/${id}`);
      return data as StaffDriver;
    },
    enabled: !!id,
  });
}

// ─── Trips hook — reuse new API ───────────────────────────────────────────────

function useDriverTrips(driverId: string | undefined, page: number) {
  return useQuery({
    queryKey: ["driver-trips", driverId, page],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/trips", {
        params: { driver_id: driverId, page, limit: 10 },
      });
      if (Array.isArray(data)) return { data, total: data.length };
      return data as { data: any[]; total: number };
    },
    enabled: !!driverId,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sectionClass =
  "bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-4";

function StatusBadge({ status }: { status: StaffDriver["status"] }) {
  const map: Record<StaffDriver["status"], string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending_verification: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const label: Record<StaffDriver["status"], string> = {
    active: "Active",
    pending_verification: "Pending Verification",
    suspended: "Suspended",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm py-2 border-b border-gray-50 dark:border-neutral-800/50 last:border-0">
      <span className="text-neutral-500 dark:text-neutral-400 shrink-0 w-40">{label}</span>
      <span className="text-neutral-900 dark:text-white text-right">{value ?? "—"}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DriverDetails() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();

  const { data: driver, isLoading, error } = useDriverById(driverId);
  const [tripsPage, setTripsPage] = useState(1);
  const { data: tripsData, isLoading: tripsLoading } = useDriverTrips(driverId, tripsPage);
  const trips = tripsData?.data ?? [];
  const tripsTotal = tripsData?.total ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-neutral-600 dark:text-neutral-400">Driver not found.</p>
        <button onClick={() => navigate("/fleets/drivers")} className="text-brand hover:underline text-sm">
          Back to Drivers
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 min-h-screen max-w-2xl mx-auto dark:text-white">

      {/* Back */}
      <button
        onClick={() => navigate("/fleets/drivers")}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Drivers
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {driver.avatar_path ? (
          <img
            src={buildCdnUrl(driver.avatar_path)}
            alt={driver.first_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xl">
            {driver.first_name[0]}{driver.last_name[0]}
          </div>
        )}
        <div>
          <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">
            {driver.first_name} {driver.last_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={driver.status} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Driver</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-3">Details</h2>
        <InfoRow label="Full Name" value={`${driver.first_name} ${driver.last_name}`} />
        <InfoRow label="Phone" value={driver.phone_number} />
        <InfoRow label="Email" value={driver.email} />
        <InfoRow label="Status" value={<StatusBadge status={driver.status} />} />
        <InfoRow label="Organization ID" value={driver.org_id} />
        {driver.last_login_at && (
          <InfoRow
            label="Last Login"
            value={format(new Date(driver.last_login_at), "MMM d, yyyy HH:mm")}
          />
        )}
        <InfoRow
          label="Joined"
          value={format(new Date(driver.created_at), "MMM d, yyyy")}
        />
      </div>

      {/* Assigned Trips */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">
          Assigned Trips
          {tripsTotal > 0 && (
            <span className="ml-2 text-xs font-normal text-neutral-500">({tripsTotal})</span>
          )}
        </h2>

        {tripsLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
            Loading trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No trips assigned to this driver
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {trips.map((trip: any) => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-neutral-800 hover:border-brand hover:bg-brand/5 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {trip.route?.name ?? trip.id}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {trip.departure_at
                      ? format(new Date(trip.departure_at), "MMM d, yyyy · HH:mm")
                      : "—"}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  trip.status === "scheduled"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : trip.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                }`}>
                  {trip.status}
                </span>
              </div>
            ))}

            {tripsTotal > 10 && (
              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() => setTripsPage((p) => Math.max(1, p - 1))}
                  disabled={tripsPage === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-neutral-500">Page {tripsPage}</span>
                <button
                  onClick={() => setTripsPage((p) => p + 1)}
                  disabled={trips.length < 10}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// useState import needed
import { useState } from "react";

export default DriverDetails;

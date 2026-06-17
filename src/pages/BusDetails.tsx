import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAbility } from "../contexts/AbilityContext";
import { useToastStore } from "../stores/toastStore";
import {
  useFleetBusById,
  useUpdateFleetBus,
  useDeleteFleetBus,
  useBusTrips,
  BusRoute,
} from "../hooks/useFleetBus";
import { buildCdnUrl } from "../services/apiClient";
import useUsers, { UserQuery } from "../hooks/useUsers";
import useUser from "../hooks/useUser";
import { axiosInstance } from "../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useBusLocationStream } from "../hooks/useBusLocationStream";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon broken by webpack/vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors disabled:bg-gray-50 dark:disabled:bg-neutral-800 disabled:text-neutral-500";
const labelClass =
  "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const sectionClass =
  "bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-4";

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return status === "active" ? (
    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Active
    </span>
  ) : (
    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      Inactive
    </span>
  );
}

function OccupancyBar({ booked, total }: { booked: number; total: number }) {
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
  const color =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
        ? "bg-orange-400"
        : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
        {booked}/{total}
      </span>
    </div>
  );
}

// ─── Routes hook ──────────────────────────────────────────────────────────────

function useRoutes(search: string) {
  return useQuery({
    queryKey: ["routes-list", search],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/routes", {
        params: search ? { search } : {},
      });
      if (Array.isArray(data)) return data as BusRoute[];
      return (data as any).data ?? (data as any).routes ?? [];
    },
  });
}

// ─── Map recenter helper ──────────────────────────────────────────────────────

function MapRecenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

// ─── Live Location section ────────────────────────────────────────────────────

function LiveLocationSection({
  busId,
  deviceId,
}: {
  busId: string;
  deviceId: string | null | undefined;
}) {
  const { position, status } = useBusLocationStream(busId, deviceId);

  const statusBadge =
    status === "live" ? (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Live
      </span>
    ) : status === "connecting" ? (
      <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        Connecting…
      </span>
    ) : status === "no_signal" ? (
      <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-neutral-400" />
        No signal
      </span>
    ) : null;

  return (
    <div className="bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white">
          Live Location
        </h2>
        {statusBadge}
      </div>

      {!deviceId ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
          No GPS tracker fitted to this bus.
        </p>
      ) : (
        <>
          {/* Map */}
          <div className="rounded-lg overflow-hidden" style={{ height: 300 }}>
            <MapContainer
              center={
                position ? [position.lat, position.lon] : [-1.9441, 30.0619]
              }
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {position && (
                <>
                  <MapRecenter lat={position.lat} lon={position.lon} />
                  <Marker position={[position.lat, position.lon]}>
                    <Popup>
                      <span className="text-xs">
                        Last update:{" "}
                        {new Date(position.ts).toLocaleTimeString()}
                      </span>
                    </Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          </div>

          {/* Last update */}
          {position && (
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Last update:{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {new Date(position.ts).toLocaleString()}
              </span>
            </p>
          )}

          {status === "no_signal" && !position && (
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 italic">
              Waiting for GPS signal…
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function BusDetails() {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const ability = useAbility();
  const showToast = useToastStore((s) => s.showToast);
  const { user } = useUser();
  const orgId = user && "org_id" in user ? (user as any).org_id ?? "" : "";

  const { data: bus, isLoading, error } = useFleetBusById(busId);
  const updateBus = useUpdateFleetBus(busId ?? "");
  const deleteBus = useDeleteFleetBus(busId ?? "");

  const canUpdate = ability.can("update", "Bus");
  const canDelete = ability.can("delete", "Bus");

  // ─── Edit state ─────────────────────────────────────────────────────────────
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState<number>(0);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [inlineError, setInlineError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ─── Driver assignment state ─────────────────────────────────────────────────
  const [showDriverSearch, setShowDriverSearch] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");

  // ─── Route assignment state ──────────────────────────────────────────────────
  const [showRouteSearch, setShowRouteSearch] = useState(false);
  const [routeSearch, setRouteSearch] = useState("");

  // ─── Trips pagination ────────────────────────────────────────────────────────
  const [tripsPage, setTripsPage] = useState(1);
  const { data: tripsData, isLoading: tripsLoading } = useBusTrips(busId, tripsPage);

  // ─── Driver search (staff with driver role) ──────────────────────────────────
  const driverQuery: UserQuery = useMemo(
    () => ({ branch: null, sortOrder: "", searchText: driverSearch, roleSlug: "driver" }),
    [driverSearch]
  );
  const { data: driversData } = useUsers(orgId, driverQuery);
  const drivers = useMemo(() => {
    const pages = (driversData as any)?.pages ?? [];
    return pages.flat();
  }, [driversData]);

  // ─── Route search ────────────────────────────────────────────────────────────
  const { data: availableRoutes = [] } = useRoutes(routeSearch);

  useEffect(() => {
    if (bus) {
      setPlate(bus.plate);
      setType(bus.type);
      setCapacity(bus.capacity);
      setStatus(bus.status);
    }
  }, [bus]);

  const hasChanges =
    bus &&
    (plate !== bus.plate ||
      type !== bus.type ||
      capacity !== bus.capacity ||
      status !== bus.status);

  const handleSave = () => {
    if (!busId || !bus) return;
    setInlineError("");

    const payload: any = {};
    if (plate !== bus.plate) payload.plate = plate;
    if (type !== bus.type) payload.type = type;
    if (capacity !== bus.capacity) payload.capacity = capacity;
    if (status !== bus.status) payload.status = status;

    updateBus.mutate(payload, {
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        if (code === "PLATE_ALREADY_EXISTS") {
          setInlineError("A bus with this plate already exists.");
        } else {
          showToast(err?.response?.data?.error?.message || "Failed to save", "error");
        }
      },
    });
  };

  const handleAssignDriver = (driverId: string) => {
    updateBus.mutate({ driver_id: driverId }, {
      onSuccess: () => setShowDriverSearch(false),
    });
  };

  const handleRemoveDriver = () => {
    updateBus.mutate({ driver_id: null });
  };

  const handleAddRoute = (route: BusRoute) => {
    if (!bus) return;
    const currentIds = bus.routes.map((r) => r.id);
    if (currentIds.includes(route.id)) return;
    updateBus.mutate({ route_ids: [...currentIds, route.id] }, {
      onSuccess: () => setShowRouteSearch(false),
    });
  };

  const handleRemoveRoute = (routeId: string) => {
    if (!bus) return;
    const newIds = bus.routes.map((r) => r.id).filter((id) => id !== routeId);
    updateBus.mutate({ route_ids: newIds });
  };

  const handleDelete = () => {
    deleteBus.mutate(undefined, {
      onSuccess: () => navigate("/fleets/buses"),
    });
  };

  // ─── Loading / error ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-neutral-600 dark:text-neutral-400">Bus not found.</p>
        <button onClick={() => navigate("/fleets/buses")} className="text-brand hover:underline text-sm">
          Back to Buses
        </button>
      </div>
    );
  }

  const trips = tripsData?.data ?? [];
  const tripsTotal = tripsData?.total ?? 0;
  const tripsTotalPages = Math.ceil(tripsTotal / 20);

  return (
    <div className="px-4 py-6 min-h-screen max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/fleets/buses")}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Buses
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">{bus.plate}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={bus.status} />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {bus.type} · {bus.capacity} seats
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {canUpdate && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || updateBus.isPending}
                className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                {updateBus.isPending ? "Saving..." : "Save Changes"}
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline error */}
      {inlineError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {inlineError}
        </div>
      )}

      {/* Bus Info */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Bus Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Plate Number</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              disabled={!canUpdate}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!canUpdate}
              placeholder="e.g. Coaster, Coach, Minibus"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Capacity (seats)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              disabled={!canUpdate}
              min={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            {canUpdate ? (
              <div className="flex gap-2 mt-1">
                {(["active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 text-sm rounded-lg border capitalize transition-colors ${
                      status === s
                        ? s === "active"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium"
                          : "border-neutral-500 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
                        : "border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-1"><StatusBadge status={bus.status} /></div>
            )}
          </div>
        </div>
      </div>

      {/* Live Location */}
      {busId && (
        <LiveLocationSection busId={busId} deviceId={(bus as any).device_id} />
      )}

      {/* Driver */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Driver</h2>
        {bus.driver ? (
          <div className="flex items-center justify-between">
            <Link
              to={`/team/user/${bus.driver.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {bus.driver.avatar_path ? (
                <img
                  src={buildCdnUrl(bus.driver.avatar_path)}
                  alt={bus.driver.first_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold text-sm">
                  {bus.driver.first_name[0]}{bus.driver.last_name[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {bus.driver.first_name} {bus.driver.last_name}
                </p>
                <p className="text-xs text-neutral-500">Driver</p>
              </div>
            </Link>
            {canUpdate && (
              <button
                onClick={handleRemoveDriver}
                disabled={updateBus.isPending}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                Remove Driver
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">No driver assigned</p>
            {canUpdate && (
              <button
                onClick={() => setShowDriverSearch(true)}
                className="text-sm text-brand hover:underline"
              >
                Assign Driver
              </button>
            )}
          </div>
        )}

        {/* Driver search dropdown */}
        {showDriverSearch && (
          <div className="mt-4 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-neutral-800">
              <input
                type="text"
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Search drivers..."
                autoFocus
                className={inputClass}
              />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {drivers.length === 0 ? (
                <p className="text-sm text-neutral-500 p-3">No drivers found</p>
              ) : (
                drivers.map((d: any) => (
                  <button
                    key={d.id}
                    onClick={() => handleAssignDriver(d.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
                      {d.first_name?.[0]}{d.last_name?.[0]}
                    </div>
                    <span className="text-sm text-neutral-900 dark:text-white">
                      {d.first_name} {d.last_name}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="p-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setShowDriverSearch(false)}
                className="w-full text-xs text-neutral-400 hover:text-neutral-600 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Routes */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base text-neutral-900 dark:text-white">Assigned Routes</h2>
          {canUpdate && (
            <button
              onClick={() => setShowRouteSearch(true)}
              className="text-sm text-brand hover:underline"
            >
              + Add Route
            </button>
          )}
        </div>

        {bus.routes.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">No routes assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bus.routes.map((route) => (
              <div
                key={route.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 text-brand rounded-full text-sm"
              >
                <span>{route.name}</span>
                {canUpdate && (
                  <button
                    onClick={() => handleRemoveRoute(route.id)}
                    className="hover:text-red-500 transition-colors"
                    title="Remove route"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Route search dropdown */}
        {showRouteSearch && (
          <div className="mt-4 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-neutral-800">
              <input
                type="text"
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                placeholder="Search routes..."
                autoFocus
                className={inputClass}
              />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {availableRoutes.length === 0 ? (
                <p className="text-sm text-neutral-500 p-3">No routes found</p>
              ) : (
                availableRoutes.map((route: BusRoute) => {
                  const alreadyAdded = bus.routes.some((r) => r.id === route.id);
                  return (
                    <button
                      key={route.id}
                      onClick={() => !alreadyAdded && handleAddRoute(route)}
                      disabled={alreadyAdded}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left disabled:opacity-50"
                    >
                      <span className="text-sm text-neutral-900 dark:text-white">{route.name}</span>
                      {alreadyAdded && (
                        <span className="text-xs text-neutral-400">Added</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setShowRouteSearch(false)}
                className="w-full text-xs text-neutral-400 hover:text-neutral-600 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Trips */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">
          Upcoming Trips
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
            <svg className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No upcoming trips scheduled for this bus</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="flex flex-col gap-2 p-4 rounded-lg border border-gray-100 dark:border-neutral-800 hover:border-brand hover:bg-brand/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {trip.route.name}
                    </p>
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
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(trip.departure_at).toLocaleString()}
                  </p>
                  <OccupancyBar booked={trip.booked_seats} total={trip.total_seats} />
                </div>
              ))}
            </div>

            {/* Trips pagination */}
            {tripsTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-500">
                  Page {tripsPage} of {tripsTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTripsPage((p) => Math.max(1, p - 1))}
                    disabled={tripsPage === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setTripsPage((p) => Math.min(tripsTotalPages, p + 1))}
                    disabled={tripsPage === tripsTotalPages}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md z-[60]">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">Delete Bus?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              This will permanently remove <span className="font-semibold">{bus.plate}</span> from your fleet. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBus.isPending}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteBus.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BusDetails;

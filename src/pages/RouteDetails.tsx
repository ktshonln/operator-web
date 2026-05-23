import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import {
  useRouteById,
  useUpdateRoute,
  useDeleteRoute,
  RouteStop,
} from "../hooks/useRoutesV2";
import { useLocationsList, Location } from "../hooks/useLocations";
import { useAbility } from "../contexts/AbilityContext";
import { useToastStore } from "../stores/toastStore";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ─── Leaflet default icon fix for Vite builds ─────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── Styling constants ────────────────────────────────────────────────────────
const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors disabled:bg-gray-50 dark:disabled:bg-neutral-800 disabled:text-neutral-500";
const labelClass =
  "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const sectionClass =
  "bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-4";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StopDraft {
  location_id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

// ─── Status badge helper ──────────────────────────────────────────────────────

function statusBadge(status: "active" | "inactive") {
  return status === "active"
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    : "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-500";
}

// ─── Map sub-components ───────────────────────────────────────────────────────

function MapBoundsUpdater({ stops }: { stops: StopDraft[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], map.getZoom());
      return;
    }
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [stops, map]);

  return null;
}

// ─── Location search hook (debounced) ─────────────────────────────────────────

function useLocationSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const result = useLocationsList(
    debouncedQuery.trim() ? { q: debouncedQuery.trim(), limit: 10 } : undefined
  );

  return {
    results: debouncedQuery.trim() ? (result.data?.data ?? []) : [],
    isLoading: result.isLoading,
  };
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md z-[60]">
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              confirmClass ?? "bg-brand text-white hover:brightness-95"
            }`}
          >
            {isPending ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const RouteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ability = useAbility();
  const showToast = useToastStore((s) => s.showToast);

  const { data: route, isLoading, error } = useRouteById(id!);
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();

  const canEdit = ability.can("update", "Route");
  const canDelete = ability.can("delete", "Route");
  const isPlatformAdmin = ability.can("manage", "all");

  // Edit state
  const [editFields, setEditFields] = useState<{
    name: string;
    stops: StopDraft[];
  }>({ name: "", stops: [] });
  const [inlineError, setInlineError] = useState("");

  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Location search state
  const [locationSearch, setLocationSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results: locationResults } = useLocationSearch(locationSearch);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Initialize editFields when route loads
  useEffect(() => {
    if (route) {
      setEditFields({
        name: route.name,
        stops: route.stops.map((s) => ({
          location_id: s.location_id,
          name: s.name,
          lat: s.lat,
          lng: s.lng,
          order: s.order,
        })),
      });
    }
  }, [route]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when there are results
  useEffect(() => {
    if (locationResults.length > 0 && locationSearch.trim()) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [locationResults, locationSearch]);

  // Compute hasChanges
  const hasChanges =
    !!route &&
    (editFields.name !== route.name ||
      JSON.stringify(
        editFields.stops.map((s) => ({ location_id: s.location_id, order: s.order }))
      ) !==
        JSON.stringify(
          route.stops.map((s) => ({ location_id: s.location_id, order: s.order }))
        ));

  // Map stops: use editFields when canEdit, otherwise use route stops
  const mapStops: StopDraft[] = canEdit
    ? editFields.stops
    : route
    ? route.stops.map((s) => ({
        location_id: s.location_id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        order: s.order,
      }))
    : [];

  // ─── Stop handlers ───────────────────────────────────────────────────────────

  const handleAddStop = (loc: Location) => {
    if (editFields.stops.some((s) => s.location_id === loc.id)) {
      setLocationSearch("");
      setShowDropdown(false);
      return;
    }
    setEditFields((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          location_id: loc.id,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          order: prev.stops.length,
        },
      ],
    }));
    setLocationSearch("");
    setShowDropdown(false);
  };

  const handleRemoveStop = (index: number) => {
    setEditFields((prev) => ({
      ...prev,
      stops: prev.stops
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i })),
    }));
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const reordered = [...editFields.stops];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setEditFields((prev) => ({
      ...prev,
      stops: reordered.map((s, i) => ({ ...s, order: i })),
    }));
    setDragIndex(null);
  };

  // ─── Save handler ─────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!id || !route) return;
    setInlineError("");

    const payload: Record<string, unknown> = {};
    if (editFields.name !== route.name) payload.name = editFields.name;
    if (
      JSON.stringify(
        editFields.stops.map((s) => ({ location_id: s.location_id, order: s.order }))
      ) !==
      JSON.stringify(
        route.stops.map((s) => ({ location_id: s.location_id, order: s.order }))
      )
    ) {
      payload.stops = editFields.stops.map((s) => ({
        location_id: s.location_id,
        order: s.order,
      }));
    }

    updateRoute.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          showToast("Route updated", "success");
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === "PRICES_INCOMPLETE") {
            showToast(
              "Cannot activate: complete all stop-pair prices first. Go to /prices.",
              "error"
            );
          } else if (code === "ROUTE_ALREADY_EXISTS") {
            setInlineError("A route with this name already exists.");
          }
        },
      }
    );
  };

  // ─── Delete handler ───────────────────────────────────────────────────────────

  const handleDelete = () => {
    if (!id) return;
    deleteRoute.mutate(id, {
      onSuccess: () => {
        navigate("/routes");
      },
      onError: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  // ─── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  // ─── Error / not-found state ──────────────────────────────────────────────────

  if (error || !route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-neutral-600 dark:text-neutral-400">Route not found.</p>
        <Link to="/routes" className="text-brand hover:underline text-sm">
          Back to Routes
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 min-h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/routes"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Routes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">
              {route.name}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(
                route.status
              )}`}
            >
              {route.status}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Save Changes button */}
            {canEdit && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || updateRoute.isPending}
                className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                {updateRoute.isPending ? "Saving..." : "Save Changes"}
              </button>
            )}

            {/* Delete button */}
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* prices_complete warning banner */}
      {!route.prices_complete && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Some stop-pair prices are missing. Define all prices before activating this route.
          </p>
          <Link
            to="/prices"
            className="shrink-0 text-sm font-medium text-amber-700 dark:text-amber-400 underline"
          >
            Go to Price Matrix
          </Link>
        </div>
      )}

      {/* Activate / Deactivate controls */}
      {canEdit && (
        <div className="mb-4 flex items-center gap-3">
          {route.status === "inactive" && (
            <button
              type="button"
              disabled={!route.prices_complete || updateRoute.isPending}
              title={
                !route.prices_complete
                  ? "Complete all stop-pair prices first"
                  : undefined
              }
              onClick={() =>
                updateRoute.mutate({ id: id!, data: { status: "active" } })
              }
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Activate
            </button>
          )}
          {route.status === "active" && (
            <button
              type="button"
              disabled={updateRoute.isPending}
              onClick={() =>
                updateRoute.mutate({ id: id!, data: { status: "inactive" } })
              }
              className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 disabled:opacity-50 transition-colors"
            >
              Deactivate
            </button>
          )}
        </div>
      )}

      {/* Map */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Route Map
        </h2>
        <div style={{ isolation: "isolate" }} className="rounded-lg overflow-hidden">
          <MapContainer
            center={
              mapStops.length > 0
                ? [mapStops[0].lat, mapStops[0].lng]
                : [-1.9441, 30.0619]
            }
            zoom={8}
            className="h-72 w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapBoundsUpdater stops={mapStops} />
            {mapStops.map((stop) => (
              <Marker key={stop.location_id} position={[stop.lat, stop.lng]} />
            ))}
            {mapStops.length >= 2 && (
              <Polyline
                positions={mapStops.map((s) => [s.lat, s.lng])}
                color="#3b82f6"
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Fields section */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Route Details
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Name</label>
            {canEdit ? (
              <input
                type="text"
                value={editFields.name}
                onChange={(e) =>
                  setEditFields((prev) => ({ ...prev, name: e.target.value }))
                }
                className={inputClass}
                disabled={updateRoute.isPending}
              />
            ) : (
              <input
                type="text"
                value={route.name}
                disabled
                className={inputClass}
              />
            )}
          </div>

          {/* Organization */}
          <div>
            <label className={labelClass}>Organization</label>
            {isPlatformAdmin ? (
              <input
                type="text"
                defaultValue={route.org?.name ?? route.org?.id ?? ""}
                className={inputClass}
                disabled={updateRoute.isPending}
              />
            ) : (
              <input
                type="text"
                value={route.org?.name ?? route.org?.id ?? ""}
                disabled
                className={inputClass}
              />
            )}
          </div>

          {/* Stops */}
          <div>
            <label className={labelClass}>Stops</label>

            {canEdit && (
              <div className="mb-3" ref={searchRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Search & add locations..."
                    className={inputClass}
                    disabled={updateRoute.isPending}
                    onFocus={() => {
                      if (locationResults.length > 0) setShowDropdown(true);
                    }}
                  />
                  {showDropdown && locationResults.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                      {locationResults.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddStop(loc);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-neutral-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <span className="font-medium">{loc.name}</span>
                          <span className="ml-2 text-xs text-neutral-400">
                            {loc.province}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stops list */}
            {canEdit ? (
              editFields.stops.length === 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">
                  No stops added yet. Search for locations above.
                </p>
              ) : (
                <div className="space-y-2">
                  {editFields.stops.map((stop, i) => (
                    <div
                      key={stop.location_id}
                      draggable={true}
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(i)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
                        dragIndex === i
                          ? "border-brand bg-brand/5 dark:bg-brand/10 opacity-50"
                          : "border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50"
                      }`}
                    >
                      {/* Drag handle */}
                      <span className="text-neutral-400 dark:text-neutral-500 select-none text-base leading-none">
                        ≡
                      </span>
                      {/* Order badge */}
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand text-xs font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {/* Stop info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                          {stop.name}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                        </p>
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(i)}
                        disabled={updateRoute.isPending}
                        className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        title="Remove stop"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Read-only stops list */
              <div className="space-y-2">
                {route.stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {stop.name}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline error */}
          {inlineError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {inlineError}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Route"
          message={`Are you sure you want to delete "${route.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 text-white hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isPending={deleteRoute.isPending}
        />
      )}
    </div>
  );
};

export default RouteDetails;

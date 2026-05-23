import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useCreateRoute } from "../hooks/useRoutesV2";
import { useLocationsList, Location } from "../hooks/useLocations";
import { useAbility } from "../contexts/AbilityContext";
import { useToastStore } from "../stores/toastStore";
import { useNavigate, Link } from "react-router-dom";
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

// ─── Main page ────────────────────────────────────────────────────────────────

const CreateRoute = () => {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const ability = useAbility();
  const createRoute = useCreateRoute();

  const [name, setName] = useState("");
  const [stops, setStops] = useState<StopDraft[]>([]);
  const [orgId, setOrgId] = useState("");
  const [inlineError, setInlineError] = useState("");

  // Location search
  const [locationSearch, setLocationSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results: locationResults } = useLocationSearch(locationSearch);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Auto-generated name preview
  const autoName =
    stops.length >= 2
      ? `${stops[0].name} — ${stops[stops.length - 1].name}`
      : "";

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

  const handleAddStop = (loc: Location) => {
    // Avoid duplicates
    if (stops.some((s) => s.location_id === loc.id)) {
      setLocationSearch("");
      setShowDropdown(false);
      return;
    }
    setStops((prev) => [
      ...prev,
      {
        location_id: loc.id,
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        order: prev.length,
      },
    ]);
    setLocationSearch("");
    setShowDropdown(false);
  };

  const handleRemoveStop = (index: number) => {
    setStops((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i }))
    );
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const reordered = [...stops];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setStops(reordered.map((s, i) => ({ ...s, order: i })));
    setDragIndex(null);
  };

  const isSubmitDisabled = stops.length < 2 || createRoute.isPending;

  const handleSubmit = () => {
    setInlineError("");
    createRoute.mutate(
      {
        name: name.trim() || undefined,
        stops: stops.map((s) => ({ location_id: s.location_id, order: s.order })),
        org_id: orgId || undefined,
      },
      {
        onSuccess: (created) => {
          showToast(
            "Route created. Define all stop-pair prices to activate this route.",
            "success"
          );
          navigate(`/routes/${created.id}`);
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === "ROUTE_ALREADY_EXISTS") {
            setInlineError("A route with this name already exists.");
          } else if (code === "INSUFFICIENT_STOPS") {
            setInlineError("A route must have at least 2 stops.");
          }
        },
      }
    );
  };

  const isPlatformAdmin = ability.can("manage", "all");

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
        <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">
          Create Route
        </h1>
      </div>

      {/* Route Details */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Route Details
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={autoName || "e.g. Kigali — Musanze"}
              className={inputClass}
              disabled={createRoute.isPending}
            />
            {!name && autoName && (
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Auto-name: {autoName}
              </p>
            )}
          </div>

          {/* Org selector */}
          <div>
            <label className={labelClass}>Organization</label>
            {isPlatformAdmin ? (
              <input
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="Enter organization ID"
                className={inputClass}
                disabled={createRoute.isPending}
              />
            ) : (
              <input
                type="text"
                value="Your organization"
                readOnly
                className={inputClass}
                disabled
              />
            )}
          </div>
        </div>
      </div>

      {/* Stops */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Stops
        </h2>

        {/* Location search */}
        <div className="mb-4" ref={searchRef}>
          <label className={labelClass}>Search & add locations</label>
          <div className="relative">
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Search locations..."
              className={inputClass}
              disabled={createRoute.isPending}
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
                    <span className="ml-2 text-xs text-neutral-400">{loc.province}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stops list */}
        {stops.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">
            No stops added yet. Search for locations above.
          </p>
        ) : (
          <div className="space-y-2">
            {stops.map((stop, i) => (
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
                  disabled={createRoute.isPending}
                  className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title="Remove stop"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        )}

        {stops.length > 0 && stops.length < 2 && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Add at least one more stop to create a route.
          </p>
        )}
      </div>

      {/* Map preview */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Map Preview
        </h2>
        <div style={{ isolation: "isolate" }} className="rounded-lg overflow-hidden">
          <MapContainer
            center={[-1.9441, 30.0619]}
            zoom={8}
            className="h-64 w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapBoundsUpdater stops={stops} />
            {stops.map((stop) => (
              <Marker
                key={stop.location_id}
                position={[stop.lat, stop.lng]}
              />
            ))}
            {stops.length >= 2 && (
              <Polyline
                positions={stops.map((s) => [s.lat, s.lng])}
                color="#3b82f6"
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Inline error */}
      {inlineError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {inlineError}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="w-full px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
      >
        {createRoute.isPending ? "Creating..." : "Create Route"}
      </button>
    </div>
  );
};

export default CreateRoute;

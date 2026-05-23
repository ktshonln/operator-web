import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useCreateLocation, RWANDA_PROVINCES } from "../hooks/useLocations";
import { useToastStore } from "../stores/toastStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

// ─── Map sub-components ───────────────────────────────────────────────────────

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapViewUpdater({ lat, lng }: { lat: string; lng: string }) {
  const map = useMap();

  useEffect(() => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      map.setView([parsedLat, parsedLng], map.getZoom());
    }
  }, [lat, lng, map]);

  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CreateLocation = () => {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const createLocation = useCreateLocation();

  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [inlineError, setInlineError] = useState("");

  const handleMapClick = (clickedLat: number, clickedLng: number) => {
    setLat(clickedLat.toFixed(6));
    setLng(clickedLng.toFixed(6));
  };

  const isMarkerVisible =
    lat !== "" &&
    lng !== "" &&
    !isNaN(parseFloat(lat)) &&
    !isNaN(parseFloat(lng));

  const isSubmitDisabled =
    !name.trim() || !province || lat === "" || lng === "" || createLocation.isPending;

  const handleSubmit = () => {
    setInlineError("");
    createLocation.mutate(
      {
        name: name.trim(),
        province,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      {
        onSuccess: (created) => {
          showToast("Location created", "success");
          navigate(`/locations/${created.id}`);
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === "LOCATION_ALREADY_EXISTS") {
            setInlineError("A location with this name already exists.");
          }
        },
      }
    );
  };

  return (
    <div className="px-4 py-6 min-h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/locations")}
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
          Back to Locations
        </button>
        <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">
          Create Location
        </h1>
      </div>

      {/* Form */}
      <div className={sectionClass}>
        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nyabugogo Terminal"
              className={inputClass}
              disabled={createLocation.isPending}
            />
          </div>

          {/* Province */}
          <div>
            <label className={labelClass}>Province</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className={inputClass}
              disabled={createLocation.isPending}
            >
              <option value="">Select a province</option>
              {RWANDA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-1.9441"
                className={inputClass}
                disabled={createLocation.isPending}
              />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="30.0619"
                className={inputClass}
                disabled={createLocation.isPending}
              />
            </div>
          </div>

          {/* Map picker */}
          <div>
            <label className={labelClass}>Pick on Map</label>
            {/* isolate creates a new stacking context so Leaflet's z-indices
                don't escape and overlap the sidebar overlay on mobile */}
            <div className="relative rounded-lg overflow-hidden" style={{ isolation: "isolate" }}>
              <MapContainer
                center={[-1.9441, 30.0619]}
                zoom={13}
                className="h-64 w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapViewUpdater lat={lat} lng={lng} />
                {isMarkerVisible && (
                  <Marker position={[parseFloat(lat), parseFloat(lng)]} />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Inline error */}
          {inlineError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {inlineError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
          >
            {createLocation.isPending ? "Creating..." : "Create Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLocation;

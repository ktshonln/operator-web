import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import {
  useLocationById,
  useUpdateLocation,
  useDeleteLocation,
  Location,
  RWANDA_PROVINCES,
} from "../hooks/useLocations";
import { useAbility } from "../contexts/AbilityContext";
import { useToastStore } from "../stores/toastStore";
import { useParams, useNavigate } from "react-router-dom";
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

// ─── Map sub-component ────────────────────────────────────────────────────────

function MapViewUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);

  return null;
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

const LocationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ability = useAbility();
  const showToast = useToastStore((s) => s.showToast);

  const { data: location, isLoading, error } = useLocationById(id!);
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const canEdit = ability.can("update", "Location");
  const canDelete = ability.can("delete", "Location");

  // Edit state
  const [editFields, setEditFields] = useState<{
    name: string;
    province: string;
    lat: number;
    lng: number;
  }>({ name: "", province: "", lat: 0, lng: 0 });
  const [inlineError, setInlineError] = useState("");

  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize editFields when location loads
  useEffect(() => {
    if (location) {
      setEditFields({
        name: location.name,
        province: location.province,
        lat: location.lat,
        lng: location.lng,
      });
    }
  }, [location]);

  const hasChanges =
    !!location &&
    (editFields.name !== location.name ||
      editFields.province !== location.province ||
      editFields.lat !== location.lat ||
      editFields.lng !== location.lng);

  const handleSave = () => {
    if (!id || !location) return;
    setInlineError("");

    const payload: Partial<Pick<Location, "name" | "province" | "lat" | "lng">> = {};
    if (editFields.name !== location.name) payload.name = editFields.name;
    if (editFields.province !== location.province) payload.province = editFields.province;
    if (editFields.lat !== location.lat) payload.lat = editFields.lat;
    if (editFields.lng !== location.lng) payload.lng = editFields.lng;

    updateLocation.mutate(
      { id, data: payload },
      {
        onSuccess: (updated) => {
          showToast("Location updated", "success");
          setEditFields({
            name: updated.name,
            province: updated.province,
            lat: updated.lat,
            lng: updated.lng,
          });
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === "LOCATION_ALREADY_EXISTS") {
            setInlineError("A location with this name already exists in this province.");
          }
        },
      }
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteLocation.mutate(id, {
      onSuccess: () => {
        navigate("/locations");
      },
      onError: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────

  if (error || !location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-neutral-600 dark:text-neutral-400">
          Location not found.
        </p>
        <button
          onClick={() => navigate("/locations")}
          className="text-brand hover:underline text-sm"
        >
          Back to Locations
        </button>
      </div>
    );
  }

  // ─── Map coordinates ─────────────────────────────────────────────────────────

  const mapLat = canEdit ? editFields.lat : location.lat;
  const mapLng = canEdit ? editFields.lng : location.lng;

  return (
    <div className="px-4 py-6 min-h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/locations")}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand mb-4 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Locations
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">
              {location.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Created:{" "}
                {new Date(location.created_at).toLocaleString()}
              </span>
              {location.updated_at && (
                <span>
                  Updated:{" "}
                  {new Date(location.updated_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Delete button */}
          {canDelete && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="shrink-0 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className={sectionClass}>
        <label className={labelClass}>Location on Map</label>
        {/* isolation: isolate creates a stacking context that keeps Leaflet's
            internal z-indices from escaping and overlapping the sidebar on mobile */}
        <div className="rounded-lg overflow-hidden" style={{ isolation: "isolate" }}>
        <MapContainer
          center={[mapLat, mapLng]}
          zoom={13}
          className="h-72 w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapViewUpdater lat={mapLat} lng={mapLng} />
          {canEdit ? (
            <Marker
              draggable={true}
              position={[editFields.lat, editFields.lng]}
              eventHandlers={{
                dragend: (e) => {
                  const pos = (e.target as any).getLatLng();
                  setEditFields((prev) => ({
                    ...prev,
                    lat: pos.lat,
                    lng: pos.lng,
                  }));
                },
              }}
            />
          ) : (
            <Marker position={[location.lat, location.lng]} />
          )}
        </MapContainer>
        </div>
      </div>

      {/* Fields */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">
          Location Details
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
                disabled={updateLocation.isPending}
              />
            ) : (
              <input
                type="text"
                value={location.name}
                disabled
                className={inputClass}
              />
            )}
          </div>

          {/* Province */}
          <div>
            <label className={labelClass}>Province</label>
            {canEdit ? (
              <select
                value={editFields.province}
                onChange={(e) =>
                  setEditFields((prev) => ({
                    ...prev,
                    province: e.target.value,
                  }))
                }
                className={inputClass}
                disabled={updateLocation.isPending}
              >
                <option value="">Select a province</option>
                {RWANDA_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={location.province}
                disabled
                className={inputClass}
              />
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Latitude</label>
              {canEdit ? (
                <input
                  type="number"
                  step="any"
                  value={editFields.lat}
                  onChange={(e) =>
                    setEditFields((prev) => ({
                      ...prev,
                      lat: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                  disabled={updateLocation.isPending}
                />
              ) : (
                <input
                  type="number"
                  value={location.lat}
                  disabled
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              {canEdit ? (
                <input
                  type="number"
                  step="any"
                  value={editFields.lng}
                  onChange={(e) =>
                    setEditFields((prev) => ({
                      ...prev,
                      lng: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                  disabled={updateLocation.isPending}
                />
              ) : (
                <input
                  type="number"
                  value={location.lng}
                  disabled
                  className={inputClass}
                />
              )}
            </div>
          </div>

          {/* Inline error */}
          {inlineError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {inlineError}
            </div>
          )}

          {/* Save button */}
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={!hasChanges || updateLocation.isPending}
              className="w-full px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
            >
              {updateLocation.isPending ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Location"
          message={`Are you sure you want to delete "${location.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 text-white hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isPending={deleteLocation.isPending}
        />
      )}
    </div>
  );
};

export default LocationDetails;

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLocationsList,
  useDeleteLocation,
  Location,
} from "../hooks/useLocations";
import { Can } from "../contexts/AbilityContext";

// ─── Location card ────────────────────────────────────────────────────────────

function LocationCard({
  location,
  onView,
  onDelete,
}: {
  location: Location;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
      onClick={onView}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 dark:text-white truncate">{location.name}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{location.province}</p>
        </div>
        <Can I="delete" a="Location">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500 dark:text-red-400 flex-shrink-0"
            title="Delete location"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </Can>
      </div>

      {/* Coordinates */}
      <p className="text-xs text-neutral-400 font-mono">
        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
      </p>
    </div>
  );
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────

function DeleteDialog({
  location,
  onConfirm,
  onCancel,
  isPending,
}: {
  location: Location;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onCancel} />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-bold text-lg dark:text-white mb-1">Delete Location</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-200">
              {location.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const Locations = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  // Debounce search input — 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useLocationsList({
    q: debouncedSearch || undefined,
    page,
    limit,
  });

  const locations: Location[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const deleteLocation = useDeleteLocation();

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteLocation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteLocation]);

  const handleLimitChange = (v: number) => {
    setLimit(v);
    setPage(1);
  };

  return (
    <div className="px-4 py-6 min-h-screen">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl dark:text-white">Locations</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {total > 0 ? `${total} location${total !== 1 ? "s" : ""}` : "Manage stop locations on the platform."}
          </p>
        </div>
        <Can I="create" a="Location">
          <button
            onClick={() => navigate("/locations/create")}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Location
          </button>
        </Can>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search locations..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 py-16 text-neutral-400">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent" />
          Loading locations...
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="py-12 text-center text-red-500 text-sm">Failed to load locations.</div>
      )}

      {/* Empty state */}
      {!isLoading && !error && locations.length === 0 && (
        <div className="flex flex-col items-center py-20 text-neutral-400">
          <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium text-lg">No locations found</p>
          <p className="text-sm mt-1">
            {debouncedSearch
              ? "Try adjusting your search terms."
              : "No locations have been added yet."}
          </p>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && !error && locations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {locations.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              onView={() => navigate(`/locations/${loc.id}`)}
              onDelete={() => setDeleteTarget(loc)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>Rows per page:</span>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="appearance-none pl-2 pr-6 py-1 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span>
              {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteDialog
          location={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteLocation.isPending}
        />
      )}
    </div>
  );
};

export default Locations;

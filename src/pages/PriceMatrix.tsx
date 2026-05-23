import { useState, useEffect, useRef, useCallback } from "react";
import { usePricesList, useUpsertPrice, useDeletePrice } from "../hooks/usePrices";
import { useLocationsList } from "../hooks/useLocations";
import { useToastStore } from "../stores/toastStore";

// ─── Styling ──────────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";

// ─── Location filter dropdown ─────────────────────────────────────────────────

function LocationFilterDropdown({
  label,
  value,
  onSelect,
  onClear,
}: {
  label: string;
  value: { id: string; name: string } | null;
  onSelect: (loc: { id: string; name: string }) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value?.name ?? "");
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data } = useLocationsList(
    debouncedSearch.trim() ? { q: debouncedSearch.trim(), limit: 10 } : undefined
  );
  const results = debouncedSearch.trim() ? (data?.data ?? []) : [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex-1 min-w-[180px]" ref={ref}>
      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            if (!e.target.value) onClear();
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Filter by ${label.toLowerCase()}...`}
          className={inputClass}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onClear(); setSearch(""); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            ✕
          </button>
        )}
        {open && results.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
            {results.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect({ id: loc.id, name: loc.name });
                  setSearch(loc.name);
                  setOpen(false);
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
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PriceMatrix = () => {
  const showToast = useToastStore((s) => s.showToast);

  const [boardingFilter, setBoardingFilter] = useState<{ id: string; name: string } | null>(null);
  const [alightingFilter, setAlightingFilter] = useState<{ id: string; name: string } | null>(null);

  const [editingCell, setEditingCell] = useState<{ boardingId: string; alightingId: string } | null>(null);
  const [cellInput, setCellInput] = useState("");
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = usePricesList({
    boarding_stop_id: boardingFilter?.id,
    alighting_stop_id: alightingFilter?.id,
    limit: 200,
  });

  const upsertPrice = useUpsertPrice();
  const deletePrice = useDeletePrice();

  const prices = data?.data ?? [];

  // Derive unique stops from prices
  const boardingStops = Array.from(
    new Map(prices.map((p) => [p.boarding_stop.id, p.boarding_stop])).values()
  );
  const alightingStops = Array.from(
    new Map(prices.map((p) => [p.alighting_stop.id, p.alighting_stop])).values()
  );

  // All unique stops combined (for ordering)
  const allStopIds = Array.from(
    new Set([...boardingStops.map((s) => s.id), ...alightingStops.map((s) => s.id)])
  );

  // Price lookup map
  const priceMap = new Map(
    prices.map((p) => [`${p.boarding_stop.id}:${p.alighting_stop.id}`, p])
  );

  // Running count
  const definedCount = prices.length;
  const possibleCount = boardingStops.reduce((acc, b) => {
    return acc + alightingStops.filter((a) => {
      const bIdx = allStopIds.indexOf(b.id);
      const aIdx = allStopIds.indexOf(a.id);
      return bIdx < aIdx;
    }).length;
  }, 0);

  const handleSaveCell = useCallback(
    async (boardingId: string, alightingId: string, value: string) => {
      const amount = parseFloat(value);
      if (isNaN(amount) || value.trim() === "") {
        setEditingCell(null);
        return;
      }
      try {
        await upsertPrice.mutateAsync({
          boarding_stop_id: boardingId,
          alighting_stop_id: alightingId,
          amount,
          currency: "RWF",
        });
        const key = `${boardingId}:${alightingId}`;
        setFlashCells((prev) => new Set(prev).add(key));
        setTimeout(() => {
          setFlashCells((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 800);
      } catch {
        showToast("Failed to save price.", "error");
      }
      setEditingCell(null);
    },
    [upsertPrice, showToast]
  );

  const handleClearFilters = () => {
    setBoardingFilter(null);
    setAlightingFilter(null);
  };

  return (
    <div className="px-4 py-6 min-h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl dark:text-white">Prices</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage stop-pair fares across all routes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-5 items-end">
        <LocationFilterDropdown
          label="Origin (Boarding)"
          value={boardingFilter}
          onSelect={setBoardingFilter}
          onClear={() => setBoardingFilter(null)}
        />
        <LocationFilterDropdown
          label="Destination (Alighting)"
          value={alightingFilter}
          onSelect={setAlightingFilter}
          onClear={() => setAlightingFilter(null)}
        />
        {(boardingFilter || alightingFilter) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-brand hover:underline self-end pb-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2">
              {[...Array(5)].map((_, j) => (
                <div
                  key={j}
                  className="h-10 flex-1 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="py-12 text-center text-red-500 text-sm">
          Failed to load prices.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && prices.length === 0 && (
        <div className="flex flex-col items-center py-20 text-neutral-400">
          <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-lg">No prices found</p>
          <p className="text-sm mt-1">
            {boardingFilter || alightingFilter
              ? "Try adjusting your filters."
              : "No prices have been defined yet."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && prices.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                    Boarding ↓ / Alighting →
                  </th>
                  {alightingStops.map((col) => (
                    <th
                      key={col.id}
                      className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap"
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boardingStops.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={rowIdx % 2 === 0 ? "bg-white dark:bg-neutral-950" : "bg-gray-50/50 dark:bg-neutral-900/50"}
                  >
                    {/* Row header */}
                    <td className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b border-gray-100 dark:border-neutral-800 whitespace-nowrap">
                      {row.name}
                    </td>

                    {/* Cells */}
                    {alightingStops.map((col) => {
                      const bIdx = allStopIds.indexOf(row.id);
                      const aIdx = allStopIds.indexOf(col.id);
                      const isSameOrBackward = bIdx >= aIdx;
                      const cellKey = `${row.id}:${col.id}`;
                      const existingPrice = priceMap.get(cellKey);
                      const isEditing =
                        editingCell?.boardingId === row.id &&
                        editingCell?.alightingId === col.id;
                      const isFlashing = flashCells.has(cellKey);

                      if (isSameOrBackward) {
                        return (
                          <td
                            key={col.id}
                            className="px-4 py-3 text-center text-neutral-300 dark:text-neutral-600 border-b border-gray-100 dark:border-neutral-800"
                          >
                            —
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.id}
                          className={`px-2 py-2 text-center border-b border-gray-100 dark:border-neutral-800 transition-colors ${
                            isFlashing
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "hover:bg-brand/5 dark:hover:bg-brand/10"
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                autoFocus
                                value={cellInput}
                                onChange={(e) => setCellInput(e.target.value)}
                                onBlur={() => handleSaveCell(row.id, col.id, cellInput)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveCell(row.id, col.id, cellInput);
                                  if (e.key === "Escape") setEditingCell(null);
                                }}
                                className="w-20 px-2 py-1 text-xs border border-brand rounded focus:outline-none focus:ring-1 focus:ring-brand bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                              />
                              <span className="text-xs text-neutral-400">RWF</span>
                            </div>
                          ) : (
                            <div className="group relative flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCell({ boardingId: row.id, alightingId: col.id });
                                  setCellInput(existingPrice ? String(existingPrice.amount) : "");
                                }}
                                className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-brand transition-colors min-w-[3rem]"
                              >
                                {existingPrice ? (
                                  <span className="font-medium">{existingPrice.amount.toLocaleString()}</span>
                                ) : (
                                  <span className="text-neutral-300 dark:text-neutral-600 border border-dashed border-neutral-300 dark:border-neutral-600 rounded px-2 py-0.5">
                                    +
                                  </span>
                                )}
                              </button>
                              {existingPrice && (
                                <button
                                  type="button"
                                  onClick={() => deletePrice.mutate(existingPrice.id)}
                                  className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400 transition-all text-xs"
                                  title="Remove price"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Running count */}
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {definedCount} of {possibleCount} possible pairs defined
          </p>
        </>
      )}
    </div>
  );
};

export default PriceMatrix;

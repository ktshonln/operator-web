import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useUpdateTrip } from "../../hooks/useFleetTrips";
import { useFleetBusesPaginated } from "../../hooks/useFleetBus";
import { axiosInstance } from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "../../types/trips";

interface Props {
  trip: Trip;
  onClose: () => void;
  onUpdated: (updated: Trip | Trip[]) => void;
}

function useDriverSearch(q: string) {
  return useQuery({
    queryKey: ["driver-search-edit", q],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users", {
        params: { role: "driver", q: q || undefined, limit: 20 },
      });
      return (data as any).data ?? [];
    },
  });
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";
const labelClass = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";

export default function EditPanel({ trip, onClose, onUpdated }: Props) {
  const updateTrip = useUpdateTrip(trip.id);
  const isSeries = !!trip.series_id && !trip.series?.is_only_in_series;

  const [departureTime, setDepartureTime] = useState(format(new Date(trip.departure_at), "HH:mm"));
  const [totalSeats, setTotalSeats] = useState<number>(trip.total_seats);
  const [isExpress, setIsExpress] = useState(trip.is_express);
  const [selectedBusId, setSelectedBusId] = useState(trip.bus?.id ?? "");
  const [selectedDriverId, setSelectedDriverId] = useState(trip.driver?.id ?? "");
  const [busSearch, setBusSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [showScopeDialog, setShowScopeDialog] = useState(false);

  const { data: busesData } = useFleetBusesPaginated({ q: busSearch || undefined, limit: 20 });
  const buses = busesData?.data ?? [];
  const { data: drivers = [] } = useDriverSearch(driverSearch);

  // Auto-fill seats from bus
  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find((b) => b.id === selectedBusId);
      if (bus) setTotalSeats(bus.capacity ?? totalSeats);
    }
  }, [selectedBusId]);

  const hasChanges =
    departureTime !== format(new Date(trip.departure_at), "HH:mm") ||
    totalSeats !== trip.total_seats ||
    isExpress !== trip.is_express ||
    selectedBusId !== (trip.bus?.id ?? "") ||
    selectedDriverId !== (trip.driver?.id ?? "");

  const handleSave = () => {
    if (isSeries) {
      setShowScopeDialog(true);
    } else {
      doUpdate("this");
    }
  };

  const doUpdate = (scope: "this" | "future") => {
    const payload: any = {
      scope,
      departure_time: departureTime,
      total_seats: totalSeats,
      is_express: isExpress,
      bus_id: selectedBusId || null,
      driver_id: selectedDriverId || null,
    };

    updateTrip.mutate(payload, {
      onSuccess: (data) => {
        if (scope === "this") {
          // description: returns single Trip object directly
          onUpdated(data as Trip);
        } else {
          // description: returns { updated: count, skipped: [...] }
          // query invalidation handles the refetch; pass empty array to close panel
          onUpdated([]);
        }
        setShowScopeDialog(false);
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-neutral-950 shadow-2xl z-[60] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="font-bold text-lg dark:text-white">Edit Trip</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {format(new Date(trip.departure_at), "EEE, MMM d · HH:mm")}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          <div>
            <label className={labelClass}>Departure time</label>
            <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Bus (optional)</label>
            <input
              type="text"
              value={busSearch}
              onChange={(e) => setBusSearch(e.target.value)}
              placeholder="Search buses..."
              className={inputClass + " mb-1"}
            />
            <select value={selectedBusId} onChange={(e) => setSelectedBusId(e.target.value)} className={inputClass}>
              <option value="">No bus assigned</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>{b.plate} · {b.type} · {b.capacity} seats</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Total seats</label>
            <input
              type="number"
              min={1}
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Driver (optional)</label>
            <input
              type="text"
              value={driverSearch}
              onChange={(e) => setDriverSearch(e.target.value)}
              placeholder="Search drivers..."
              className={inputClass + " mb-1"}
            />
            <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className={inputClass}>
              <option value="">No driver assigned</option>
              {drivers.map((d: any) => (
                <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Express trip</span>
            <button
              type="button"
              onClick={() => setIsExpress((v) => !v)}
              className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-all ${isExpress ? "bg-brand justify-end" : "bg-neutral-300 dark:bg-neutral-600 justify-start"}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 shrink-0">
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateTrip.isPending}
            className="w-full px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
          >
            {updateTrip.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Scope dialog */}
      {showScopeDialog && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={() => setShowScopeDialog(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm z-[80] p-6">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">Save changes</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              This trip is part of a series. Apply changes to:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => doUpdate("this")}
                disabled={updateTrip.isPending}
                className="w-full px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                Just this trip
              </button>
              <button
                onClick={() => doUpdate("future")}
                disabled={updateTrip.isPending}
                className="w-full px-4 py-2.5 text-sm font-medium border border-brand text-brand rounded-lg hover:bg-brand/5 disabled:opacity-50 transition-colors"
              >
                This and all future trips in series
              </button>
              <button onClick={() => setShowScopeDialog(false)} className="w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

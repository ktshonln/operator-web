import { useState, useEffect } from "react";
import { useCreateTrip } from "../../hooks/useFleetTrips";
import { useFleetBusesPaginated } from "../../hooks/useFleetBus";
import { axiosInstance } from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "../../hooks/useRoutes";
import type { Trip } from "../../types/trips";

interface Props {
  route: Route;
  date: string;
  time: string;
  onClose: () => void;
  onCreated: (trips: Trip[]) => void;
}

function useDriverSearch(q: string) {
  return useQuery({
    queryKey: ["driver-search-popup", q],
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

export default function CreationPopup({ route, date, time, onClose, onCreated }: Props) {
  const createTrip = useCreateTrip();

  const [departureTime, setDepartureTime] = useState(time);
  const [startsOn, setStartsOn] = useState(date);
  const [endsOn, setEndsOn] = useState("");
  const [isExpress, setIsExpress] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [frequencyMinutes, setFrequencyMinutes] = useState<number | null>(null);
  const [totalSeats, setTotalSeats] = useState<number | "">("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [busSearch, setBusSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [seatsError, setSeatsError] = useState("");
  const [dateError, setDateError] = useState("");

  const { data: busesData } = useFleetBusesPaginated({ q: busSearch || undefined, limit: 20 });
  const buses = busesData?.data ?? [];
  const suggestedBuses = buses.filter((b) => b.routes?.some((r: any) => r.id === route.id));
  const otherBuses = buses.filter((b) => !b.routes?.some((r: any) => r.id === route.id));

  const { data: drivers = [] } = useDriverSearch(driverSearch);

  // Auto-fill seats from bus
  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find((b) => b.id === selectedBusId);
      if (bus) setTotalSeats(bus.capacity ?? "");
    }
  }, [selectedBusId]);

  const handleSave = () => {
    setSeatsError("");
    setDateError("");

    if (!repeat && !selectedBusId && !totalSeats) {
      setSeatsError("Total seats is required when no bus is assigned");
      return;
    }
    if (repeatDaily && !endsOn) {
      setDateError("End date is required for daily repeat");
      return;
    }
    if (repeatDaily && endsOn && endsOn <= startsOn) {
      setDateError("End date must be after start date");
      return;
    }

    const payload: any = {
      route_id: route.id,
      departure_time: departureTime,
      starts_on: startsOn,
      is_express: isExpress,
      repeat_daily: repeat && repeatDaily,
      frequency_minutes: repeat ? frequencyMinutes : null,
    };

    if (repeat && repeatDaily && endsOn) payload.ends_on = endsOn;
    if (!repeat) {
      if (selectedBusId) payload.bus_id = selectedBusId;
      if (selectedDriverId) payload.driver_id = selectedDriverId;
      if (totalSeats) payload.total_seats = Number(totalSeats);
    }

    createTrip.mutate(payload, {
      onSuccess: (res) => {
        onCreated(res.trips ?? []);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        if (code === "TOTAL_SEATS_REQUIRED") setSeatsError("Total seats is required when no bus is assigned");
        else if (code === "INVALID_DATE_RANGE") setDateError("End date must be after start date");
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md z-[60] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="font-bold text-base text-neutral-900 dark:text-white">New Trip</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Route — read only */}
          <div>
            <label className={labelClass}>Route</label>
            <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
              {route.name}
            </div>
          </div>

          {/* Departure time + start date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Departure time</label>
              <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Is Express */}
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

          {/* Repeat toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Repeat</span>
            <button
              type="button"
              onClick={() => setRepeat((v) => !v)}
              className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-all ${repeat ? "bg-brand justify-end" : "bg-neutral-300 dark:bg-neutral-600 justify-start"}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>

          {repeat && (
            <div className="space-y-3 pl-3 border-l-2 border-brand/30">
              {/* Frequency */}
              <div>
                <label className={labelClass}>Frequency</label>
                <select
                  value={frequencyMinutes ?? ""}
                  onChange={(e) => setFrequencyMinutes(e.target.value ? Number(e.target.value) : null)}
                  className={inputClass}
                >
                  <option value="">Once per day</option>
                  <option value="30">Every 30 min</option>
                  <option value="60">Every 60 min</option>
                  <option value="90">Every 90 min</option>
                  <option value="120">Every 2 hours</option>
                  <option value="180">Every 3 hours</option>
                  <option value="240">Every 4 hours</option>
                </select>
              </div>

              {/* Repeat daily */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Repeat daily</span>
                <button
                  type="button"
                  onClick={() => setRepeatDaily((v) => !v)}
                  className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-all ${repeatDaily ? "bg-brand justify-end" : "bg-neutral-300 dark:bg-neutral-600 justify-start"}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>

              {repeatDaily && (
                <div>
                  <label className={labelClass}>End date *</label>
                  <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className={inputClass} />
                  {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                </div>
              )}

              <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                Bus and driver assignment is done per trip for recurring series
              </p>
            </div>
          )}

          {/* Bus + Driver (one-off only) */}
          {!repeat && (
            <>
              <div>
                <label className={labelClass}>Bus (optional)</label>
                <input
                  type="text"
                  value={busSearch}
                  onChange={(e) => setBusSearch(e.target.value)}
                  placeholder="Search buses..."
                  className={inputClass + " mb-1"}
                />
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No bus assigned</option>
                  {suggestedBuses.length > 0 && (
                    <optgroup label="Suggested for this route">
                      {suggestedBuses.map((b) => (
                        <option key={b.id} value={b.id}>{b.plate} · {b.type} · {b.capacity} seats</option>
                      ))}
                    </optgroup>
                  )}
                  {otherBuses.length > 0 && (
                    <optgroup label="Other buses">
                      {otherBuses.map((b) => (
                        <option key={b.id} value={b.id}>{b.plate} · {b.type} · {b.capacity} seats</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>Total seats {!selectedBusId && "*"}</label>
                <input
                  type="number"
                  min={1}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value ? Number(e.target.value) : "")}
                  placeholder={selectedBusId ? "Auto-filled from bus" : "Required"}
                  className={inputClass}
                />
                {seatsError && <p className="text-red-500 text-xs mt-1">{seatsError}</p>}
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
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createTrip.isPending}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
            >
              {createTrip.isPending ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

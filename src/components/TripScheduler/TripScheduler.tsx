import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  SlotInfo,
} from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { BsCalendar3, BsList, BsExclamationTriangle } from "react-icons/bs";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { Zap } from "lucide-react";
import { useFleetTrips } from "../../hooks/useFleetTrips";
import { useRoutes, Route } from "../../hooks/useRoutes";
import type { Trip } from "../../types/trips";
import CreationPopup from "./CreationPopup";
import QuickInfoPopup from "./QuickInfoPopup";
import EditPanel from "./EditPanel";

import "react-big-calendar/lib/css/react-big-calendar.css";

// ─── Localizer ────────────────────────────────────────────────────────────────

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return {
    from: format(start, "yyyy-MM-dd"),
    to: format(end, "yyyy-MM-dd"),
  };
}

function occupancyColor(booked: number, total: number) {
  if (total === 0) return "bg-brand";
  const pct = booked / total;
  if (pct >= 0.8) return "bg-red-500";
  if (pct >= 0.5) return "bg-amber-500";
  return "bg-green-500";
}

function tripToCalEvent(trip: Trip) {
  const start = new Date(trip.departure_at);
  const end = addDays(start, 0);
  end.setHours(start.getHours() + 1);
  return { ...trip, start, end, title: trip.route?.name ?? "Trip" };
}

// ─── Tile component ───────────────────────────────────────────────────────────

function TripTile({ trip }: { trip: Trip }) {
  const color = occupancyColor(trip.booked_seats, trip.total_seats);
  const unassigned = !trip.bus || !trip.driver;
  return (
    <div className={`h-full w-full rounded px-1.5 py-1 text-white text-[10px] font-medium flex flex-col gap-0.5 ${color} ${trip.is_express ? "express-shimmer" : ""}`}>
      <div className="flex items-center gap-1 truncate">
        {unassigned && <BsExclamationTriangle className="w-2.5 h-2.5 shrink-0 text-yellow-200" />}
        <span className="truncate font-semibold">{format(new Date(trip.departure_at), "HH:mm")}</span>
        {trip.is_express && (
          <Zap className="w-2.5 h-2.5 shrink-0 fill-white text-white ml-auto" />
        )}
      </div>
      <span className="text-white/80 truncate">{trip.remaining_seats}/{trip.total_seats}</span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="flex-1 p-4 animate-pulse">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-neutral-800 rounded" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: 7 }).map((_, j) => (
            <div key={j} className="h-12 bg-gray-50 dark:bg-neutral-900 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TripScheduler() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeSearch, setRouteSearch] = useState("");
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [localTrips, setLocalTrips] = useState<Trip[]>([]);

  // Popup/panel state
  const [creationSlot, setCreationSlot] = useState<{ date: string; time: string } | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const routeSearchRef = useRef<HTMLInputElement>(null);

  // ─── Data ────────────────────────────────────────────────────────────────────
  const { from, to } = getWeekRange(currentDate);
  const { data: routesData } = useRoutes(routeSearch);
  const routes: Route[] = routesData ?? [];

  const tripsParams = useMemo(() => ({
    route_id: selectedRoute?.id,
    from,
    to,
    ...(unassignedOnly ? { unassigned_only: true } : {}),
    limit: 200,
  }), [selectedRoute?.id, from, to, unassignedOnly]);

  const { data: tripsData, isLoading } = useFleetTrips(tripsParams, !!selectedRoute);

  // Sync server trips into local state
  useEffect(() => {
    if (tripsData?.data) {
      setLocalTrips(tripsData.data);
    }
  }, [tripsData]);

  const calEvents = useMemo(() => localTrips.map(tripToCalEvent), [localTrips]);

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => setCurrentDate((d) => addDays(d, -7));
  const goNext = () => setCurrentDate((d) => addDays(d, 7));

  // Lock body scroll when any popup/panel is open
  useEffect(() => {
    const isOpen = !!(creationSlot || selectedTrip || editingTrip);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [creationSlot, selectedTrip, editingTrip]);

  // ─── Slot click ──────────────────────────────────────────────────────────────
  const handleSelectSlot = useCallback((slot: SlotInfo) => {
    if (!selectedRoute) return;
    const date = format(slot.start as Date, "yyyy-MM-dd");
    const time = format(slot.start as Date, "HH:mm");
    setCreationSlot({ date, time });
  }, [selectedRoute]);

  // ─── Trip click ──────────────────────────────────────────────────────────────
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedTrip(event as Trip);
  }, []);

  // ─── After create ─────────────────────────────────────────────────────────────
  const handleTripCreated = (newTrips: Trip[]) => {
    setLocalTrips((prev) => [...prev, ...newTrips]);
    setCreationSlot(null);
  };

  // ─── After edit ───────────────────────────────────────────────────────────────
  const handleTripUpdated = (updated: Trip | Trip[]) => {
    const arr = Array.isArray(updated) ? updated : [updated];
    setLocalTrips((prev) =>
      prev.map((t) => {
        const u = arr.find((u) => u.id === t.id);
        return u ?? t;
      })
    );
    setEditingTrip(null);
    setSelectedTrip(null);
  };

  // ─── After delete ─────────────────────────────────────────────────────────────
  const handleTripDeleted = (id: string, scope: "this" | "future") => {
    if (scope === "future") {
      const trip = localTrips.find((t) => t.id === id);
      if (trip?.series_id) {
        setLocalTrips((prev) =>
          prev.filter(
            (t) =>
              t.series_id !== trip.series_id ||
              new Date(t.departure_at) < new Date(trip.departure_at)
          )
        );
      } else {
        setLocalTrips((prev) => prev.filter((t) => t.id !== id));
      }
    } else {
      setLocalTrips((prev) => prev.filter((t) => t.id !== id));
    }
    setSelectedTrip(null);
  };

  // ─── Week label ───────────────────────────────────────────────────────────────
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekLabel =
    format(weekStart, "MMM d") + " – " + format(weekEnd, "MMM d, yyyy");

  return (
    <div className="flex flex-col h-full min-h-screen bg-white dark:bg-neutral-950 font-heebo">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-gray-200 dark:border-neutral-800 shrink-0">
        <div>
          <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">Trips</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your trip schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              <BsCalendar3 className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              <BsList className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          {/* Unassigned only toggle */}
          <button
            onClick={() => setUnassignedOnly((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              unassignedOnly
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                : "border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-brand"
            }`}
          >
            <BsExclamationTriangle className="w-3.5 h-3.5" />
            Unassigned only
          </button>
        </div>
      </div>

      {/* ─── Route search + week nav ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-neutral-800 shrink-0">
        {/* Route search */}
        <div className="relative flex-1 max-w-sm">
          <input
            ref={routeSearchRef}
            type="text"
            value={selectedRoute ? selectedRoute.name : routeSearch}
            onChange={(e) => {
              setRouteSearch(e.target.value);
              setSelectedRoute(null);
              setShowRouteDropdown(true);
            }}
            onFocus={() => setShowRouteDropdown(true)}
            placeholder="Search and select a route..."
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
          {selectedRoute && (
            <button
              onClick={() => { setSelectedRoute(null); setRouteSearch(""); setLocalTrips([]); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {showRouteDropdown && !selectedRoute && routes.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowRouteDropdown(false)} />
              <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-20 max-h-48 overflow-y-auto custom-scrollbar">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => {
                      setSelectedRoute(route);
                      setRouteSearch("");
                      setShowRouteDropdown(false);
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-neutral-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {route.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button onClick={goPrev} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <BiChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <span className="px-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[180px] text-center">
              {weekLabel}
            </span>
            <button onClick={goNext} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <BiChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Calendar / List body ─────────────────────────────────────────────── */}
      <div className="flex-1 relative min-h-0">

        {/* No-route overlay — floats above the grid */}
        {!selectedRoute && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-[2px]">
            <BsCalendar3 className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
            <h3 className="font-semibold text-base text-neutral-700 dark:text-neutral-300 mb-1">
              Select a route to get started
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Search for a route above to view and manage trips
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {selectedRoute && isLoading && (
          <div className="absolute inset-0 z-10">
            <CalendarSkeleton />
          </div>
        )}

        {/* Calendar view — always in the DOM as the base layer */}
        {view === "calendar" && (
          <div className="absolute inset-0 trip-calendar-wrapper">
            {selectedRoute && localTrips.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-[5] pointer-events-none">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-950 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800">
                  No trips this week — click a time slot to create one
                </p>
              </div>
            )}
            <Calendar
              localizer={localizer}
              events={calEvents}
              view={Views.WEEK}
              onView={() => {}}
              date={currentDate}
              onNavigate={setCurrentDate}
              selectable={!!selectedRoute}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              toolbar={false}
              step={60}
              timeslots={1}
              style={{ height: "100%" }}
              eventPropGetter={() => ({
                style: { background: "transparent", border: "none", padding: 0 },
              })}
              components={{
                event: ({ event }: { event: any }) => <TripTile trip={event as Trip} />,
                header: ({ date }: { date: Date }) => {
                  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  return (
                    <div className="flex flex-col items-center justify-center py-3 overflow-visible">
                      <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-2 ${isToday ? "text-brand" : "text-neutral-400 dark:text-neutral-500"}`}>
                        {format(date, "EEE")}
                      </span>
                      <div className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
                        isToday
                          ? "bg-brand text-white shadow-md shadow-brand/30"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }`}>
                        {format(date, "d")}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </div>
        )}

        {/* List view */}
        {view === "list" && selectedRoute && !isLoading && (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4">
            {localTrips.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No trips this week for this route</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...localTrips]
                  .sort((a, b) => new Date(a.departure_at).getTime() - new Date(b.departure_at).getTime())
                  .map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
                      className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {format(new Date(trip.departure_at), "EEEE, MMM d · HH:mm")}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {trip.route?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {trip.is_express && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-brand/10 text-brand rounded-full">Express</span>
                          )}
                          {(!trip.bus || !trip.driver) && (
                            <BsExclamationTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{trip.bus ? trip.bus.plate : "No bus"}</span>
                        <span>·</span>
                        <span>{trip.driver ? `${trip.driver.first_name} ${trip.driver.last_name}` : "No driver"}</span>
                        <span>·</span>
                        <span>{trip.booked_seats}/{trip.total_seats} seats</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Popups / Panels ─────────────────────────────────────────────────── */}
      {creationSlot && selectedRoute && (
        <CreationPopup
          route={selectedRoute}
          date={creationSlot.date}
          time={creationSlot.time}
          onClose={() => setCreationSlot(null)}
          onCreated={handleTripCreated}
        />
      )}

      {selectedTrip && !editingTrip && (
        <QuickInfoPopup
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onEdit={() => setEditingTrip(selectedTrip)}
          onDeleted={handleTripDeleted}
        />
      )}

      {editingTrip && (
        <EditPanel
          trip={editingTrip}
          onClose={() => { setEditingTrip(null); setSelectedTrip(null); }}
          onUpdated={handleTripUpdated}
        />
      )}
    </div>
  );
}

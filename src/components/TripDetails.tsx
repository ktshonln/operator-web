import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Zap, ChevronLeft, Info } from "lucide-react";
import { BsExclamationTriangle } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import Can from "./Can";
import { useUpdateTrip, useCancelTrip } from "../hooks/useFleetTrips";
import { useFleetBusesPaginated } from "../hooks/useFleetBus";
import { buildCdnUrl, axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import {
  useTripDetail,
  useTripTickets,
  useTripPrice,
  useCreateCashTicket,
} from "../hooks/useTripDetail";
import type { TripTicket, TripStop } from "../hooks/useTripDetail";

// ─── Constants ────────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";
const labelClass =
  "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";

// ─── Driver search hook ───────────────────────────────────────────────────────

function useDriverSearch(q: string) {
  return useQuery({
    queryKey: ["driver-search-detail", q],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users", {
        params: { role: "driver", q: q || undefined, limit: 20 },
      });
      return (data as any).data ?? [];
    },
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? map.scheduled}`}>
      {status}
    </span>
  );
}

// ─── Ticket status badge ──────────────────────────────────────────────────────

function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

// ─── Payment method badge ─────────────────────────────────────────────────────

function PaymentBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    mtn: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    airtel: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    wallet: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    cash: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${map[method] ?? ""}`}>
      {method}
    </span>
  );
}

// ─── Created by badge ─────────────────────────────────────────────────────────

function CreatedByBadge({ by }: { by: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
      by === "staff"
        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
    }`}>
      {by === "staff" ? "Staff" : "Passenger"}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-neutral-800 rounded ${className ?? ""}`} />
  );
}

// ─── Scope dialog ─────────────────────────────────────────────────────────────

interface ScopeDialogProps {
  title: string;
  description: string;
  isPending: boolean;
  onThis: () => void;
  onFuture: () => void;
  onCancel: () => void;
}

function ScopeDialog({ title, description, isPending, onThis, onFuture, onCancel }: ScopeDialogProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[70]" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm z-[80] p-6">
        <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">{description}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onThis}
            disabled={isPending}
            className="w-full px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
          >
            Just this trip
          </button>
          <button
            onClick={onFuture}
            disabled={isPending}
            className="w-full px-4 py-2.5 text-sm font-medium border border-brand text-brand rounded-lg hover:bg-brand/5 disabled:opacity-50 transition-colors"
          >
            This and all future trips in series
          </button>
          <button onClick={onCancel} className="w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Series popover ───────────────────────────────────────────────────────────

interface SeriesPopoverProps {
  series: {
    frequency_minutes: number | null;
    repeat_daily: boolean;
    starts_on: string;
    ends_on: string | null;
  };
}

function SeriesPopover({ series }: SeriesPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const freqLabel = series.frequency_minutes
    ? `Every ${series.frequency_minutes} min`
    : "Once per day";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:brightness-95 transition-colors"
      >
        <Info className="w-3 h-3" />
        Series
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl p-4 w-56 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Frequency</span>
            <span className="font-medium text-neutral-900 dark:text-white">{freqLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Repeat daily</span>
            <span className="font-medium text-neutral-900 dark:text-white">{series.repeat_daily ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Starts on</span>
            <span className="font-medium text-neutral-900 dark:text-white">{series.starts_on}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Ends on</span>
            <span className="font-medium text-neutral-900 dark:text-white">{series.ends_on ?? "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Ticket Popup ──────────────────────────────────────────────────────

interface CreateTicketPopupProps {
  tripId: string;
  stops: TripStop[];
  remainingSeats: number;
  onClose: () => void;
  onCreated: (ticket: TripTicket) => void;
}

function CreateTicketPopup({ tripId, stops, remainingSeats, onClose, onCreated }: CreateTicketPopupProps) {
  const showToast = useToastStore((s) => s.showToast);
  const createTicket = useCreateCashTicket();

  const [step, setStep] = useState<1 | 2>(1);
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [boardingStopId, setBoardingStopId] = useState("");
  const [alightingStopId, setAlightingStopId] = useState("");
  const [seatsCount, setSeatsCount] = useState(1);
  const [seatsError, setSeatsError] = useState("");

  // Stops after boarding stop
  const boardingIndex = stops.findIndex((s) => s.id === boardingStopId);
  const alightingStops = boardingIndex >= 0 ? stops.slice(boardingIndex + 1) : [];

  // Reset alighting when boarding changes
  useEffect(() => {
    setAlightingStopId("");
  }, [boardingStopId]);

  const {
    data: priceData,
    isLoading: priceLoading,
    isError: priceError,
  } = useTripPrice(boardingStopId || undefined, alightingStopId || undefined);

  const perSeatPrice = priceData?.amount ?? 0;
  const totalPrice = perSeatPrice * seatsCount;
  const currency = priceData?.currency ?? "RWF";

  const boardingStop = stops.find((s) => s.id === boardingStopId);
  const alightingStop = stops.find((s) => s.id === alightingStopId);

  const step1Valid =
    passengerName.trim() !== "" &&
    phone.trim() !== "" &&
    boardingStopId !== "" &&
    alightingStopId !== "" &&
    seatsCount >= 1 &&
    !!priceData &&
    !priceError;

  const handleNext = () => {
    if (step1Valid) setStep(2);
  };

  const handleConfirm = () => {
    setSeatsError("");
    createTicket.mutate(
      {
        trip_id: tripId,
        boarding_stop_id: boardingStopId,
        alighting_stop_id: alightingStopId,
        seats_count: seatsCount,
        payment_method: "cash",
        phone,
        passenger_name: passengerName,
      },
      {
        onSuccess: (res) => {
          showToast("Ticket created successfully", "success");
          // Build a TripTicket shape from the response
          const newTicket: TripTicket = {
            id: res.id,
            passenger_name: res.passenger_name,
            phone: res.phone,
            boarding_stop: res.boarding_stop,
            alighting_stop: res.alighting_stop,
            seats_count: res.seats_count,
            amount: res.amount,
            currency: res.currency,
            payment_method: res.payment_method,
            status: "confirmed",
            created_by: "staff",
            booked_at: new Date().toISOString(),
          };
          onCreated(newTicket);
          onClose();
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === "NO_SEATS_AVAILABLE") {
            const available = err?.response?.data?.error?.available ?? 0;
            setSeatsError(`Only ${available} seat${available !== 1 ? "s" : ""} remaining`);
            setSeatsCount(Math.min(seatsCount, available));
            setStep(1);
          } else if (code === "PRICE_NOT_FOUND") {
            showToast("Price unavailable for this stop combination", "error");
            setStep(1);
          } else {
            showToast(err?.response?.data?.error?.message || "Failed to create ticket", "error");
          }
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md z-[60] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="font-bold text-base text-neutral-900 dark:text-white">
            {step === 1 ? "Create Ticket" : "Confirm Ticket"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Passenger name *</label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250788123456"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Boarding stop *</label>
              <select
                value={boardingStopId}
                onChange={(e) => setBoardingStopId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select boarding stop</option>
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Alighting stop *</label>
              <select
                value={alightingStopId}
                onChange={(e) => setAlightingStopId(e.target.value)}
                disabled={!boardingStopId}
                className={inputClass}
              >
                <option value="">Select alighting stop</option>
                {alightingStops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Seats count</label>
              <input
                type="number"
                min={1}
                max={remainingSeats}
                value={seatsCount}
                onChange={(e) => {
                  setSeatsCount(Math.min(Number(e.target.value), remainingSeats));
                  setSeatsError("");
                }}
                className={inputClass}
              />
              {seatsError && <p className="text-red-500 text-xs mt-1">{seatsError}</p>}
            </div>
            <div>
              <label className={labelClass}>Payment method</label>
              <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                <PaymentBadge method="cash" />
              </div>
            </div>
            {/* Price display */}
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg px-4 py-3 text-sm">
              {priceLoading && boardingStopId && alightingStopId ? (
                <p className="text-neutral-500 dark:text-neutral-400">Fetching price...</p>
              ) : priceError && boardingStopId && alightingStopId ? (
                <p className="text-red-500 text-xs">Price unavailable for this combination</p>
              ) : priceData ? (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {currency} {perSeatPrice.toLocaleString()} × {seatsCount}
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {currency} {totalPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-neutral-400 text-xs">Select stops to see price</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!step1Valid}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Review the details before confirming.</p>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Passenger</span>
                <span className="font-medium text-neutral-900 dark:text-white">{passengerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Phone</span>
                <span className="font-medium text-neutral-900 dark:text-white">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Boarding</span>
                <span className="font-medium text-neutral-900 dark:text-white">{boardingStop?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Alighting</span>
                <span className="font-medium text-neutral-900 dark:text-white">{alightingStop?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Seats</span>
                <span className="font-medium text-neutral-900 dark:text-white">{seatsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Total amount</span>
                <span className="font-bold text-neutral-900 dark:text-white">{currency} {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Payment</span>
                <PaymentBadge method="cash" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={createTicket.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                {createTicket.isPending ? "Creating..." : "Confirm & Create Ticket"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function TripDetails() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: trip, isLoading: tripLoading } = useTripDetail(tripId);

  const [ticketPage, setTicketPage] = useState(1);
  const [ticketLimit, setTicketLimit] = useState(20);
  const [ticketStatus, setTicketStatus] = useState("");

  const { data: ticketsData, isLoading: ticketsLoading } = useTripTickets(tripId, {
    page: ticketPage,
    limit: ticketLimit,
    status: ticketStatus || undefined,
  });

  // ── Edit state ────────────────────────────────────────────────────────────
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState<number>(0);
  const [isExpress, setIsExpress] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [busSearch, setBusSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");

  // Sync edit fields when trip loads
  useEffect(() => {
    if (trip) {
      setDepartureTime(format(new Date(trip.departure_at), "HH:mm"));
      setTotalSeats(trip.total_seats);
      setIsExpress(trip.is_express);
      setSelectedBusId(trip.bus?.id ?? "");
      setSelectedDriverId(trip.driver?.id ?? "");
    }
  }, [trip]);

  const { data: busesData } = useFleetBusesPaginated({ q: busSearch || undefined, limit: 20 });
  const buses = busesData?.data ?? [];
  const suggestedBuses = buses.filter((b) => b.routes?.some((r: any) => r.id === trip?.route?.id));
  const otherBuses = buses.filter((b) => !b.routes?.some((r: any) => r.id === trip?.route?.id));

  const { data: drivers = [] } = useDriverSearch(driverSearch);

  // Auto-fill seats from bus
  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find((b) => b.id === selectedBusId);
      if (bus) setTotalSeats(bus.capacity ?? bus.total_seats ?? totalSeats);
    }
  }, [selectedBusId]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateTrip = useUpdateTrip(tripId ?? "");
  const cancelTrip = useCancelTrip(tripId ?? "");

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [showSaveScope, setShowSaveScope] = useState(false);
  const [showDeleteScope, setShowDeleteScope] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  // ── Local ticket list (prepend newly created) ─────────────────────────────
  const [newTickets, setNewTickets] = useState<TripTicket[]>([]);

  const isSeries = !!trip?.series && !trip.series.is_only_in_series;

  const hasChanges = trip
    ? departureTime !== format(new Date(trip.departure_at), "HH:mm") ||
      totalSeats !== trip.total_seats ||
      isExpress !== trip.is_express ||
      selectedBusId !== (trip.bus?.id ?? "") ||
      selectedDriverId !== (trip.driver?.id ?? "")
    : false;

  const handleSave = () => {
    if (isSeries) {
      setShowSaveScope(true);
    } else {
      doUpdate("this");
    }
  };

  const doUpdate = (scope: "this" | "future") => {
    updateTrip.mutate(
      {
        scope,
        departure_time: departureTime,
        total_seats: totalSeats,
        is_express: isExpress,
        bus_id: selectedBusId || null,
        driver_id: selectedDriverId || null,
      },
      {
        onSuccess: () => setShowSaveScope(false),
      }
    );
  };

  const handleDelete = () => {
    if (isSeries) {
      setShowDeleteScope(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const doDelete = (scope: "this" | "future") => {
    cancelTrip.mutate(
      { scope },
      {
        onSuccess: () => {
          setShowDeleteScope(false);
          setShowDeleteConfirm(false);
          navigate("/trips");
        },
      }
    );
  };

  // ── Occupancy bar ─────────────────────────────────────────────────────────
  const occupancyPct = trip ? Math.round((trip.booked_seats / trip.total_seats) * 100) : 0;
  const occupancyColor =
    occupancyPct >= 90
      ? "bg-red-500"
      : occupancyPct >= 70
      ? "bg-amber-500"
      : "bg-green-500";

  // ── Stops for ticket creation ─────────────────────────────────────────────
  const stops = (trip?.route?.route_stops ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((rs) => rs.stop);

  // ── Merged ticket list ────────────────────────────────────────────────────
  const allTickets: TripTicket[] = [
    ...newTickets,
    ...(ticketsData?.data ?? []),
  ];

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (tripLoading || ticketsLoading) {
    return (
      <div className="p-6 space-y-6 font-heebo">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6 text-center text-neutral-500 dark:text-neutral-400 font-heebo">
        Trip not found.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-heebo space-y-6 text-neutral-900 dark:text-white">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold truncate">{trip.route?.name ?? "Trip"}</h1>
            <StatusBadge status={trip.status} />
            {trip.is_express && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Zap className="w-3 h-3" /> Express
              </span>
            )}
            {trip.series && <SeriesPopover series={trip.series} />}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {format(new Date(trip.departure_at), "EEEE, MMMM d, yyyy · HH:mm")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: info + edit ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Trip info card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Trip Info</h2>

            {/* Bus */}
            <div className="flex items-start gap-2 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400 w-16 shrink-0">Bus</span>
              {trip.bus ? (
                <span className="font-medium">{trip.bus.plate} · {trip.bus.type}</span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <BsExclamationTriangle className="w-3.5 h-3.5" /> No bus assigned
                </span>
              )}
            </div>

            {/* Driver */}
            <div className="flex items-start gap-2 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400 w-16 shrink-0">Driver</span>
              {trip.driver ? (
                <div className="flex items-center gap-2">
                  {buildCdnUrl(trip.driver.avatar_path) ? (
                    <img
                      src={buildCdnUrl(trip.driver.avatar_path)}
                      alt={trip.driver.first_name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                      {trip.driver.first_name[0]}
                    </div>
                  )}
                  <span className="font-medium">{trip.driver.first_name} {trip.driver.last_name}</span>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <BsExclamationTriangle className="w-3.5 h-3.5" /> No driver assigned
                </span>
              )}
            </div>

            {/* Seats */}
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Seats</span>
                <span>{trip.booked_seats} / {trip.total_seats} booked · {trip.remaining_seats} left</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${occupancyColor}`}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Edit card */}
          <Can I="update" a="Trip">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 space-y-4">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Edit Trip</h2>

              <div>
                <label className={labelClass}>Departure time</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className={inputClass}
                />
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
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No bus assigned</option>
                  {suggestedBuses.length > 0 && (
                    <optgroup label="Suggested for this route">
                      {suggestedBuses.map((b) => (
                        <option key={b.id} value={b.id}>{b.plate} · {b.type} · {b.capacity ?? b.total_seats} seats</option>
                      ))}
                    </optgroup>
                  )}
                  {otherBuses.length > 0 && (
                    <optgroup label="Other buses">
                      {otherBuses.map((b) => (
                        <option key={b.id} value={b.id}>{b.plate} · {b.type} · {b.capacity ?? b.total_seats} seats</option>
                      ))}
                    </optgroup>
                  )}
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
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className={inputClass}
                >
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

              <button
                onClick={handleSave}
                disabled={!hasChanges || updateTrip.isPending}
                className="w-full px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                {updateTrip.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Can>

          {/* Delete button */}
          <Can I="delete" a="Trip">
            <button
              onClick={handleDelete}
              disabled={cancelTrip.isPending}
              className="w-full px-4 py-2.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
            >
              {cancelTrip.isPending ? "Deleting..." : "Delete Trip"}
            </button>
          </Can>
        </div>

        {/* ── Right column: tickets ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
            {/* Ticket list header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Tickets
                {ticketsData && (
                  <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    ({ticketsData.total} total)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status filter */}
                <select
                  value={ticketStatus}
                  onChange={(e) => { setTicketStatus(e.target.value); setTicketPage(1); }}
                  className="px-2 py-1.5 text-xs border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                >
                  <option value="">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Create ticket button */}
                <Can I="create" a="Ticket">
                  <div className="relative group">
                    <button
                      onClick={() => setShowCreateTicket(true)}
                      disabled={trip.remaining_seats === 0}
                      className="px-3 py-1.5 text-xs font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
                    >
                      + Create Ticket
                    </button>
                    {trip.remaining_seats === 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-neutral-900 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        No seats available
                      </div>
                    )}
                  </div>
                </Can>
              </div>
            </div>

            {/* Ticket table */}
            {allTickets.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                No tickets found for this trip.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-neutral-800">
                      {["Passenger", "Phone", "From", "To", "Seats", "Amount", "Payment", "Created by", "Status", "Booked at"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 pb-3 pr-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => navigate(`/ticketing/${ticket.id}`)}
                        className={`border-b border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
                          ticket.status === "cancelled" ? "opacity-50" : ""
                        }`}
                      >
                        <td className="py-3 pr-3 font-medium whitespace-nowrap">{ticket.passenger_name}</td>
                        <td className="py-3 pr-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{ticket.phone}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{ticket.boarding_stop.name}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{ticket.alighting_stop.name}</td>
                        <td className="py-3 pr-3 text-center">{ticket.seats_count}</td>
                        <td className="py-3 pr-3 whitespace-nowrap font-medium">{ticket.currency} {ticket.amount.toLocaleString()}</td>
                        <td className="py-3 pr-3"><PaymentBadge method={ticket.payment_method} /></td>
                        <td className="py-3 pr-3"><CreatedByBadge by={ticket.created_by} /></td>
                        <td className="py-3 pr-3"><TicketStatusBadge status={ticket.status} /></td>
                        <td className="py-3 pr-3 text-neutral-500 dark:text-neutral-400 whitespace-nowrap text-xs">
                          {format(new Date(ticket.booked_at), "MMM d, yyyy HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {ticketsData && ticketsData.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Rows per page:</span>
                  <select
                    value={ticketLimit}
                    onChange={(e) => { setTicketLimit(Number(e.target.value)); setTicketPage(1); }}
                    className="px-2 py-1 border border-gray-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:outline-none"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    {(ticketPage - 1) * ticketLimit + 1}–{Math.min(ticketPage * ticketLimit, ticketsData.total)} of {ticketsData.total}
                  </span>
                  <button
                    onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
                    disabled={ticketPage === 1}
                    className="px-2 py-1 border border-gray-200 dark:border-neutral-700 rounded hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setTicketPage((p) => p + 1)}
                    disabled={ticketPage * ticketLimit >= ticketsData.total}
                    className="px-2 py-1 border border-gray-200 dark:border-neutral-700 rounded hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Save scope dialog ── */}
      {showSaveScope && (
        <ScopeDialog
          title="Save changes"
          description="This trip is part of a series. Apply changes to:"
          isPending={updateTrip.isPending}
          onThis={() => doUpdate("this")}
          onFuture={() => doUpdate("future")}
          onCancel={() => setShowSaveScope(false)}
        />
      )}

      {/* ── Delete scope dialog ── */}
      {showDeleteScope && (
        <ScopeDialog
          title="Delete trip"
          description="This trip is part of a series. Delete:"
          isPending={cancelTrip.isPending}
          onThis={() => doDelete("this")}
          onFuture={() => doDelete("future")}
          onCancel={() => setShowDeleteScope(false)}
        />
      )}

      {/* ── Single delete confirm ── */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm z-[80] p-6">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">Delete trip</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure you want to delete this trip? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete("this")}
                disabled={cancelTrip.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
              >
                {cancelTrip.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create ticket popup ── */}
      {showCreateTicket && (
        <CreateTicketPopup
          tripId={trip.id}
          stops={stops}
          remainingSeats={trip.remaining_seats}
          onClose={() => setShowCreateTicket(false)}
          onCreated={(ticket) => setNewTickets((prev) => [ticket, ...prev])}
        />
      )}
    </div>
  );
}

export default TripDetails;

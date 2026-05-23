import { useState } from "react";
import { format } from "date-fns";
import { BsExclamationTriangle } from "react-icons/bs";
import { useCancelTrip } from "../../hooks/useFleetTrips";
import type { Trip } from "../../types/trips";

interface Props {
  trip: Trip;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: (id: string, scope: "this" | "future") => void;
}

export default function QuickInfoPopup({ trip, onClose, onEdit, onDeleted }: Props) {
  const cancelTrip = useCancelTrip(trip.id);
  const [showScopeDialog, setShowScopeDialog] = useState(false);

  const isSeries = !!trip.series_id && !trip.series?.is_only_in_series;

  const handleDeleteClick = () => {
    if (isSeries) {
      setShowScopeDialog(true);
    } else {
      cancelTrip.mutate({ scope: "this" }, {
        onSuccess: () => onDeleted(trip.id, "this"),
      });
    }
  };

  const handleScopeConfirm = (scope: "this" | "future") => {
    cancelTrip.mutate({ scope }, {
      onSuccess: () => {
        onDeleted(trip.id, scope);
        setShowScopeDialog(false);
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm z-[60]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-neutral-900 dark:text-white">
              {format(new Date(trip.departure_at), "EEE, MMM d · HH:mm")}
            </h2>
            {trip.is_express && (
              <span className="px-2 py-0.5 text-xs font-medium bg-brand/10 text-brand rounded-full">Express</span>
            )}
            {isSeries && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Series</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">Route:</span> {trip.route?.name ?? "—"}
          </div>

          <div className="text-sm flex items-center gap-2">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Bus:</span>
            {trip.bus ? (
              <span className="text-neutral-600 dark:text-neutral-400">{trip.bus.plate} · {trip.bus.type}</span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <BsExclamationTriangle className="w-3.5 h-3.5" />
                No bus assigned
              </span>
            )}
          </div>

          <div className="text-sm flex items-center gap-2">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Driver:</span>
            {trip.driver ? (
              <span className="text-neutral-600 dark:text-neutral-400">{trip.driver.first_name} {trip.driver.last_name}</span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <BsExclamationTriangle className="w-3.5 h-3.5" />
                No driver assigned
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: "Total", value: trip.total_seats },
              { label: "Booked", value: trip.booked_seats },
              { label: "Remaining", value: trip.remaining_seats },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-gray-50 dark:bg-neutral-800 rounded-lg py-2">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand/5 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={cancelTrip.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              {cancelTrip.isPending ? "..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Scope dialog */}
      {showScopeDialog && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={() => setShowScopeDialog(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm z-[80] p-6">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">Delete trip</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              This trip is part of a series. What would you like to delete?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleScopeConfirm("this")}
                disabled={cancelTrip.isPending}
                className="w-full px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Just this trip
              </button>
              <button
                onClick={() => handleScopeConfirm("future")}
                disabled={cancelTrip.isPending}
                className="w-full px-4 py-2.5 text-sm font-medium border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
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

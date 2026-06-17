import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import RouteRevenue from "../components/RouteRevenue";
import { useAnalyticsOverview, AnalyticsOverviewParams } from "../hooks/useAnalyticsOverview";
import PeakTrafficChart from "../components/PeakTrafficChart";
import { format, isValid } from "date-fns";
import { getDateRange } from "../utils/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketStop {
  id?: string;
  name: string;
}

interface ReportTicket {
  id: string;
  passenger_name?: string;
  phone?: string;
  boarding_stop?: TicketStop;
  alighting_stop?: TicketStop;
  payment_method?: string;
  status?: string;
  booked_at?: string;
  amount?: number;
  confirmed_at?: string;
  ticket_price?: number;
  // legacy shape fallbacks
  passenger?: { firstName?: string; lastName?: string };
  origin?: string;
  destination?: string;
  purchaseTime?: string;
  pricing?: { totalCharged?: number };
}

interface TicketsResponse {
  tickets?: ReportTicket[];
  data?: ReportTicket[];
  total?: number;
}

const PAGE_SIZE = 20;

// ─── Period options ────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { label: string; value: AnalyticsOverviewParams["period"] }[] = [
  { label: "Today", value: "today" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "Custom", value: "custom" },
];

// ─── Payment badge ─────────────────────────────────────────────────────────────

function PaymentBadge({ method }: { method?: string }) {
  const label = method ?? "—";
  const colorClass =
    label === "cash"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : label === "mobile_money" || label === "mtn" || label === "airtel"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colorClass}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "unknown";
  const colorClass =
    s === "confirmed" || s === "completed" || s === "paid"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : s === "pending" || s === "payment_pending" || s === "initiated"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : s === "cancelled" || s === "failed" || s === "expired"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colorClass}`}>
      {s}
    </span>
  );
}

// ─── Reports page ─────────────────────────────────────────────────────────────

function Reports() {
  const [period, setPeriod] = useState<AnalyticsOverviewParams["period"]>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [page, setPage] = useState(1);

  // Effective date range for custom period
  const isCustom = period === "custom";

  // Calculate ISO bounds for the selected period to pass to `/tickets` query
  const dateRange = (() => {
    if (isCustom) {
      return {
        from: customFrom ? `${customFrom}T00:00:00Z` : undefined,
        to: customTo ? `${customTo}T23:59:59Z` : undefined,
      };
    }
    const mapped = period === "this_week" ? "thisWeek" : period === "this_month" ? "thisMonth" : "today";
    const range = getDateRange(mapped);
    return {
      from: `${range.startDate}T00:00:00Z`,
      to: `${range.endDate}T23:59:59Z`,
    };
  })();

  // Tickets query (uses axiosInstance directly with TanStack Query)
  const ticketsQuery = useQuery<TicketsResponse, Error>({
    queryKey: ["reports-tickets", page, period, customFrom, customTo],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;
      const { data } = await axiosInstance.get<TicketsResponse>("/tickets", { params });
      return data;
    },
  });

  const rawTickets: ReportTicket[] =
    ticketsQuery.data?.tickets ??
    ticketsQuery.data?.data ??
    [];
  const total = ticketsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Analytics overview for revenue breakdown and peak times
  const analyticsParams: AnalyticsOverviewParams =
    isCustom && customFrom && customTo
      ? { period: "custom", from: customFrom, to: customTo, tz: "Africa/Kigali" }
      : { period, tz: "Africa/Kigali" };

  const { revAnalytics, peakTimes, isLoading: analyticsLoading } = useAnalyticsOverview(
    analyticsParams,
    true,
  );

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="px-6 py-6 min-h-screen dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl">Reports & Analytics</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            View ticket sales, revenue metrics, and booking patterns.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="print-hide flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-all cursor-pointer active:scale-95 shadow-md shadow-brand/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="print-hide flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center border border-gray-200 dark:border-neutral-800 rounded-xl p-1 bg-white dark:bg-neutral-900 font-medium text-xs text-brand2 gap-1 flex-wrap w-full sm:w-auto shadow-sm">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPeriod(opt.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg cursor-pointer transition-colors ${
                period === opt.value
                  ? "bg-brand text-white shadow-sm"
                  : "text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs */}
        {isCustom && (
          <div className="flex items-center gap-3 w-full sm:w-auto animate-fadeIn">
            <div className="flex flex-col gap-1 w-1/2 sm:w-auto">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>
            <span className="text-neutral-400 text-sm">to</span>
            <div className="flex flex-col gap-1 w-1/2 sm:w-auto">
              <input
                type="date"
                value={customTo}
                onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Breakdown */}
        <div className="flex flex-col">
          <h2 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-3 pl-1">
            Revenue Breakdown
          </h2>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
            </div>
          ) : (
            <RouteRevenue data={revAnalytics} />
          )}
        </div>

        {/* Peak Times */}
        <div className="flex flex-col">
          <h2 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-3 pl-1">
            Booking Demand (Peak Times)
          </h2>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
            </div>
          ) : (
            peakTimes && <PeakTrafficChart peakTimes={peakTimes} />
          )}
        </div>
      </div>

      {/* Ticket Logs */}
      <div className="mt-6">
        <h2 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-3 pl-1">
          Ticket Sale Logs
        </h2>

        <div className="bg-white dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="text-xs flex items-baseline justify-between mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {total > 0 ? (
                <>
                  Found <span className="font-bold text-neutral-900 dark:text-white">{total}</span> total tickets for this period.
                </>
              ) : (
                "No ticket logs found for the selected period."
              )}
            </p>
          </div>

          {ticketsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-neutral-400 py-12 justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent" />
              Loading tickets list…
            </div>
          ) : rawTickets.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic py-12 text-center">
              No tickets recorded.
            </p>
          ) : (
            <div className="w-full overflow-x-auto scrollbar-thin">
              <table className="text-sm w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    {["Passenger", "Phone", "Route", "Payment", "Status", "Date", "Amount"].map((h) => (
                      <th
                        key={h}
                        className="text-start text-xs pb-3 pr-3 font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawTickets.map((ticket, i) => {
                    const passengerName =
                      (ticket.passenger_name ??
                        (ticket.passenger
                          ? `${ticket.passenger.firstName ?? ""} ${ticket.passenger.lastName ?? ""}`.trim()
                          : "")) ||
                      "—";
                    const phone = ticket.phone ?? "—";

                    let route = "—";
                    if (ticket.boarding_stop?.name && ticket.alighting_stop?.name) {
                      route = `${ticket.boarding_stop.name} → ${ticket.alighting_stop.name}`;
                    } else if (ticket.origin && ticket.destination) {
                      route = `${ticket.origin} → ${ticket.destination}`;
                    }

                    const bookedAt = ticket.confirmed_at ?? ticket.booked_at ?? ticket.purchaseTime;
                    const dateStr =
                      bookedAt && isValid(new Date(bookedAt))
                        ? format(new Date(bookedAt), "dd/MM/yyyy HH:mm")
                        : bookedAt || "—";

                    const amount = ticket.ticket_price ?? ticket.amount ?? ticket.pricing?.totalCharged;

                    return (
                      <tr
                        key={ticket.id ?? i}
                        className="border-b border-gray-100 dark:border-neutral-800/60 text-neutral-600 dark:text-neutral-300 hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                      >
                        <td className="p-3 pl-0 font-medium text-neutral-900 dark:text-white">
                          {passengerName}
                        </td>
                        <td className="p-3">{phone}</td>
                        <td className="p-3">{route}</td>
                        <td className="p-3">
                          <PaymentBadge method={ticket.payment_method} />
                        </td>
                        <td className="p-3">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="p-3">{dateStr}</td>
                        <td className="p-3 pr-0 font-semibold text-neutral-950 dark:text-white">
                          {amount != null
                            ? `RWF ${amount.toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="print-hide flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;

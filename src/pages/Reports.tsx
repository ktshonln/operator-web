import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";
import RouteRevenue from "../components/RouteRevenue";
import { useAnalyticsOverview, AnalyticsOverviewParams } from "../hooks/useAnalyticsOverview";
import { format } from "date-fns";

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
      : label === "mobile_money"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "unknown";
  const colorClass =
    s === "confirmed" || s === "completed"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : s === "pending"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : s === "cancelled"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
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

  // Tickets query (uses axiosInstance directly with TanStack Query)
  const ticketsQuery = useQuery<TicketsResponse, Error>({
    queryKey: ["reports-tickets", page, period, customFrom, customTo],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (isCustom && customFrom) params.startDate = customFrom;
      if (isCustom && customTo) params.endDate = customTo;
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

  // Analytics overview for revenue breakdown
  const analyticsParams: AnalyticsOverviewParams =
    isCustom && customFrom && customTo
      ? { period: "custom", from: customFrom, to: customTo, tz: "Africa/Kigali" }
      : { period, tz: "Africa/Kigali" };

  const { revAnalytics, isLoading: analyticsLoading } = useAnalyticsOverview(
    analyticsParams,
    true,
  );

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="flex space-x-3 dark:text-white">
      <div className="ml-3 mr-10 mt-5 grow">

        {/* Period selector */}
        <div className="flex items-center border rounded-xl border-neutral-200 dark:border-neutral-800 font-medium text-xs text-brand2 p-1 mt-2 gap-1 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPeriod(opt.value); setPage(1); }}
              className={`flex-1 text-center p-1 pl-4 pr-4 rounded-lg cursor-pointer transition-colors ${
                period === opt.value ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs */}
        {isCustom && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-500 dark:text-neutral-400">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-500 dark:text-neutral-400">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>
          </div>
        )}

        {/* Ticket sale logs */}
        <div className="text-xs flex items-baseline space-x-5 mt-3">
          <h2 className="font-bold text-sm mt-5 mb-3">Ticket Sale Logs</h2>
          {total > 0 && (
            <p className="font-medium text-brand2">
              Total: <span className="font-bold text-black dark:text-white">{total}</span>
            </p>
          )}
        </div>

        <div className="w-full overflow-x-hidden">
          <button
            onClick={handleExport}
            className="bg-brand text-white text-xs p-1 rounded-md pl-5 pr-5 mb-3 flex justify-self-end cursor-pointer active:scale-95 hover:brightness-95"
          >
            Export PDF
          </button>

          {ticketsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-neutral-400 py-8 justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
              Loading tickets…
            </div>
          ) : rawTickets.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic py-6 text-center">
              No tickets found for this period.
            </p>
          ) : (
            <table className="text-sm w-full">
              <thead>
                <tr>
                  {["Passenger", "Phone", "Route", "Payment", "Status", "Date", "Amount"].map((h) => (
                    <th
                      key={h}
                      className="bg-gray-100 dark:bg-neutral-800 text-start text-xs p-1 pb-4 pr-3 pl-3 font-semibold text-neutral-600 dark:text-neutral-300"
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawTickets.map((ticket, i) => {
                  const passengerName =
                    (ticket.passenger_name ??
                      [ticket.passenger?.firstName, ticket.passenger?.lastName]
                        .filter(Boolean)
                        .join(" ")) ||
                    "—";
                  const phone = ticket.phone ?? "—";
                  const boarding = ticket.boarding_stop?.name ?? ticket.origin ?? "—";
                  const alighting = ticket.alighting_stop?.name ?? ticket.destination ?? "—";
                  const route = `${boarding} → ${alighting}`;
                  const bookedAt = ticket.booked_at ?? ticket.purchaseTime;
                  const dateStr = bookedAt
                    ? (() => {
                        try { return format(new Date(bookedAt), "dd/MM/yyyy HH:mm"); }
                        catch { return bookedAt; }
                      })()
                    : "—";
                  const amount =
                    ticket.amount ?? ticket.pricing?.totalCharged;

                  return (
                    <tr
                      key={ticket.id ?? i}
                      className="odd:bg-gray-100 dark:odd:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                    >
                      <td className="p-3">{passengerName}</td>
                      <td className="p-3">{phone}</td>
                      <td className="p-3">{route}</td>
                      <td className="p-3"><PaymentBadge method={ticket.payment_method} /></td>
                      <td className="p-3"><StatusBadge status={ticket.status} /></td>
                      <td className="p-3">{dateStr}</td>
                      <td className="p-3">
                        {amount != null
                          ? `RWF ${amount.toLocaleString()}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Revenue breakdown */}
        <h2 className="font-bold text-sm mt-5 mb-5">Revenue Breakdown Per Route</h2>
        {analyticsLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />
            Loading revenue data…
          </div>
        ) : (
          <RouteRevenue data={revAnalytics} />
        )}
      </div>
    </div>
  );
}

export default Reports;

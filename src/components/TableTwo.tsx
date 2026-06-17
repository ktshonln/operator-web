import { useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";

interface Props {
  tableData: any[];
  click?: boolean;
}

const TableTwo = ({ tableData, click }: Props) => {
  const tableHeaders = ["Ticket ID", "Passenger", "Route", "Status", "Date"];
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {tableHeaders.map((header) => (
              <th
                key={header}
                className="text-start p-3 pb-4 font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((t, i) => {
            const ticketId = t.ticketId ?? t.id ?? `tkt_${i}`;
            const passengerName =
              (t.passenger_name ??
                (t.passenger
                  ? `${t.passenger.firstName ?? ""} ${t.passenger.lastName ?? ""}`.trim()
                  : "")) ||
              "—";

            let route = "—";
            if (t.boarding_stop?.name && t.alighting_stop?.name) {
              route = `${t.boarding_stop.name} → ${t.alighting_stop.name}`;
            } else if (t.origin && t.destination) {
              route = `${t.origin} → ${t.destination}`;
            }

            const status = t.status ?? "unknown";

            const rawDate = t.confirmed_at ?? t.departureTime ?? t.purchaseTime;
            const dateStr =
              rawDate && isValid(new Date(rawDate))
                ? format(new Date(rawDate), "dd/MM/yyyy HH:mm")
                : rawDate || "—";

            return (
              <tr
                key={ticketId + i}
                onClick={() => {
                  if (click) navigate(`/ticketing/${ticketId}`);
                }}
                className={`border-b border-gray-100 dark:border-neutral-800/60 text-neutral-600 dark:text-neutral-300 hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors ${
                  click ? "cursor-pointer" : ""
                }`}
              >
                <td className="p-3 font-medium text-neutral-900 dark:text-white">
                  {ticketId}
                </td>
                <td className="p-3">{passengerName}</td>
                <td className="p-3">{route}</td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      status.toLowerCase() === "confirmed" ||
                      status.toLowerCase() === "paid" ||
                      status.toLowerCase() === "completed"
                        ? "text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                        : status.toLowerCase() === "pending" ||
                          status.toLowerCase() === "payment_pending" ||
                          status.toLowerCase() === "initiated"
                        ? "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {status}
                  </span>
                </td>
                <td className="p-3">{dateStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableTwo;

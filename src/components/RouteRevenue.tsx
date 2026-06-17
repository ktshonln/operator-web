import DonutChart from "./DonutChart";
import TableOne from "./TableOne";
import { RevenueAnalytics } from "../hooks/useRevenueAnalytics";

const defaultData: RevenueAnalytics[] = [
  { routeId: "route1", routeName: "Kigali - Huye", revenue: "100000" },
  { routeId: "route2", routeName: "Kigali - Muhanga", revenue: "100000" },
  { routeId: "route3", routeName: "Kigali - Rubavu", revenue: "100000" },
  { routeId: "route4", routeName: "Kigali - Rusizi", revenue: "100000" },
  { routeId: "route5", routeName: "Kigali - Musanze", revenue: "100000" },
];

interface Props {
  x?: boolean;
  data?: RevenueAnalytics[];
}

function RouteRevenue({ x, data }: Props) {
  const chartData = data && data.length > 0 ? data : defaultData;
  return (
    <div className="bg-white dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 h-full flex flex-col justify-between">
      {x && (
        <button className="print-hide bg-brand text-white text-xs p-1.5 rounded-lg pl-5 pr-5 mb-4 flex justify-self-end cursor-pointer active:scale-95 hover:brightness-95 transition-all">
          Export PDF
        </button>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="w-full sm:w-1/2 flex justify-center shrink-0">
          <DonutChart values={chartData} currency="RWF" />
        </div>
        <div className="w-full sm:w-1/2">
          <TableOne data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default RouteRevenue;

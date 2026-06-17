import DonutChart from "./DonutChart";
import TableOne from "./TableOne";
import { RevenueAnalytics } from "../hooks/useRevenueAnalytics";

interface Props {
  x?: boolean;
  data?: RevenueAnalytics[];
}

function RouteRevenue({ x, data }: Props) {
  const hasData = data && data.length > 0;
  return (
    <div className="bg-white dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 h-full flex flex-col justify-between">
      {x && (
        <button className="print-hide bg-brand text-white text-xs p-1.5 rounded-lg pl-5 pr-5 mb-4 flex justify-self-end cursor-pointer active:scale-95 hover:brightness-95 transition-all">
          Export PDF
        </button>
      )}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <p className="text-sm italic">No route revenue data available for this period</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="w-full xl:w-1/2 flex justify-center shrink-0">
            <DonutChart values={data} currency="RWF" />
          </div>
          <div className="w-full xl:w-1/2">
            <TableOne data={data} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteRevenue;

import DonutChart from "./DonutChart"
import TableOne from "./TableOne"
import { RevenueAnalytics } from "../hooks/useRevenueAnalytics"

const defaultData: RevenueAnalytics[] = [
  { routeId: "route1", routeName: "Kigali - Huye", revenue: '100000' },
  { routeId: "route2", routeName: "Kigali - Muhanga", revenue: '100000' },
  { routeId: "route3", routeName: "Kigali - Rubavu", revenue: '100000' },
  { routeId: "route4", routeName: "Kigali - Rusizi", revenue: '100000' },
  { routeId: "route5", routeName: "Kigali - Musanze", revenue: '100000' },
];

interface Props {
    x?: boolean;
    data?: RevenueAnalytics[];
}

function RouteRevenue({ x, data }: Props) {
    const chartData = data && data.length > 0 ? data : defaultData;
    return (
        <div>
            {x && <button className="bg-brand text-white text-xs p-1 rounded-md pl-5 pr-5 mb-3 flex justify-self-end cursor-pointer active:scale-95 hover:brightness-95">Export PDF</button>}
            <div className={`border-1 border-neutral-200 dark:border-neutral-800 rounded-xl flex  justify-between p-3 ${x?"":"max-w-2xl mx-auto"}`}>
          <DonutChart values={chartData} currency="RWF" />
          <TableOne data={chartData} />
        </div>
            
        </div>
    )
}

export default RouteRevenue

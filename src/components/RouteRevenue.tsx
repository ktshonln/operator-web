import DonutChart from "./DonutChart"
import TableOne from "./TableOne"

interface Props {
    x?:boolean
}

const data = [100000, 100000, 100000, 100000, 100000];
const data2 = [
  { route: { origin: "Kigali", destination: "Huye" }, revenue: 100000 },
  { route: { origin: "Kigali", destination: "Huye" }, revenue: 100000 },
  { route: { origin: "Kigali", destination: "Huye" }, revenue: 100000 },
  { route: { origin: "Kigali", destination: "Muhanga" }, revenue: 100000 },
  { route: { origin: "Kigali", destination: "Muhanga" }, revenue: 100000 },
  { route: { origin: "Kigali", destination: "Rubavu" }, revenue: 100000 },
  { route: { origin: "Kigali", destination: "Rubavu" }, revenue: 100000 },
];
function RouteRevenue({x}:Props) {
    return (
        <div>
            {x && <button className="bg-brand text-white text-xs p-1 rounded-md pl-5 pr-5 mb-3 flex justify-self-end cursor-pointer active:scale-95 hover:brightness-95">Export PDF</button>}
            <div className={`border-1 border-neutral-200 rounded-xl flex  justify-between p-3 ${x?"":"max-w-2xl mx-auto"}`}>
          <DonutChart values={data} currency="RWF" />
          <TableOne data={data2} />
        </div>
            
        </div>
    )
}

export default RouteRevenue

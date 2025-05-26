import { RevenueAnalytics } from "../hooks/useRevenueAnalytics";
import { formatMoney, getDonutShades } from "../utils/helpers";


interface Props {
    data: RevenueAnalytics[];
    startColor?: string;
  endColor?: string;
  darkerShade?: string;
}
const TableOne = ({data,startColor = "#2E82C8",
  endColor = "#D3D3D3",
  darkerShade = "#123450",}:Props) => {
    const shades = getDonutShades(data.length, startColor, endColor, darkerShade);
    const totalRevenue = data.reduce((sum, item) => sum + parseInt(item.revenue), 0) || 1; // prevent div by 0
  return (
        <div className=" max-h-36 overflow-y-auto">

<table className="text-xs w-full">
  <tbody>

    {data.map(({routeId,routeName, revenue},i)=>


 { 
  const percentage = ((parseInt(revenue) / totalRevenue) * 100).toFixed(1);
  return (<tr key={routeId + i}>
    <td className=" flex items-center justify-between space-x-5">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 border border-brand2 rounded-full" style={{ backgroundColor: shades[i] }}/>
        <p className="text-brand2">{routeName}</p>
      </div>
      <div className="text-right flex items-center gap-2">

      <p>
        {" "}
        Rwf <span className="font-semibold">{formatMoney(parseInt(revenue))}</span>
      </p>
      <p className="text-[10px] text-brand2">{percentage}%</p>
      </div>
    </td>
  </tr>)}
    )}

{/* <div className="absolute bottom-0 bg-gradient-to-b from-white/0 via-white/0 to-red-500 w-full h-full"/> */}
  </tbody>
</table>
</div>
  );
};

export default TableOne;

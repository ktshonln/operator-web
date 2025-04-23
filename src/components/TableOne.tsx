import { Route } from "../pages/Home";
import { formatMoney } from "../utils/helpers";

interface RouteRevenue {
    route: Route ;
    revenue: number;
}
interface Props {
    data: RouteRevenue[]
}
const TableOne = ({data}:Props) => {
  return (
        <div className=" max-h-36 overflow-y-auto">

<table className="text-xs ">
    {data.map(({route, revenue})=>


  <tr>
    <td className=" flex items-center justify-between space-x-5">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 border border-brand2 bg-brand rounded-full" />
        <p className="text-brand2">{route.origin} - {route.destination}</p>
      </div>
      <p>
        {" "}
        Rwf <span className="font-semibold">{formatMoney(revenue)}</span>
      </p>
    </td>
  </tr>
    )}

{/* <div className="absolute bottom-0 bg-gradient-to-b from-white/0 via-white/0 to-red-500 w-full h-full"/> */}
</table>
</div>
  );
};

export default TableOne;

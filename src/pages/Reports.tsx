import { useNavigate } from "react-router-dom";
import Filter from "../components/Filter";
import { camelCaseToTitle } from "../utils/helpers";
import RouteRevenue from "../components/RouteRevenue";

const tableData = [
  {
    ticketId: "678cc836ddc071f4e3ef9399",
    passengerName: "Jeanne Dowe",
    route: { origin: "Kigali", destination: "Huye" },
    date: "12/09/2025 17:23",
    operator: "Jeanne d’arc Keza",
  },
  {
    ticketId: "678cc836ddc071f4e3ef9399",
    passengerName: "Jeanne Dowe",
    route: { origin: "Kigali", destination: "Huye" },
    date: "12/09/2025 17:23",
    operator: "Jeanne d’arc Keza",
  },
  {
    ticketId: "678cc836ddc071f4e3ef9399",
    passengerName: "Jeanne Dowe",
    route: { origin: "Kigali", destination: "Huye" },
    date: "12/09/2025 17:23",
    operator: "Jeanne d’arc Keza",
  },
];

function Reports() {
  const tableHeaders = Object.keys(tableData[0]);
  const navigate = useNavigate();
  return (
    <div className="flex space-x-3">
      <div className=" ml-3 mr-10 mt-5 grow">
        <Filter onSelectFilter={()=>console.log('object')} />
        <div className="text-xs flex items-baseline space-x-5 mt-3">
          <h2 className="font-bold  text-sm mt-5 mb-3">Ticket Sale Logs</h2>
          <p className="font-medium text-brand2">
            Total: <span className="font-bold text-black">500</span>
          </p>
          <p className="font-medium text-brand2">
            Sold: <span className="font-bold text-black">400</span>
          </p>
          <p className="font-medium text-brand2">
            Unsold: <span className="font-bold text-brand">100</span>
          </p>
        </div>
        <div className="w-full overflow-x-hidden">
          <button className="bg-brand text-white text-xs p-1 rounded-md pl-5 pr-5 mb-3 flex justify-self-end cursor-pointer active:scale-95 hover:brightness-95">
            Export PDF
          </button>
          <table className="text-sm w-full">
            <tr className="gap-2">
              {tableHeaders.map(
                (
                  header // if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                ) => (
                  <th className="bg-gray-100  text-start text-xs p-1 pb-4 pr-3 pl-3">
                    {camelCaseToTitle(header).toLocaleUpperCase()}
                  </th>
                )
              )}
            </tr>
            {tableData.map(
              ({ ticketId, passengerName, route, date, operator }, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    navigate(`/ticketing/${ticketId}`);
                  }}
                  className={`odd:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
                >
                  <td className="p-3">{ticketId}</td>
                  <td className="p-3">{passengerName}</td>
                  <td className="p-3">
                    {route.origin + "->" + route.destination}
                  </td>
                  <td className="p-3">{date}</td>
                  <td className="p-3">{operator}</td>
                </tr>
              )
            )}
          </table>
        </div>
        <h2 className="font-bold  text-sm mt-5 mb-5">
          Revenue Breakdown Per Route
        </h2>
        <RouteRevenue x />
      </div>
    </div>
  );
}

export default Reports;

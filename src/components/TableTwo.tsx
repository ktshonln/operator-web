import { useNavigate } from "react-router-dom";
import { Route } from "../pages/Home";
import { camelCaseToTitle, toTitleCase } from "../utils/helpers";

/* interface TableProps<T> {
  data: T[];
  keyExtractor?:(item: T, index: number)=>string | number;
} */

interface TicketState {
  ticketId: string;
  passengerName: string;
  route: Route;
  paymentStatus: string;
  date: string;
}
interface Props {
  tableData: TicketState[];
  click?: boolean
}

const TableTwo = ({ tableData, click }: Props) => {
  // Get keys from the first object
  const tableHeaders = Object.keys(tableData[0]);
  console.log(tableHeaders);
  const navigate = useNavigate()

  return (
    <div className=" max-h-36 w-full overflow-x-hidden">
      <table className="text-xs gap-x-2 w-full">
        <tr className="gap-2">
          {tableHeaders.map((header) => (// if some unnecessary headers are present, we can filter them out, e.g: with [includes]
            <th className="bg-gray-100 text-[10px]  text-start p-1 pb-4 pr-3 pl-3">
              {camelCaseToTitle(header).toLocaleUpperCase()}
            </th>
          ))}
        </tr>
        {tableData.map(
          ({ ticketId, passengerName, route, paymentStatus, date }) => (
            <tr onClick={()=>{click && navigate(`/ticketing/${ticketId}`)}} className={`odd:bg-gray-100 text-neutral-600 hover:bg-gray-200 ${click && 'cursor-pointer'}`}>
              <td className="p-3">{ticketId}</td>
              <td className="p-3">{passengerName}</td>
              <td className="p-3">
                {route.origin} - {route.destination}
              </td>
              <td
                className={`p-3 text-center 
                }`}
              >
                <span className={`p-1 pl-6 pr-6 rounded-full text-[10px] text-center ${
                  paymentStatus === "received"
                    ? "text-green-500 bg-[#23F43C]/15"
                    : "text-brand bg-brand/15"
                }`}>

                {toTitleCase(paymentStatus)}
                </span>
              </td>
              <td className="p-3">{date}</td>
            </tr>
          )
        )}
      </table>
    </div>
  );
};

export default TableTwo;

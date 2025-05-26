import { useNavigate } from "react-router-dom";
import { camelCaseToTitle, toTitleCase } from "../utils/helpers";
import { Ticket } from "../hooks/useTicket";
import { format, isValid } from "date-fns";

/* interface TableProps<T> {
  data: T[];
  keyExtractor?:(item: T, index: number)=>string | number;
} */


interface Props {
  tableData: Ticket[];
  click?: boolean
}

const TableTwo = ({ tableData, click }: Props) => {
  // Get keys from the first object
  const tableHeaders = ['ticketId', 'passengerName', 'route', 'paymentStatus', 'date']
  console.log(tableHeaders);
  const navigate = useNavigate()

  return (
    <div className=" max-h-36 w-full overflow-x-hidden">
      <table className="text-xs gap-x-2 w-full">
        <tr className="gap-2">
          {tableHeaders.map((header) => (// if some unnecessary headers are present, we can filter them out, e.g: with [includes]
            <th className="bg-gray-100 dark:bg-neutral-900 text-[10px]  text-start p-1 pb-4 pr-3 pl-3">
              {camelCaseToTitle(header).toLocaleUpperCase()}
            </th>
          ))}
        </tr>
        {tableData.map(
          ({ ticketId, passenger, origin, destination, status, departureTime }) => (
            <tr onClick={()=>{click && navigate(`/ticketing/${ticketId}`)}} className={`odd:bg-gray-100 dark:odd:bg-neutral-900 text-neutral-600 hover:bg-gray-200 dark:hover:bg-neutral-800 ${click && 'cursor-pointer'}`}>
              <td className="p-3">{ticketId}</td>
              <td className="p-3">{passenger.firstName + " " + passenger.lastName}</td>
              <td className="p-3">
                {origin} - {destination}
              </td>
              <td
                className={`p-3 
                }`}
              >
                <span className={`p-1 pl-6 pr-6 rounded-full text-[10px] text-center ${
                  camelCaseToTitle(status,true) === "paid"
                    ? "text-green-500 bg-[#23F43C]/15"
                    : "text-brand bg-brand/15"
                }`}>

                {toTitleCase(status)}
                </span>
              </td>
              <td className="p-3">{isValid(new Date(departureTime)) ? format(new Date(departureTime), "PPpp"): 'Invalid date'}</td>
            </tr>
          )
        )}
      </table>
    </div>
  );
};

export default TableTwo;

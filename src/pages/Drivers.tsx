import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { camelCaseToTitle } from "../utils/helpers";

const tableData = [
  {
    driverId: "123413i2i",
    name: "Gasana Innocent",
    lisenceNumber: "1111AAABB",
    phoneNumber: "073123456",
    status: "active",
  },
  {
    driverId: "123413i2i",
    name: "Gasana Innocent",
    lisenceNumber: "1111AAABB",
    phoneNumber: "073123456",
    status: "active",
  },
  {
    driverId: "123413i2i",
    name: "Gasana Innocent",
    lisenceNumber: "1111AAABB",
    phoneNumber: "073123456",
    status: "inactive",
  },
];

function Drivers() {
  const tableHeaders = Object.keys(tableData[0]);
  console.log(tableHeaders);
  const navigate = useNavigate();
  return (
    <div className="mt-5 m-5 ml-3">
      <div className="flex items-center space-x-3 p-3 border-1 border-neutral-200 rounded-xl text-sm max-w-2xl">
        <AiOutlineSearch size={20} />
        <form action="">
          <input
            type="text"
            placeholder="Enter  destination..."
            className="placeholder:text-brand2 outline-none"
          />
        </form>
      </div>
      <div className="mt-7">
        <p className="text-brand justify-self-end text-sm cursor-pointer">
          +Add Driver
        </p>
      </div>
      <div className="w-full mt-7 overflow-x-hidden">
        <table className="text-sm gap-x-2 w-full">
          <tr className="gap-2">
            <th className="bg-gray-100   text-start p-1 pb-4 pr-3 pl-3">#</th>
            {tableHeaders
              .filter((h) => h !== "driverId")
              .map(
                (
                  header // if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                ) => (
                  <th className="bg-gray-100   text-start p-1 pb-4 pr-3 pl-3">
                    {camelCaseToTitle(header).toLocaleUpperCase()}
                  </th>
                )
              )}
          </tr>
          {tableData.map(
            ({ driverId, name, lisenceNumber, phoneNumber, status }, i) => (
              <tr
                key={i}
                onClick={() => {
                  navigate(`/fleets/drivers/${driverId}`);
                }}
                className={`odd:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{name}</td>
                <td className="p-3">{lisenceNumber}</td>
                <td className="p-3">{phoneNumber}</td>
                <td className="p-3">{status}</td>
              </tr>
            )
          )}
        </table>
      </div>
    </div>
  );
}

export default Drivers;

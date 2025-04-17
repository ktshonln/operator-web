import { BiSolidUserCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import WidgetLayout from "../layouts/WidgetLayout";
import { camelCaseToTitle } from "../utils/helpers";

const tableData = [
  { route: "Nyamagabe->Nyamasheke", departureTime: "12/09/2025 17:23" },
  { route: "Nyamagabe->Nyamasheke", departureTime: "12/09/2025 17:23" },
];

function DriverDetails() {
  const tableHeaders = Object.keys(tableData[0]);
  const navigate = useNavigate();
  return (
    <div className="flex  space-x-3">
      <div className=" ml-3 mr-10 mt-5 grow ">
        <div className="flex items-center space-x-2  ml-5">
          <div className="p-2.5 rounded-md bg-neutral-200 text-brand2">
            <BiSolidUserCircle size={41} />
          </div>
          <div className="text-sm">
            <p className="font-bold text-lg">Gasana Innocent</p>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center space-x-3">
          <button
            type="submit"
            className="bg-brand p-1.5 w-20 text-white mt-10 rounded-sm cursor-pointer"
          >
            Edit
          </button>
          <button className="bg-[#FF6666] text-white p-1.5 w-20 mt-10 rounded-sm cursor-pointer">
            Delete
          </button>
        </div>
        <h2 className="font-bold  text-sm mt-5 mb-5">Vehicle Details</h2>
        <div className="text-sm">
          <p className="text-neutral-400 font-semibold flex justify-between">
            Name: <span className="text-black font-normal">Gasana Innocent</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Phone Number: <span className="text-black font-normal">073123456</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
          License Number:{" "}
            <span className="text-black font-normal">1111AAABB</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Bus:{" "}
            <span className="text-black font-normal">RAC 229 A</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Status: <span className="text-black font-normal">Active</span>
          </p>
        </div>
      </div>
      <WidgetLayout>
        <div>
          <h2 className="font-bold  text-sm mt-5 mb-5 w-fit mx-auto">Scheduled trips</h2>
          <div className="w-full mt-7 overflow-x-hidden">
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
              {tableData.map(({ route, departureTime }, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    navigate(`/fleets/buses/`);
                  }}
                  className={`odd:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
                >
                  <td className="p-3">{route}</td>
                  <td className="p-3">{departureTime}</td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </WidgetLayout>
    </div>
  );
}

export default DriverDetails;

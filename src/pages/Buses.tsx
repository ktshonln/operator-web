import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddBus from "../components/AddBus";
import Search from "../components/Search";
import useBuses, { BusQuery } from "../hooks/useBuses";
import useDrivers from "../hooks/useDrivers";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";

function Buses() {
  const [addBus, setAddBus] = useState(false);
  const [busQuery, setBusQuery] = useState<BusQuery>({} as BusQuery);
  const { user } = useUser();
  const orgId = user && "org_id" in user ? (user.org_id ?? "") : "";
  const { data: buses } = useBuses(orgId, {} as BusQuery);
  const tableHeaders = [
    "busId",
    "busType",
    "plateNumber",
    "seatCapacity",
    "driver",
    "status",
  ];
  const navigate = useNavigate();
  const { data: drivers } = useDrivers(orgId, {} as BusQuery);

  return (
    <div className="mt-5 m-5 ml-3">
      <Search
        label="Search buses..."
        onSearch={(searchText) =>
          setBusQuery({ ...busQuery, searchText: searchText })
        }
      />
      <div className="mt-7">
        <p
          onClick={() => setAddBus(true)}
          className="text-brand justify-self-end text-sm cursor-pointer"
        >
          +Add Bus
        </p>
      </div>
      <div className="w-full mt-7 overflow-x-hidden">
        <table className="text-sm gap-x-2 w-full">
          <thead>
            <tr className="gap-2">
              <th className="bg-gray-100   text-start p-1 pb-4 pr-3 pl-3">#</th>
              {tableHeaders
                .filter((h) => h !== "busId")
                .map(
                  (
                    header, // if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                  ) => (
                    <th className="bg-gray-100   text-start p-1 pb-4 pr-3 pl-3">
                      {camelCaseToTitle(header).toLocaleUpperCase()}
                    </th>
                  ),
                )}
            </tr>
          </thead>
          <tbody>
            {buses?.pages
              .flat()
              ?.map(
                (
                  {
                    busId,
                    brand,
                    plateNumber,
                    assignedDriverId,
                    seatingCapacity,
                    status,
                  },
                  i,
                ) => {
                  const driver = drivers?.pages
                    .flat()
                    ?.find((driver) => driver.driverId === assignedDriverId);
                  return (
                    <tr
                      key={busId + i}
                      onClick={() => {
                        navigate(`/fleets/buses/${busId}`);
                      }}
                      className={`even:bg-gray-100 text-neutral-500 hover:bg-gray-200 cursor-pointer`}
                    >
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">{brand}</td>
                      <td className="p-3">{plateNumber}</td>
                      <td className="p-3">{seatingCapacity}</td>
                      <td className="p-3">
                        {driver?.firstName} {driver?.lastName}
                      </td>
                      <td className="p-3">{status}</td>
                    </tr>
                  );
                },
              )}
          </tbody>
        </table>
      </div>
      {addBus && (
        <AddBus companyId={orgId} effectTwo={() => setAddBus(false)} />
      )}
    </div>
  );
}

export default Buses;

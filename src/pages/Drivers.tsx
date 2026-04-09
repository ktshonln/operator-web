import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { camelCaseToTitle } from "../utils/helpers";
import { useState } from "react";
import useDrivers, { DriverQuery } from "../hooks/useDrivers";
import useUser from "../hooks/useUser";
import Search from "../components/Search";
import AddDriver from "../components/AddDriver";

function Drivers() {
  const [addDriver, setAddDriver] = useState(false);
  const [driverQuery, setDriverQuery] = useState<DriverQuery>(
    {} as DriverQuery
  );
  const { user } = useUser();
  const companyId = user?.companyId ?? '';
  const { data: drivers } = useDrivers(companyId, {} as DriverQuery);
  const tableHeaders = [
    "driverId",
    "name",
    "lisenceNumber",
    "phoneNumber",
    "status",
  ];

  const navigate = useNavigate();
  return (
    <div className="mt-5 m-5 ml-3">
      <Search
        label="Search drivers..."
        onSearch={(searchText) =>
          setDriverQuery({ ...driverQuery, searchText: searchText })
        }
      />
      <div className="mt-7">
        <p
          onClick={() => setAddDriver(true)}
          className="text-brand justify-self-end text-sm cursor-pointer"
        >
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
          {drivers?.map(
            (
              {
                driverId,
                firstName,
                lastName,
                licenseNumber,
                phoneNumber: contactPhone,
                status,
              },
              i
            ) => (
              <tr
                key={i}
                onClick={() => {
                  navigate(`/fleets/drivers/${driverId}`);
                }}
                className={`odd:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">
                  {firstName} {lastName}
                </td>
                <td className="p-3">{licenseNumber}</td>
                <td className="p-3">{contactPhone}</td>
                <td className="p-3">{status}</td>
              </tr>
            )
          )}
        </table>
      </div>
      {addDriver && (
        <AddDriver
          companyId={companyId}
          effectTwo={() => setAddDriver(false)}
        />
      )}
    </div>
  );
}

export default Drivers;

import { BiCalendarAlt, BiCheck, BiChevronDown, BiTime } from "react-icons/bi";
import DropDown from "../components/DropDown";
import WidgetLayout from "../components/layouts/WidgetLayout";

import { useEffect, useState } from "react";
import { camelCaseToTitle, formatMoney } from "../utils/helpers";
import { RiFlashlightLine } from "react-icons/ri";
import { format } from "date-fns";
import useTrips, { TripQuery } from "../hooks/useTrips";
import CustomDatePicker from "../components/CustomDatePicker";
import Filter from "../components/Filter";
import { useNavigate } from "react-router-dom";
import CreateTrip from "../components/CreateTrip";
import DestinationManager from "../components/DestinationManager";
import useUser from "../hooks/useUser";
import useCompany from "../hooks/useCompany";

function Trips() {
  const {user} = useUser()
  const [active, setActive] = useState(true);
    const [createTrip, setCreateTrip] = useState(false);
    const [tripQuery, setTripQuery] = useState<TripQuery>({} as TripQuery);
    const { data: trips, isLoading: tripsLoad } = useTrips({
  
    } as TripQuery);
    const tableHeaders = ["tripId", "route", 'date'];
    const navigate = useNavigate();
    const { data: company } = useCompany(user.companyId);
     useEffect(() => {
                   if (user.role !== "admin")
                     setTripQuery({ ...tripQuery, branch: user.branch }); // Only show the relevant branch for an agent
                 }, [user]);
  return (
    <div className="flex  space-x-3 pb-10 mr-5 dark:text-white">
      <div className=" ml-3 mt-5 grow ">
      <Filter userRole={user.role} branches={company?.branches} onSelectFilter={(filter)=>{
        setTripQuery({
          ...tripQuery,
          startTime: filter.startDate,
          endTime: filter.endDate,
              branch: filter.branch?.name,
        })
      }}/>
         <button onClick={() => setCreateTrip(true)} className=" cursor-pointer mt-3 text-sm text-brand">
                  + Create trip
                </button>
      <h2 className="font-bold mt-5 mb-5 w-fit mx-auto">
            Trips
          </h2>
                    <div className="w-full mt-7 overflow-x-hidden">
              { trips?.length!==0 ?        <table className="text-sm w-full">
                        <thead>
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
                        </thead>
                        <tbody>
                          {trips?.map(({tripId, route, departureDateAndTime }, i) => (
                            <tr
                              key={i}
                              onClick={() => {
                                navigate(`/trips/${tripId}`);
                              }}
                              className={`even:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
                            >

                              <td className="p-3">{tripId}</td>
                              <td className="p-3">
                                {route.start} {`->`} {route.end}
                              </td>
                              <td className="p-3">{departureDateAndTime && format(departureDateAndTime, "PPpp")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>: <p>No trips yet.</p>}
                    </div>
              {tripsLoad && <p>Trips Loading...</p>}

      </div>
  {
    user.role === 'admin' &&

      <WidgetLayout>
   <DestinationManager companyId={user.companyId}/>
      </WidgetLayout>
  }
            {createTrip && <CreateTrip effectTwo={() => setCreateTrip(false)} />}
    </div>
  );
}

export default Trips;

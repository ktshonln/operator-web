import { format } from "date-fns";
import { useState } from "react";
import { RiBusFill } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import EditBus from "../components/EditBus";
import WidgetLayout from "../components/layouts/WidgetLayout";
import Modal from "../components/Modal";
import useDeleteBus from "../hooks/useDeleteBus";
import useDriver from "../hooks/useDriver";
import useTrips, { TripQuery } from "../hooks/useTrips";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import useTrip from "../hooks/useTrip";
import { BiTrip } from "react-icons/bi";
import useBus from "../hooks/useBus";
import EditTrip from "./EditTrip";

function TripDetails() {
  const [editTrip, setEditTrip] = useState(false);
  const [deleteTrip, setDeleteTrip] = useState(false);
  const { user } = useUser();
  const companyId = user.companyId;
  const { tripId } = useParams<string>();
  if (!tripId) return <p>No routeId found</p>;
  const { data: trip } = useTrip(tripId);
  const {data: bus} = useBus(companyId,trip?.busId??'')
  const {data: driver} = useDriver(companyId,bus?.assignedDriverId??'')

  const { data: trips, isLoading: tripsLoad } = useTrips({
    busId: tripId,
  } as TripQuery);

  const tableHeaders = ["route", "departureTime"];
  const navigate = useNavigate();
  const deleteT = useDeleteBus(companyId, trip?.busId ?? "");
  return (
    <div className="flex  space-x-3">
      <div className=" ml-3 mr-10 mt-5 grow">
        <div className="flex items-center space-x-2  ml-5">
          <div className="p-2 rounded-md bg-neutral-200 text-brand2">
            <BiTrip size={35} />
          </div>
          <div className="text-sm">
            <p className="font-bold text-lg">
              {trip?.route.start + "->" + trip?.route.end}
            </p>
           
          </div>
        </div>
        <div className="text-sm font-medium flex items-center space-x-3">
          <button
            onClick={() => setEditTrip(true)}
            className="bg-brand p-1.5 w-20 text-white mt-10 rounded-sm cursor-pointer active:scale-95 hover:brightness-95"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteTrip(true)}
            className="bg-[#FF6666] text-white p-1.5 w-20 mt-10 rounded-sm cursor-pointer active:scale-95 hover:brightness-95"
          >
            Delete
          </button>
        </div>
        <h2 className="font-bold  text-sm mt-5 mb-5">Trip Details</h2>
        <div className="text-sm space-y-2">
          <p className="text-neutral-400 font-semibold flex justify-between">
            Origin:{" "}
            <span className="text-black font-normal">
              {trip?.route.start}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Destination: <span className="text-black font-normal">{trip?.route.end}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Express: <span className="text-black font-normal">{trip?.express}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Intermediate stops:{" "}
            <span className="text-black font-normal">{trip?.intermediateStops? trip.intermediateStops.map(stop=>`${stop},`) :'None'}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Bus:{" "}
            <span className="text-black font-normal">
              {bus?.plateNumber}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Driver: <span className="text-black font-normal">{driver?.firstName} {driver?.lastName}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Departure time: <span className="text-black font-normal">{trip?.departureTime}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Departure date: <span className="text-black font-normal">{trip?.departureDateAndTime}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Auto-scheduling: <span className="text-black font-normal">{trip?.autoScheduling?'Enabled': 'Not enabled'}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Schedule: <span className="text-black font-normal">{trip?.scheduleBlock}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Day range: <span className="text-black font-normal">{trip?.dayRange?.from + '-' + trip?.dayRange?.to}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Set minutes: <span className="text-black font-normal">{trip?.minuteInterval}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Time range: <span className="text-black font-normal">{trip?.timeRange?.from + '-' + trip?.timeRange?.to}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Status:{" "}
            <span className="text-black font-normal">{trip?.status}</span>
          </p>
        </div>
      </div>
      <WidgetLayout>
        <div>
          <h2 className="font-bold  text-sm mt-5 mb-5 w-fit mx-auto">
            Auto-schedules
          </h2>
          <div className="w-full mt-7 overflow-x-hidden">
            <table className="text-sm w-full">
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
                {trips?.map(({ route, departureDateAndTime }, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      navigate(`/fleets/buses/`);
                    }}
                    className={`even:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
                  >
                    <td className="p-3">
                      {route.start} {`->`} {route.end}
                    </td>
                    <td className="p-3">{format(departureDateAndTime, "PPpp")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tripsLoad && <p>Trips Loading...</p>}

          <h2 className="font-bold  text-sm mt-35 mb-5 w-fit mx-auto">
            Tickets sold
          </h2>
        </div>
      </WidgetLayout>
      {editTrip && trip && (
        <EditTrip
          companyId={companyId}
          trip={trip}
          effectTwo={() => setEditTrip(false)}
        />
      )}
      {deleteTrip && trip && (
        <Modal
          form
          title="Are you sure you want to delete this trip?"
          message
          actionOne="Confirm"
          actionTwo="Cancel"
          effectOne={() => deleteT.mutate()}
          effectTwo={() => setDeleteTrip(false)}
        />
      )}
    </div>
  );
}

export default TripDetails;

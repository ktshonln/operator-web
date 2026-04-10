import { BiSolidUserCircle } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import WidgetLayout from "../components/layouts/WidgetLayout";
import { camelCaseToTitle } from "../utils/helpers";
import { useState } from "react";
import useUser from "../hooks/useUser";
import useDriver from "../hooks/useDriver";
import useBus from "../hooks/useBus";
import useTrips, { TripQuery } from "../hooks/useTrips";
import { format } from "date-fns";
import Modal from "../components/Modal";
import EditDriver from "../components/EditDriver";
import useDeleteDriver from "../hooks/useDeleteDriver";

function DriverDetails() {
  const [editDriver, setEditDriver] = useState(false);
  const [deleteDriver, setDeleteDriver] = useState(false);
  const { user } = useUser();
  const orgId = user?.org_id ?? "";
  const { driverId } = useParams<string>();
  if (!driverId) return <p>No driverId found</p>;
  const { data: driver } = useDriver(orgId, driverId);
  const { data: bus } = useBus(orgId, driver?.assignedBusId ?? "");
  const { data: trips, isLoading: tripsLoad } = useTrips({
    driverId: driverId,
  } as TripQuery);
  const tableHeaders = ["route", "departureTime"];
  const navigate = useNavigate();
  const deleteD = useDeleteDriver(orgId, driver?.driverId ?? "");

  return (
    <div className="flex  space-x-3">
      <div className=" ml-3 mr-10 mt-5 grow ">
        <div className="flex items-center space-x-2  ml-5">
          <div className="p-2.5 rounded-md bg-neutral-200 text-brand2">
            <BiSolidUserCircle size={41} />
          </div>
          <div className="text-sm">
            <p className="font-bold text-lg">
              {driver?.firstName} {driver?.lastName}
            </p>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center space-x-3">
          <button
            onClick={() => setEditDriver(true)}
            className="bg-brand p-1.5 w-20 text-white mt-10 rounded-sm cursor-pointer active:scale-95 hover:brightness-95"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteDriver(true)}
            className="bg-[#FF6666] text-white p-1.5 w-20 mt-10 rounded-sm cursor-pointer active:scale-95 hover:brightness-95"
          >
            Delete
          </button>
        </div>
        <h2 className="font-bold  text-sm mt-5 mb-5">Driver Details</h2>
        <div className="text-sm space-y-2">
          <p className="text-neutral-400 font-semibold flex justify-between">
            Name:{" "}
            <span className="text-black font-normal">
              {driver?.firstName} {driver?.lastName}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Phone Number:{" "}
            <span className="text-black font-normal">
              {driver?.phoneNumber}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            License Number:{" "}
            <span className="text-black font-normal">
              {driver?.licenseNumber}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Bus:{" "}
            <span className="text-black font-normal">
              {bus?.plateNumber}
              {!bus && (
                <span className="italic font-extralight">No bus assigned</span>
              )}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Status:{" "}
            <span className="text-black font-normal">{driver?.status}</span>
          </p>
        </div>
      </div>
      <WidgetLayout>
        <div>
          <h2 className="font-bold  text-sm mt-5 mb-5 w-fit mx-auto">
            Scheduled trips
          </h2>
          {tripsLoad && <p>Trips Loading...</p>}
          <div className="w-full mt-7 overflow-x-hidden">
            <table className="text-sm w-full">
              <thead>
                <tr className="gap-2">
                  {tableHeaders.map(
                    (
                      header, // if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                    ) => (
                      <th className="bg-gray-100  text-start text-xs p-1 pb-4 pr-3 pl-3">
                        {camelCaseToTitle(header).toLocaleUpperCase()}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {trips?.map(({ tripId, route, departureDateAndTime }, i) => (
                  <tr
                    key={tripId + i}
                    onClick={() => {
                      navigate(`/trips/${tripId}`);
                    }}
                    className={`even:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
                  >
                    <td className="p-3">
                      {route.start} {`->`} {route.end}
                    </td>
                    <td className="p-3">
                      {format(departureDateAndTime, "PPpp")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </WidgetLayout>
      {editDriver && driver && (
        <EditDriver
          companyId={orgId}
          driver={driver}
          effectTwo={() => setEditDriver(false)}
        />
      )}
      {deleteDriver && driver && (
        <Modal
          form
          title="Are you sure you want to delete this driver?"
          message
          actionOne="Confirm"
          actionTwo="Cancel"
          effectOne={() => deleteD.mutate()}
          effectTwo={() => setDeleteDriver(false)}
        />
      )}
    </div>
  );
}

export default DriverDetails;

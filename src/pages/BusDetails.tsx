import { RiBusFill } from "react-icons/ri";
import WidgetLayout from "../components/layouts/WidgetLayout";
import { useNavigate, useParams } from "react-router-dom";
import { camelCaseToTitle } from "../utils/helpers";
import useBus from "../hooks/useBus";
import useUser from "../hooks/useUser";
import useDriver from "../hooks/useDriver";
import useTrips, { TripQuery } from "../hooks/useTrips";
import { format } from "date-fns";
import { useState } from "react";
import EditBus from "../components/EditBus";
import Modal from "../components/Modal";
import useDeleteBus from "../hooks/useDeleteBus";
import { BusQuery } from "../hooks/useBuses";
import useDrivers from "../hooks/useDrivers";

function BusDetails() {
  const [editBus, setEditBus] = useState(false);
  const [deleteBus, setDeleteBus] = useState(false);
  const { user } = useUser();
  const companyId = user.companyId;
  const { busId } = useParams<string>();
  if (!busId) return <p>No busId found</p>;
  const { data: bus } = useBus(companyId, busId);
  const { data: driver } = useDriver(companyId, bus?.assignedDriverId ?? "");
  const { data: drivers } = useDrivers(companyId, {} as BusQuery);
  const currentDriver = drivers?.filter(
    (driver) => driver.driverId === bus?.assignedDriverId
  )[0];
  const { data: trips, isLoading: tripsLoad } = useTrips({
    busId: busId,
  } as TripQuery);
  const tableHeaders = ["route", "departureTime"];
  const navigate = useNavigate();
  const deleteB = useDeleteBus(companyId, bus?.busId??'');
  return (
    <div className="flex  space-x-3">
      <div className=" ml-3 mr-10 mt-5 grow">
        <div className="flex items-center space-x-2  ml-5">
          <div className="p-5 rounded-md bg-neutral-200 text-brand2">
            <RiBusFill size={24} />
          </div>
          <div className="text-sm">
            <p className="font-bold text-lg">
              {bus?.year} {bus?.brand}
            </p>
            <p className="text-xs">
              {bus?.model} • {bus?.vin}
            </p>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center space-x-3">
          <button
            onClick={() => setEditBus(true)}
            className="bg-brand p-1.5 w-20 text-white mt-10 rounded-sm cursor-pointer active:scale-95 hover:brightness-95"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteBus(true)}
            className="bg-[#FF6666] text-white p-1.5 w-20 mt-10 rounded-sm cursor-pointer active:scale-95 hover:brightness-95"
          >
            Delete
          </button>
        </div>
        <h2 className="font-bold  text-sm mt-5 mb-5">Vehicle Details</h2>
        <div className="text-sm space-y-2">
          <p className="text-neutral-400 font-semibold flex justify-between">
            Name:{" "}
            <span className="text-black font-normal">
              {bus?.year} {bus?.brand}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Model: <span className="text-black font-normal">{bus?.model}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Plate Number:{" "}
            <span className="text-black font-normal">{bus?.plateNumber}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Driver:{" "}
            <span className="text-black font-normal">
              {currentDriver?.firstName} {currentDriver?.lastName}
            </span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            VIN: <span className="text-black font-normal">{bus?.vin}</span>
          </p>
          <p className="text-neutral-400 font-semibold flex justify-between">
            Status:{" "}
            <span className="text-black font-normal">{bus?.status}</span>
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

              {trips?.map(({ route, departureTime }, i) => (
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
                  <td className="p-3">{format(departureTime, "PPpp")}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <h2 className="font-bold  text-sm mt-35 mb-5 w-fit mx-auto">
            Bus maintenance records
          </h2>
        </div>
      </WidgetLayout>
      {editBus && bus && (
        <EditBus
          companyId={companyId}
          bus={bus}
          effectTwo={() => setEditBus(false)}
        />
      )}
      {deleteBus && bus && (
        <Modal
          form
          title="Are you sure you want to delete this bus?"
          message
          actionOne="Confirm"
          actionTwo="Cancel"
          effectOne={() => deleteB.mutate()}
          effectTwo={() => setDeleteBus(false)}
        />
      )}
    </div>
  );
}

export default BusDetails;

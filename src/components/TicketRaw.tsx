import { CgList } from "react-icons/cg";
import { RiBusFill, RiFlashlightLine } from "react-icons/ri";
import { Trip } from "../hooks/useTrips";
import { format } from "date-fns";
import { camelCaseToTitle, formatMoney } from "../utils/helpers";
import useBus from "../hooks/useBus";
import useManifest, { Manifest } from "../hooks/useManifest";

interface Props {
  onClick: (ticketId: string) => void;
  viewList: (manifest: Manifest) => void;
  trip?: Trip;
  companyId: string;
  searchText: string;
}
const TicketRaw = ({
  onClick,
  viewList,
  trip,
  companyId,
  searchText,
}: Props) => {
  const { data: bus } = useBus(companyId, trip?.busId ?? "");
  const { data: manifest } = useManifest(companyId, trip?.tripId ?? "");
  console.log("BUS", bus);
  return (
    <div className="flex items-center justify-between drop-shadow-lg bg-white border border-neutral-200 p-3 pl-5 pr-5 mt-4 rounded-xl hover:bg-gray-100 hover:-translate-y-1">
      <div
        onClick={() => trip?.status !== "booked" && onClick(trip?.tripId??'')}
        className={`grow ${
          trip?.status === "booked" ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <p className="font-bold text-lg flex items-center">
          {trip?.route.start}{" "}
          {trip?.intermediateStops.some(
            (stop) =>
              stop.toLocaleLowerCase() === searchText?.toLocaleLowerCase()
          ) && (
            <span className="text-[#FF8C00]">
              <span className="text-black">-</span>{" "}
              [{camelCaseToTitle(searchText)}]{" "}
            </span>
          )}
          - {trip?.route.end}
          {trip?.express && <RiFlashlightLine title="Express trip" className="text-brand"/>}
        </p>
        <p className="text-neutral-500">
          Departure:{" "}
          <span className="font-light text-black">
            {format(trip?.departureTime ?? 0, "d/M/yyyy HH'H'00")}
          </span>
        </p>
        <p className="text-neutral-500">
          Arrival:{" "}
          <span className="font-light text-black">
            {format(trip?.arrivalTime ?? 0, "d/M/yyyy HH'H'00")}
          </span>
        </p>
      </div>
      <div className="border-l border-neutral-200 pl-3">
        <div className="flex items-center space-x-2 text-xs mb-3">
          <button className="text-brand flex items-center space-x-1">
            <CgList size={18} />
            {manifest && (
              <p onClick={() => viewList(manifest)} className="cursor-pointer">
                View Passenger List
              </p>
            )}
          </button>

          <div className="border rounded-full border-neutral-500 font-medium p-1 pt-0.5 pb-0.5 flex justify-center align-middle text-center items-center">
            {manifest && <p>{manifest.manifest.length}</p>}
          </div>
          {trip?.status === "booked" && (
            <div className="bg-brand text-white rounded-full p-1 pl-3 pr-3 font-semibold">
              <p>Sold out</p>
            </div>
          )}
        </div>
        <p className="text-neutral-500">
          Price:{" "}
          <span className="font-medium text-lg text-black">
            {formatMoney(parseInt(trip?.price ?? ""))} RWF
          </span>
        </p>
        <div className="flex items-center space-x-1 text-sm">
          <RiBusFill size={20} />
          <p className="font-semibold">
            {bus?.plateNumber}, {bus?.brand} {bus?.model}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketRaw;

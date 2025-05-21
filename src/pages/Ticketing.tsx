import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineHistory } from "react-icons/ai";
import { BiCalendarAlt } from "react-icons/bi";
import { Link } from "react-router-dom";
import CreateTrip from "../components/CreateTrip";
import CustomDatePicker from "../components/CustomDatePicker";
import DropDown from "../components/DropDown";
import Modal from "../components/Modal";
import Search from "../components/Search";
import SellTicket from "../components/SellTicket";
import TicketRaw from "../components/TicketRaw";
import useCompany from "../hooks/useCompany";
import { Manifest } from "../hooks/useManifest";
import useTrips, { TripQuery } from "../hooks/useTrips";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";

function Ticketing() {
  const { user } = useUser();
  const [tripQuery, setTripQuery] = useState<TripQuery>({} as TripQuery);
  const { data: company } = useCompany(user.companyId);
  const { data: trips, isLoading:tripsLoad } = useTrips(tripQuery);
  const [viewList, setViewList] = useState(false);
  const [list, setList] = useState<Manifest>();
  const [sellTicket, setSellTicket] = useState(false);
  const [ticket, setTicket] = useState('')
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<Date | [Date, Date] | null>(null);

  const states = ["All", "Booked", "Unbooked"];
  const handleTicketSale = (ticketId: string) => {
    setSellTicket(true);
    setTicket(ticketId);
  };
  const handleList = (manifest: Manifest) => {
    setViewList(true);
    setList(manifest);
  };
  const handleSelectDate = (val: Date | [Date, Date] | null) => {
    if (!val) return;
    if (!Array.isArray(val))
      setTripQuery({
        ...tripQuery,
        departureTime: `${format(val, "d/M/yyyy HH'H'00")}`,
      });
  };

  const matched = 
      trips?.reduce(
        (total, trip) =>
          total +
          trip.intermediateStops.filter(
            (stop) =>
              stop.toLowerCase() ===
              tripQuery.searchText?.toLowerCase()
          ).length,
        0
      );
 
  useEffect(() => {
    if (user.role !== "admin")
      setTripQuery({ ...tripQuery, branch: user.branch }); // Only show the relevant branch for an agent
  }, [user]);
  
  return (
    <div className="mt-5 m-5 ml-3">
      <Search
      label="Enter  destination..."
        onSearch={(searchText) =>
          setTripQuery({ ...tripQuery, searchText: searchText })
        }
      />
      {tripQuery.searchText && matched!=0 && (
        <p className="text-[#FF8C00] text-sm mt-2 ml-5">
          <span className="font-bold">{matched}</span> trips matching intermediate
          stop found...
        </p>
      )}
       
        <div className="mt-3 text-sm text-brand  flex items-center justify-self-end">
          <AiOutlineHistory />
          <Link to="/ticketing/history" className="ml-1 cursor-pointer">
            View sold tickets
          </Link>
        </div>
     

      <div className="mt-3 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user.role === "admin" ? (
            <DropDown
              style="v2"
              onSelect={(branch) => setTripQuery({ ...tripQuery, branch })}
              options={[ "All branches",...(company?.branches ?? [])]}
            />
          ) : (
            <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm text-neutral-500">
              <p>{camelCaseToTitle(user.branch??"")}</p>
            </div>
          )}
          <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm ">
            <p>{company?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-1 border-neutral-200 rounded-sm w-fit p-1  text-sm">
            <DropDown
              onSelect={(status) => setTripQuery({ ...tripQuery, status })}
              style={"v1"}
              options={states}
            />
          </div>
          <div className="relative ">
            <div
              onClick={() => setOpen(!open)}
              className="border-1 border-neutral-200 rounded-sm w-fit p-1 text-sm flex items-center space-x-2 cursor-pointer"
            >
              <p>
                {val ? format(val as Date, "PPpp") : "Choose date and time"}
              </p>
              <BiCalendarAlt size={14} />
            </div>
            <div className="absolute right-0 z-20 top-5">
              <CustomDatePicker
                mode="single"
                isOpen={open}
                onClose={() => setOpen(false)}
                onChange={(selectedVal) => {
                  handleSelectDate(selectedVal);
                  setVal(selectedVal);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {tripsLoad && <p>Trips are loading...</p>}
      {trips &&
        company &&
        trips.map((trip, i) => {
          return (
            <TicketRaw
              key={trip.tripId + i}
              searchText={tripQuery.searchText}
              trip={trip}
              companyId={company?.companyId}
              onClick={(ticketId) => handleTicketSale(ticketId)}
              viewList={(manifest) => handleList(manifest)}
            />
          );
        })}

      {sellTicket && <SellTicket tripId={ticket} effectTwo={() => setSellTicket(false)} />}
      {viewList && list && (
        <Modal
          title="Passenger list"
          actionOne="Download"
          actionTwo="Close"
          effectOne={() => alert("Downloaded!")}
          effectTwo={() => setViewList(false)}
        >
          <>
          <div className="flex justify-between mt-5">
          <div>

            <p className="text-brand font-semibold">
              Trip ID:{" "}
              <span className="text-black font-normal">{list.tripId}</span>
            </p>

            <p className="text-brand font-semibold">
              Route:{" "}
              <span className="text-black font-normal">{list.route}</span>
            </p>
            <p className="text-brand font-semibold">
              Departure Time:{" "}
              <span className="text-black font-normal">
                {format(list.departureTime, "d/M/yyyy HH'H'00")}
              </span>
            </p>
          </div>
          <div>

            <p className="text-brand font-semibold">
              Passenger count:{" "}
              <span className="text-black">{list.manifest.length}</span>
            </p>
            <p className="text-brand font-semibold">
              Bus:{" "}
              <span className="text-black font-normal">{list.busPlate}</span>
            </p>
            <p className="text-brand font-semibold">
              Driver:{" "}
              <span className="text-black font-normal">{list.driverName}</span>
            </p>
          </div>

          </div>

            <table className="mt-2 ">
              <div className="max-h-72 overflow-y-scroll">
                <div className="relative contain-content border  border-neutral-300 rounded-t-lg mr-3">
                  <tr className="bg-neutral-200 sticky top-0">
                    <th className="text-start w-40 p-1 pl-3 border-r border-neutral-300">
                      T-ID
                    </th>
                    <th className="text-start w-40 p-1 pl-3 border-r border-neutral-300">
                      Name
                    </th>
                    <th className="text-start w-40 p-1 pl-3 border-r border-neutral-300">
                      Phone
                    </th>
                    <th className="text-start w-40 p-1 pl-3 border-r border-neutral-300">
                      Seat
                    </th>
                    <th className="text-start w-40 p-1 pl-3 border-r border-neutral-300">
                      TT
                    </th>
                  </tr>
                  {list.manifest.map(
                    (
                      {
                        ticketId,
                        passengerName,
                        passengerPhone,
                        seatNumber,
                        timeTaken,
                      },
                      i
                    ) => (
                      <tr key={ticketId + i}>
                        <td className="pl-3">{ticketId}</td>
                        <td className="pl-3">{passengerName}</td>
                        <td className="pl-3">{passengerPhone}</td>
                        <td className="pl-3">{seatNumber}</td>
                        <td className="pl-3">
                          {format(timeTaken, "yyyy-M-d h:mm a")}
                        </td>
                      </tr>
                    )
                  )}
                </div>
              </div>
            </table>
          </>
        </Modal>
      )}
    </div>
  );
}

export default Ticketing;

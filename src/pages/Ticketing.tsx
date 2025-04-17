import { useState } from "react";
import { AiOutlineHistory, AiOutlineSearch } from "react-icons/ai";
import { BiCalendarAlt } from "react-icons/bi";
import CreateTrip from "../components/CreateTrip";
import DropDown from "../components/DropDown";
import SellTicket from "../components/SellTicket";
import TicketRaw from "../components/TicketRaw";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";

function Ticketing() {
  const [viewList, setList] = useState(false);
  const [sellTicket, setSellTicket] = useState(false);
  const [createTrip, setCreateTrip] = useState(false);
  const states = ["All", "booked", "unbooked"];
  const handleTicketSale = (ticketId: string) => {
    setSellTicket(true);
    console.log(ticketId);
  };
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

      <div className="mt-3 text-sm text-brand flex justify-between">
        <button onClick={() => setCreateTrip(true)} className=" cursor-pointer">
          + Create trip
        </button>
        <div className="flex items-center">
          <AiOutlineHistory />
          <Link to="/ticketing/history" className="ml-1 cursor-pointer">View sold tickets</Link>
        </div>
      </div>

      <div className="mt-3 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm text-neutral-500">
            <p>Kigali</p>
          </div>
          <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm ">
            <p>RITCO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-1 border-neutral-200 rounded-sm w-fit p-1  text-sm">
            <DropDown style={"v1"} options={states} />
          </div>
          <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 text-sm flex items-center space-x-2">
            <p>Choose date and time</p>
            <BiCalendarAlt size={14} />
          </div>
        </div>
      </div>

      <TicketRaw onClick={(ticketId) => handleTicketSale(ticketId)} viewList={()=>setList(true)}/>
      <TicketRaw onClick={(ticketId) => handleTicketSale(ticketId)} viewList={()=>setList(true)}/>
      {sellTicket && <SellTicket effectTwo={() => setSellTicket(false)} />}
      {createTrip && (
        <CreateTrip effectTwo={()=>setCreateTrip(false)}/>
      )}
       {viewList && <Modal title="Passenger list" actionOne="Download" actionTwo="Close" effectOne={()=>alert('Downloaded!')} effectTwo={()=>setList(false)} >
        <>
        <p className="text-brand font-semibold">Passenger count: <span className="text-black">55</span></p>
        <p className="text-brand font-semibold">Bus: <span className="text-black font-normal">RAB 234  C, Yutong Large</span></p>
        <table className="mt-2 ">
            <div className="max-h-72 overflow-y-scroll">

            <div className="relative contain-content border  border-neutral-300 rounded-t-lg mr-3">
            <tr className="bg-neutral-200 sticky top-0">
                <th  className="text-start w-40 p-1 pl-3 border-r border-neutral-300">T-ID</th>
                <th  className="text-start w-40 p-1 pl-3 border-r border-neutral-300">Name</th>
                <th  className="text-start w-40 p-1 pl-3 border-r border-neutral-300">Phone</th>
                <th  className="text-start w-40 p-1 pl-3 border-r border-neutral-300">Seat</th>
                <th  className="text-start w-40 p-1 pl-3 border-r border-neutral-300">TT</th>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            <tr>
                <td className="pl-3">UCH-VST-H5P-3GN</td>
                <td className="pl-3">Janine Dowe</td>
                <td className="pl-3">073234219</td>
                <td className="pl-3">13 A</td>
                <td className="pl-3">2025-4-1 9:26 AM</td>
            </tr>
            </div>
            </div>
        </table>
        </>
        </Modal>}
    </div>
  );
}

export default Ticketing;

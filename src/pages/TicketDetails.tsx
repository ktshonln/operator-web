import { AiFillPrinter, AiOutlineDownload } from "react-icons/ai";
import { BiChevronDown } from "react-icons/bi";
import { Link, useParams } from "react-router-dom";
import Ticket from "../components/Ticket";
interface Ticket {
  id: number;
  content: string;
}
const tickets: Record<string, string> = {
  1: "Ticket 1",
  2: "Ticket 2",
  3: "Ticket 3",
  4: "Ticket 3",
};
function TicketDetails() {
  const { ticketId } = useParams<string>();

  const ticket = ticketId && tickets[ticketId];
  if (!ticket) return <p>No ticket found</p>;
  return (
    <div className="flex space-x-3">
      <Link to="/ticketing">
        <BiChevronDown size={20} className="rotate-90 mt-16" />
      </Link>
      <div className=" w-fit mx-auto">
        <p className="font-bold text-lg text-neutral-500 mt-20 mb-10">
          Ticket Details
        </p>
        <div className=" flex space-x-20">
          <Ticket />
          <div className="space-y-2 w-32">
            <button className="bg-brand w-full p-1.5 text-sm text-white rounded-sm pl-2 pr-2 flex items-center space-x-2 cursor-pointer active:scale-95 hover:brightness-95">
              <AiOutlineDownload size={20} />
              <p>Download</p>
            </button>
            <button className="bg-brand w-full p-1.5 text-sm text-white rounded-sm pl-2 pr-2 flex items-center space-x-2 cursor-pointer active:scale-95 hover:brightness-95">
              <AiFillPrinter size={20} />
              <p className="ml-3">Print</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetails;

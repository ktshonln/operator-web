import { AiFillPrinter, AiOutlineDownload } from "react-icons/ai";
import { BiChevronDown } from "react-icons/bi";
import { Link, useNavigate, useParams } from "react-router-dom";
import Ticket from "../components/Ticket";
import useTicket from "../hooks/useTicket";
import { formatMoney } from "../utils/helpers";
import { format, isValid } from "date-fns";
import useBus from "../hooks/useBus";
import useCompany from "../hooks/useCompany";

function TicketDetails() {

  const { ticketId } = useParams<string>();

  const {data:ticket} = useTicket(ticketId as string);
  console.log("the ID",ticketId)
  console.log('Ticket', ticket)
  const { data: bus } = useBus(ticket?.companyId??'', ticket?.busId??'');
  const { data: company } = useCompany(ticket?.companyId??'');
  const navigate = useNavigate();
  return (
    <div className="flex space-x-3 dark:text-white">
      <button onClick={()=>navigate(-1)} className="flex justify-self-start cursor-pointer" >
        <BiChevronDown size={20} className="rotate-90 mt-16" />
      </button>
      <div className="w-full">
        <p className="font-bold text-lg text-neutral-500 mt-20 mb-10 w-fit mx-auto">
          Ticket Details
        </p>
        <div className=" flex space-x-20  justify-between">
          {/* <Ticket /> */}
          <div className="space-y-2">
          <h1 className="font-bold text-lg w-fit mx-auto mb-7">{ticket?.origin} - {ticket?.destination}</h1>
            <p><span className="text-neutral-500">T-ID: </span>{ticket?.ticketId}</p>
            <p><span className="text-neutral-500">Passenger name: </span>{ticket?.passenger.firstName} {ticket?.passenger?.lastName}</p>
            <p className="font-light"><span className="text-neutral-500 font-normal">Bought: </span> {ticket?.purchaseTime ? isValid(new Date(ticket?.purchaseTime??0)) ? format(new Date(ticket?.purchaseTime??0), "HH'H'mm"): 'Invalid date': ''}</p>
            <p className="font-light"><span className="text-neutral-500 font-normal">Departure: </span>{ticket?.departureTime ? isValid(new Date(ticket?.departureTime??0)) ? format(new Date(ticket?.departureTime??0), "HH'H'mm"): 'Invalid date': ''}</p>
            <p className="font-light"><span className="text-neutral-500 font-normal">Arrival: </span>{ticket?.arrivalTime ? isValid(new Date(ticket?.arrivalTime??0)) ? format(new Date(ticket?.arrivalTime??0), "HH'H'mm"): 'Invalid date': ''}</p>
            <p><span className="text-neutral-500">Price: </span>{formatMoney(ticket?.pricing?.totalCharged??0)} RWF</p>
            <p><span className="text-neutral-500">Bus type: </span>{bus?.brand} {bus?.model}</p>
            <p><span className="text-neutral-500">Bus Plate Number: </span>{bus?.model}</p>
            <p><span className="text-neutral-500">Quantity: </span>{ticket?.ticketQuantity}</p>
            <p><span className="text-neutral-500">Seat: </span>{Array.isArray(ticket?.seatNumber) ?ticket?.seatNumber.map((choice, id)=><span key={id} className="after:content-[','] last-of-type:after:content-none"> {choice}</span>):ticket?.seatNumber}</p>
            <p><span className="text-neutral-500">Bus company: </span>{company?.name}</p>
            <p><span className="text-neutral-500">Bus company information: </span>{company?.about}</p>
          </div>
          <div className="space-y-2 w-32 mr-20">
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

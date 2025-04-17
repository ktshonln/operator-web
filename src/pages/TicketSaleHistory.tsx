import { AiOutlineSearch } from "react-icons/ai"
import { BiCalendarAlt } from "react-icons/bi"
import TableTwo from "../components/TableTwo"

const data3 = [
    {
      ticketId: "678cc836ddc071f4e3ef9399",
      passengerName: "Jeanne Dowe",
      route: { origin: "Kigali", destination: "Huye" },
      paymentStatus: "pending",
      date: "12/09/2025 17:23",
    },
    {
      ticketId: "678cc836ddc071f4e3ef9399",
      passengerName: "Jeanne Dowe",
      route: { origin: "Kigali", destination: "Huye" },
      paymentStatus: "pending",
      date: "12/09/2025 17:23",
    },
    {
      ticketId: "678cc836ddc071f4e3ef9399",
      passengerName: "Jeanne Dowe",
      route: { origin: "Kigali", destination: "Huye" },
      paymentStatus: "received",
      date: "12/09/2025 17:23",
    },
  ];

function TicketSaleHistory() {
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
                  <div className="mt-3 mb-10 justify-self-end">
                    <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 text-sm flex items-center space-x-2">
                                <p>Choose date and time</p>
                                <BiCalendarAlt size={14} />
                              </div>
                  </div>
                  <TableTwo tableData={data3} click/>
        </div>
    )
}

export default TicketSaleHistory

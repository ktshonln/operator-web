import { AiOutlineSearch } from "react-icons/ai"
import { BiCalendarAlt } from "react-icons/bi"
import TableTwo from "../components/TableTwo"
import useTickets, { TicketQuery } from "../hooks/useTickets";
import CustomDatePicker from "../components/CustomDatePicker";
import { useState } from "react";
import { TripQuery } from "../hooks/useTrips";
import { format } from "date-fns";


function TicketSaleHistory() {
  const [tripQuery, setTripQuery] = useState<TripQuery>({} as TripQuery);
  const [ticketQuery,] = useState<TicketQuery>({} as TicketQuery);
  const { data: tickets } = useTickets(ticketQuery);
   const [open, setOpen] = useState(false);
    const [val, setVal] = useState<Date | [Date, Date] | null>(null);
    const handleSelectDate = (val: Date | [Date, Date] | null) => {
        if (!val) return;
        if (!Array.isArray(val))
          setTripQuery({
            ...tripQuery,
            departureTime: `${format(val, "d/M/yyyy HH'H'00")}`,
          });
      };
    return (
        <div className="mt-5 m-5 ml-3 dark:text-white">
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
                                   withTime
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
                  <TableTwo tableData={tickets?.tickets ?? []} click/>
        </div>
    )
}

export default TicketSaleHistory

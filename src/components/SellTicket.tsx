import { TicketSaleDetails } from "../hooks/useSellTicket";
import { Ticket } from "../hooks/useTickets";
import useTrip from "../hooks/useTrip"
import useUser from "../hooks/useUser";
import { formatMoney } from "../utils/helpers";
import DropDown from "./DropDown"
import Modal from "./Modal"
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
    name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
    phoneNumber: z
    .string()
    .min(10, { message: "Enter a valid phone number." }),
    ticketQuantity: z
    .number()
    .min(1, { message: "Ticket quantity must be greater than 1." }),
    seatNumber: z.union([

      z
     .string()
     .min(1, { message: "Please enter a valid seat." }),
     z.array(z
      .string()
      .min(1, { message: "Please enter a valid seat." }))
    ]),
    intermediateStop: z
    .string()
    .min(1, { message: "Please enter a valid intermediate stop." }).optional(),
    tripId: z
    .string(),
    originStopId: z
    .string(),
    destinationStopId: z
    .string(),
    userId: z
    .string(),
});
type FormData = z.infer<typeof schema>;

const SellTicket = ({effectTwo,  tripId}:{effectTwo:()=>void, tripId: string}) => {
  const {
      register,
      handleSubmit,
      resetField,
      control,
      formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: TicketSaleDetails) => {
      alert("submitting");
      console.log('SOLDDD!',data);
      
    };

  const {data: trip, isLoading} = useTrip(tripId)
  const {user:{id:userId}} = useUser()
  
  console.log('Ticket',trip)
  console.log('TicketID',tripId)
    return (
        <Modal title="Sell ticket" actionOne="Sell" actionTwo="Cancel" effectOne={handleSubmit(onSubmit)} effectTwo={effectTwo} form >
         <>
         <label
                  htmlFor="name"
                  className="block mb-0.5 font-medium"
                >
                  Name <span className="text-red-500 text-base">*</span>
                </label>
                <div className="mb-5">

                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                  <input
                  {...register("name")}
                    type="text"
                    id="name"
                    name="name"
                    className="outline-none w-full"
                  />
                </div>
                {errors.name && (
                      <p className="text-red-500 text-xs">
                        {errors.name.message}
                      </p>
                    )}
                </div>

                <label
                  htmlFor="phoneNumber"
                  className="block mb-0.5 font-medium"
                >
                  Phone Number <span className="text-red-500 text-base">*</span>
                </label>
                <div className="mb-5">
                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                  <input
                  {...register("phoneNumber")}
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="outline-none w-full"
                  />
                </div>
                {errors.phoneNumber && (
                      <p className="text-red-500 text-xs">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                </div>
                
                <label
                  htmlFor="ticketQuantity"
                  className="block mb-0.5 font-medium"
                >
                  Number of tickets <span className="text-red-500 text-base">*</span>
                </label>
                <div className="mb-5">

                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                  <input
                  {...register("ticketQuantity")}
                    type="number"
                    min={1}
                    id="ticketQuantity"
                    name="ticketQuantity"
                    className="outline-none w-full"
                  />
                </div>
                {errors.ticketQuantity && (
                      <p className="text-red-500 text-xs">
                        {errors.ticketQuantity.message}
                      </p>
                    )}
                </div>
                {trip?.seats && 
                <>
                <label
                  htmlFor="seatNumber"
                  className="block mb-0.5 font-medium"
                  >
                  Seat
                </label>
                <div className="mb-5">
                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                  <Controller 
                  name='seatNumber'
                  control={control}
                  render={({field})=><DropDown {...field} onSelect={()=>console.log('selected')} options={trip?.seats} style="v1"/>}
                  />
                    
                </div>
                 {errors.seatNumber && (
                      <p className="text-red-500 text-xs">
                        {errors.seatNumber.message}
                      </p>
                    )}
                </div>
                  </>
                    }
             {trip?.intermediateStops &&trip?.intermediateStops.length!=0 &&  <>
               <label
                  htmlFor="intermediateStop"
                  className="block mb-0.5 font-medium"
                >
                  Intermediate stop
                </label>
                <div className="mb-5">
                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                    <DropDown {...register("intermediateStop")} onSelect={()=>console.log('selected')} options={['None',...trip?.intermediateStops]} style="v1"/>
                </div>
                {errors.intermediateStop && (
                      <p className="text-red-500 text-xs">
                        {errors.intermediateStop.message}
                      </p>
                    )}
                </div>
                <p>Price: <span className="text-brand font-bold">{formatMoney(1345)}</span> <span className="text-neutral-500 font-semibold">RWF</span></p>
               </>}
               <input
                    {...register("tripId")} 
                    type="text"
                    id="tripId"
                    name="tripId"
                    value={trip?.tripId}
                    className="outline-none w-full hidden"
                  />
               <input
                    {...register("originStopId")} 
                    type="text"
                    id="originStopId"
                    name="originStopId"
                    value={trip?.route.startId}
                    className="outline-none w-full hidden"
                  />
               <input
                    {...register("destinationStopId")} 
                    type="text"
                    id="destinationStopId"
                    name="destinationStopId"
                    value={trip?.route.endId}
                    className="outline-none w-full hidden"
                  />
               <input
                    {...register("userId")} 
                    type="text"
                    id="userId"
                    name="userId"
                    value={userId}
                    className="outline-none w-full hidden"
                  />
         </>
        </Modal>
    )
}

export default SellTicket

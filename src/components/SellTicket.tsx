import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import useSellTicket, { TicketSaleDetails } from "../hooks/useSellTicket";
import useTrip from "../hooks/useTrip";
import useUser from "../hooks/useUser";
import { formatMoney } from "../utils/helpers";
import DropDown from "./DropDown";
import Modal from "./Modal";
import { ChangeEvent, useEffect, useState } from "react";
import { useToastStore } from "../stores/toastStore";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phoneNumber: z.string().min(10, { message: "Enter a valid phone number." }),
  ticketQuantity: z
    .number()
    .min(1, { message: "Ticket quantity must be at least 1." }),
  seatNumber: z.union([
    z.string().min(1, { message: "Please enter a valid seat." }),
    z.array(z.string().min(1, { message: "Please enter a valid seat." })),
  ]),
  intermediateStop: z
    .string()
    .min(1, { message: "Please enter a valid intermediate stop." })
    .optional(),
  tripId: z.string(),
  originStopId: z.string(),
  destinationStopId: z.string(),
  userId: z.string(),
});
type FormData = z.infer<typeof schema>;

const SellTicket = ({
  effectTwo,
  tripId,
}: {
  effectTwo: () => void;
  tripId: string;
}) => {
  const [tNumber, setTnumber] = useState(0);
  const { data: trip } = useTrip(tripId);
  const {
    user
  } = useUser();

  const userId = user?.id;

  const showToast = useToastStore((state) => state.showToast);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tripId: tripId,
      originStopId: trip?.route.startId,
      destinationStopId: trip?.route.endId,
    },
  });
  const startId = trip?.route.startId;
  const endId = trip?.route.endId;
  const sellTicket = useSellTicket();
  useEffect(() => {
    userId && setValue("userId", userId);
    tripId && setValue("tripId", tripId);
    startId && setValue("originStopId", startId);
    endId && setValue("destinationStopId", endId);
  }, [userId, tripId, startId, endId, setValue]);
  const onSubmit = async (data: TicketSaleDetails) => {
    if (
      data.tripId === "" ||
      data.destinationStopId === "" ||
      data.originStopId === ""
    ) {
      showToast("Something went wrong.", "error");
      return;
    }
    console.log("SOLDDD!", data);
    sellTicket.mutate(data);
  };

  console.log("TicketNOW", trip);
  console.log("TicketID", tripId);
  return (
    <Modal
      title="Sell ticket"
      actionOne="Sell"
      actionTwo="Cancel"
      effectOne={handleSubmit(onSubmit)}
      effectTwo={effectTwo}
      form
    >
      <>
        <label htmlFor="name" className="block mb-0.5 font-medium">
          Name <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 dark:ring-gray-800 mb-1 p-1 rounded-xs bg-white dark:bg-black">
            <input
              {...register("name")}
              type="text"
              id="name"
              name="name"
              className="outline-none w-full"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <label htmlFor="phoneNumber" className="block mb-0.5 font-medium">
          Phone Number <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 dark:ring-gray-800 mb-1 p-1 rounded-xs bg-white dark:bg-black">
            <input
              {...register("phoneNumber")}
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              className="outline-none w-full"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>

        <label htmlFor="ticketQuantity" className="block mb-0.5 font-medium">
          Number of tickets <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 dark:ring-gray-800 mb-1 p-1 rounded-xs bg-white dark:bg-black">
            <input
              {...register("ticketQuantity", { valueAsNumber: true })}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTnumber(parseInt(e.target.value))
              }
              type="number"
              min={1}
              max={trip?.seats.length}
              defaultValue={1}
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
        {trip?.seats && (
          <>
            <label htmlFor="seatNumber" className="block mb-0.5 font-medium">
              Seat
            </label>
            <div className="mb-5">
              <div className="ring ring-gray-200 dark:ring-gray-800 mb-1 p-1 rounded-xs bg-white dark:bg-black">
                <Controller
                  name="seatNumber"
                  defaultValue={trip?.seats[0]} // Initializing value to first item, this is requered as value is undefined when no selection is yet made
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={field.value}
                      multiValue={tNumber}
                      onSelect={field.onChange}
                      options={trip?.seats}
                      style="v1"
                    />
                  )}
                />
              </div>
              {errors.seatNumber && (
                <p className="text-red-500 text-xs">
                  {errors.seatNumber.message}
                </p>
              )}
            </div>
          </>
        )}
        {trip?.intermediateStops && trip?.intermediateStops.length != 0 && (
          <>
            <label
              htmlFor="intermediateStop"
              className="block mb-0.5 font-medium"
            >
              Intermediate stop
            </label>
            <div className="mb-5">
              <div className="ring ring-gray-200 dark:ring-gray-800 mb-1 p-1 rounded-xs bg-white dark:bg-black">
                <Controller
                  name="intermediateStop"
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      {...field}
                      onSelect={() => console.log("selected")}
                      options={["None selected", ...trip?.intermediateStops]}
                      style="v1"
                    />
                  )}
                />
              </div>
              {errors.intermediateStop && (
                <p className="text-red-500 text-xs">
                  {errors.intermediateStop.message}
                </p>
              )}
            </div>
            <p>
              Price:{" "}
              <span className="text-brand font-bold">{formatMoney(1345)}</span>{" "}
              <span className="text-neutral-500 font-semibold">RWF</span>
            </p>
          </>
        )}
      </>
    </Modal>
  );
};

export default SellTicket;

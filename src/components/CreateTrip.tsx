import { BiCalendarAlt, BiTime } from "react-icons/bi";
import DropDown from "./DropDown";
import Modal from "./Modal";
import { RiFlashlightLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import CustomDatePicker from "./CustomDatePicker";
import useUser from "../hooks/useUser";
import useCompany from "../hooks/useCompany";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import useAddTrip, { TripDetails } from "../hooks/useAddTrip";
import useBuses, { BusQuery } from "../hooks/useBuses";
import useRoutes, { RouteQuery, FleetRoute as Route } from "../hooks/useRoutes";

const schema = z
  .object({
    route: z.object({
      start: z.string().min(2, { message: "Please enter a valid origin." }),
      end: z.string().min(2, { message: "Please enter a valid destination" }),
    }),
    busId: z.string().min(4, { message: "Please enter a valid plate number." }),
    express: z.boolean().optional(),
    departureDateAndTime: z
      .string()
      .min(4, { message: "Please enter a valid departure date and time." }),
    autoScheduling: z.boolean().optional(),
    departureTime: z.string().optional(),
    scheduleBlock: z
      .enum(["day", "week", "month"], {
        message: "Please select a schedule block.",
      })
      .optional(),
    dayRange: z
      .object({
        from: z
          .string()
          .min(1, { message: "Please enter a valid day range start." }),
        to: z
          .string()
          .min(1, { message: "Please enter a valid day range end." }),
      })
      .optional(),
    minuteInterval: z
      .number()
      .min(1, { message: "Please enter a valid minute interval." })
      .optional(),
    timeRange: z
      .object({
        from: z
          .string()
          .min(1, { message: "Please enter a valid time range start." }),
        to: z
          .string()
          .min(1, { message: "Please enter a valid time range end." }),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.autoScheduling) {
      if (!data.departureTime || data.departureTime.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid departure time.",
          path: ["departureTime"],
        });
      }
      if (
        !data.scheduleBlock ||
        !["day", "week", "month"].includes(data.scheduleBlock)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a schedule block.",
          path: ["scheduleBlock"],
        });
      }
      if (!data.dayRange?.from || data.dayRange.from.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid day range start.",
          path: ["dayRange.from"],
        });
      }
      if (!data.dayRange?.to || data.dayRange.to.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid day range end.",
          path: ["dayRange.to"],
        });
      }
      if (data.minuteInterval) {
        if (!data.timeRange?.from || data.timeRange.from.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid time range start.",
            path: ["timeRange.from"],
          });
        }
        if (!data.timeRange?.to || data.timeRange.to.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid time range end.",
            path: ["timeRange.to"],
          });
        }
      }
    }
  });
type FormData = z.infer<typeof schema>;

const CreateTrip = ({ effectTwo }: { effectTwo: () => void }) => {
  const { user } = useUser();
  const companyId = (user as any)?.org_id ?? "";
  const { data: company } = useCompany(companyId);
  const { data: buses } = useBuses(companyId, {} as BusQuery);
  const [currentOrigin, setCurrentOrigin] = useState("");
  const { data: routes } = useRoutes(companyId, {} as RouteQuery);
  const [matchingEnds, setMatchingEnds] = useState<string[]>([]);

  const [autoschedule, setAutoSchedule] = useState(false);

  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<Date | [Date, Date] | null>(null);
  const [openTime, setOpenTime] = useState(false);
  const [valTime, setValTime] = useState<Date | [Date, Date] | null>(null);

  const [minuteInterval, setminuteInterval] = useState(false);
  const [minuteVal, setminuteVal] = useState<number | null>(null);

  const busOptions = [
    { id: "None", plateNumber: "None" },
    ...(buses?.pages.flat()?.map((b) => ({
      id: b.busId,
      plateNumber: b.plateNumber,
    })) || []),
  ];
  const {
    register,
    unregister,
    resetField,
    getValues,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const createTrip = useAddTrip(company?.companyId ?? "");
  const onSubmit = async (data: TripDetails) => {
    console.log("Added!", data);
    createTrip.mutate(data);
  };

  useEffect(() => {
    const ends =
      routes?.pages
        .map((page: Route[]) =>
          page
            .filter(
              (r: Route) =>
                r.route?.start?.toLowerCase() === currentOrigin.toLowerCase(),
            )
            .map((o: Route) => o.route?.end ?? ''),
        )
        .flat(1) ?? [];
    setMatchingEnds(ends); // Matching destinations. Later, filter by id.
    if (!ends.includes(getValues("route.end"))) {
      resetField("route.end");
    }
  }, [currentOrigin]);

  return (
    <Modal
      title="Create trip"
      actionOne="Create"
      actionTwo="Cancel"
      effectOne={handleSubmit(onSubmit)}
      effectTwo={effectTwo}
      form
    >
      <>
        <p className="block mb-0.5 font-medium">Origin</p>
        <div className="mb-5">
          <div className="ring ring-gray-200 p-1 rounded-xs bg-white">
            {user &&
            "roles" in user &&
            user.roles.includes("platform-admin") ? (
              <Controller
                name="route.start"
                control={control}
                render={({ field }) => (
                  <DropDown
                    value={field.value}
                    onSelect={(choice) => {
                      field.onChange(choice);
                      resetField("route.end");
                      unregister("route.end");
                      setCurrentOrigin(choice);
                    }}
                    options={["", ...(company?.branches ?? [])]}
                    style="v1"
                  />
                )}
              />
            ) : (
              <input className="text-neutral-500" disabled value="" />
            )}
          </div>
          {errors.route?.start && (
            <p className="text-red-500 text-xs">
              {errors.route?.start.message}
            </p>
          )}
        </div>

        <label htmlFor="destination" className="block mb-0.5 font-medium">
          Destination <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 p-1 rounded-xs bg-white">
            {currentOrigin ? (
              matchingEnds.length !== 0 ? (
                <Controller
                  name="route.end"
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={field.value}
                      onSelect={field.onChange}
                      options={["", ...(matchingEnds ?? ["None yet"])]}
                      style="v1"
                    />
                  )}
                />
              ) : (
                "No matching destination"
              )
            ) : (
              "Waiting origin choice..."
            )}
          </div>
          {errors.route?.end && (
            <p className="text-red-500 text-xs">{errors.route.end.message}</p>
          )}
        </div>
        <label htmlFor="bus" className="block mb-0.5 font-medium">
          Bus <span className="text-red-500 text-base">*</span>
        </label>
        <div className=" mb-5">
          <div className="ring ring-gray-200 p-1 rounded-xs bg-white">
            <Controller
              name="busId"
              control={control}
              render={({ field }) => (
                <DropDown
                  value={field.value}
                  onSelect={field.onChange}
                  options={busOptions.map((d) => d.id)}
                  label={(busId) => {
                    const match = busOptions.find((b) => b.id === busId);
                    return match ? match.plateNumber : "Unknown";
                  }}
                  style="v1"
                />
              )}
            />
          </div>
          {errors.busId && (
            <p className="text-red-500 text-xs">{errors.busId.message}</p>
          )}
        </div>
        <div className=" mb-5">
          <div className="flex items-center space-x-2 mb-5">
            <input
              {...register("express")}
              type="checkbox"
              name="express"
              id="express"
              className="size-5 block"
            />
            <span className="flex items-center">
              <label htmlFor="express">Make express</label>
              <RiFlashlightLine className="text-brand" />
            </span>
          </div>
          {errors.express && (
            <p className="text-red-500 text-xs">{errors.express.message}</p>
          )}
        </div>
        <label htmlFor="bus" className="block mb-0.5 font-medium">
          Departure date and time
        </label>
        <div className="relative mb-5">
          <div
            onClick={() => setOpen(!open)}
            className="border-1 border-neutral-200 rounded-sm justify-between p-1 text-sm flex items-center space-x-2 cursor-pointer"
          >
            <p>{val ? format(val as Date, "PPpp") : "Choose date and time"}</p>
            <BiCalendarAlt size={14} />
          </div>
          <div className="absolute right-0 z-20 top-5">
            <Controller
              name="departureDateAndTime"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  mode="single"
                  withTime
                  isOpen={open}
                  onClose={() => setOpen(false)}
                  onChange={(selectedVal) => {
                    setVal(selectedVal);
                    field.onChange(`${selectedVal}`);
                  }}
                />
              )}
            />
          </div>
          {/* <input {...register("departureDateAndTime")} type="text" hidden value={`${val}`} /> */}
          {errors.departureDateAndTime && (
            <p className="text-red-500 text-xs">
              {errors.departureDateAndTime.message}
            </p>
          )}
        </div>
        <div className="mb-5">
          <div className="flex items-center space-x-2">
            <p>Enable auto-scheduling</p>
            <Controller
              name="autoScheduling"
              control={control}
              render={({ field }) => (
                <div
                  onClick={() => {
                    const auto = !autoschedule;
                    setAutoSchedule(auto); // This makes sure the minute interval checkbox is always unchecked without autoSchedule
                    !auto && setminuteInterval(false);
                    field.onChange(auto);
                    if (!auto) {
                      unregister("departureTime");
                      unregister("scheduleBlock");
                      unregister("dayRange");
                      unregister("minuteInterval");
                      unregister("timeRange");
                    }
                  }}
                  className={`bg-brand w-10 h-5 rounded-full flex items-center p-0.5 pb-[2.2px] cursor-pointer ${
                    autoschedule ? " justify-end" : "bg-neutral-300"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full" />
                </div>
              )}
            />
          </div>
          {errors.autoScheduling && (
            <p className="text-red-500 text-xs">
              {errors.autoScheduling.message}
            </p>
          )}
        </div>
        {autoschedule && (
          <>
            <label htmlFor="bus" className="block mb-0.5 font-medium">
              Departure time <span className="text-red-500 text-base">*</span>
            </label>
            <div className="relative mb-5">
              <div
                onClick={() => setOpenTime(!openTime)}
                className="border-1 border-neutral-200 rounded-sm justify-between p-1 text-sm flex items-center space-x-2 cursor-pointer"
              >
                <p>{valTime ? format(valTime as Date, "pp") : "Choose time"}</p>
                <BiTime size={14} />
              </div>
              <div className="absolute right-0 z-20 top-5">
                <Controller
                  name="departureTime"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      mode="time"
                      withTime
                      isOpen={openTime}
                      onClose={() => setOpenTime(false)}
                      onChange={(selectedVal) => {
                        setValTime(selectedVal);
                        field.onChange(`${selectedVal}`);
                      }}
                    />
                  )}
                />
              </div>
              {errors.departureTime && (
                <p className="text-red-500 text-xs">
                  {errors.departureTime.message}
                </p>
              )}
            </div>
            <div className="mb-5">
              <div className="flex items-center space-x-2 ">
                <div className=" flex items-center space-x-0.5">
                  <input
                    {...register("scheduleBlock")}
                    type="radio"
                    id="day"
                    value="day"
                  />
                  <label htmlFor="day" className="flex mt-0.5">
                    Day ahead
                  </label>
                </div>
                <div className=" flex items-center space-x-0.5">
                  <input
                    {...register("scheduleBlock")}
                    type="radio"
                    id="week"
                    value="week"
                  />
                  <label htmlFor="week" className="flex mt-0.5">
                    Week ahead
                  </label>
                </div>
                <div className=" flex items-center space-x-0.5">
                  <input
                    {...register("scheduleBlock")}
                    type="radio"
                    id="month"
                    value="month"
                  />
                  <label htmlFor="month" className="flex mt-0.5">
                    Month ahead
                  </label>
                </div>
              </div>
              {errors.scheduleBlock && (
                <p className="text-red-500 text-xs">
                  {errors.scheduleBlock.message}
                </p>
              )}
            </div>
            <label htmlFor="dayRange.from" className="block mb-0.5 font-medium">
              Day range{" "}
              <span className="text-neutral-400 font-normal">{`(default: everyday)`}</span>
            </label>
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <select
                  {...register("dayRange.from")}
                  id="dayRange.from"
                  className="border-1 border-neutral-200 rounded-sm justify-between p-1 text-sm flex items-center space-x-2 cursor-pointer outline-none"
                >
                  <option value="">From</option>
                  <option value="mon">Monday</option>
                  <option value="tue">Tuesday</option>
                  <option value="wed">Wednesday</option>
                  <option value="thur">Thursday</option>
                  <option value="fri">Friday</option>
                  <option value="sat">Saturday</option>
                  <option value="sun">Sunday</option>
                </select>
                <select
                  {...register("dayRange.to")}
                  id="dayRange.to"
                  className="border-1 border-neutral-200 rounded-sm justify-between p-1 text-sm flex items-center space-x-2 cursor-pointer outline-none"
                >
                  <option value="">To</option>
                  <option value="mon">Monday</option>
                  <option value="tue">Tuesday</option>
                  <option value="wed">Wednesday</option>
                  <option value="thur">Thursday</option>
                  <option value="fri">Friday</option>
                  <option value="sat">Saturday</option>
                  <option value="sun">Sunday</option>
                </select>
              </div>
              {errors.dayRange?.from && (
                <p className="text-red-500 text-xs">
                  {errors.dayRange.from.message}
                </p>
              )}
              {errors.dayRange?.to && (
                <p className="text-red-500 text-xs">
                  {errors.dayRange.to.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-5">
              <input
                type="checkbox"
                onChange={() => {
                  setminuteInterval(!minuteInterval);
                  if (!minuteInterval) {
                    unregister("minuteInterval");
                    unregister("timeRange");
                  }
                }}
                name="minuteInterval"
                id="minuteInterval"
                className="size-5"
              />
              <span className="flex items-center">
                <label htmlFor="minuteInterval">After set minutes</label>
              </span>
            </div>
            {minuteInterval && (
              <>
                <label htmlFor="bus" className="block mb-0.5 font-medium">
                  Every
                </label>
                <div className="mb-5">
                  <div className="space-x-2">
                    <input
                      {...register("minuteInterval", { valueAsNumber: true })}
                      onChange={(e) => setminuteVal(parseInt(e.target.value))}
                      type="number"
                      min={1}
                      max={60}
                      className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white w-12 outline-none"
                    />
                    <label htmlFor="minuteInterval">
                      {minuteVal === 1 ? "Minute" : "Minutes"}
                    </label>
                  </div>
                  {errors.minuteInterval && (
                    <p className="text-red-500 text-xs">
                      {errors.minuteInterval.message}
                    </p>
                  )}
                </div>
                <label
                  htmlFor="timeRange.from"
                  className="block mb-0.5 font-medium"
                >
                  Time range{" "}
                  <span className="text-neutral-400 font-normal">{`(default: entire day)`}</span>
                </label>
                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <select
                      {...register("timeRange.from")}
                      id="timeRange.from"
                      className="border-1 border-neutral-200 rounded-sm justify-between p-1 text-sm flex items-center space-x-2 cursor-pointer outline-none"
                    >
                      <option value="">From</option>
                      <option value="12AM">12AM</option>
                      <option value="1AM">1AM</option>
                      <option value="2AM">2AM</option>
                      <option value="3AM">3AM</option>
                      <option value="4AM">4AM</option>
                      <option value="5AM">5AM</option>
                      <option value="6AM">6AM</option>
                      <option value="7AM">7AM</option>
                      <option value="8AM">8AM</option>
                      <option value="9AM">9AM</option>
                      <option value="10AM">10AM</option>
                      <option value="11AM">11AM</option>
                      <option value="sun">12PM</option>
                      <option value="1PM">1AM</option>
                      <option value="2PM">2PM</option>
                      <option value="3PM">3PM</option>
                      <option value="4PM">4PM</option>
                      <option value="5PM">5PM</option>
                      <option value="6PM">6PM</option>
                      <option value="7PM">7PM</option>
                      <option value="8PM">8PM</option>
                      <option value="9PM">9PM</option>
                      <option value="10PM">10PM</option>
                      <option value="11PM">11PM</option>
                    </select>
                    <select
                      {...register("timeRange.to")}
                      id="timeRange.to"
                      className="border-1 border-neutral-200 rounded-sm justify-between p-1 text-sm flex items-center space-x-2 cursor-pointer outline-none"
                    >
                      <option value="">To</option>
                      <option value="12AM">12AM</option>
                      <option value="1AM">1AM</option>
                      <option value="2AM">2AM</option>
                      <option value="3AM">3AM</option>
                      <option value="4AM">4AM</option>
                      <option value="5AM">5AM</option>
                      <option value="6AM">6AM</option>
                      <option value="7AM">7AM</option>
                      <option value="8AM">8AM</option>
                      <option value="9AM">9AM</option>
                      <option value="10AM">10AM</option>
                      <option value="11AM">11AM</option>
                      <option value="sun">12PM</option>
                      <option value="1PM">1AM</option>
                      <option value="2PM">2PM</option>
                      <option value="3PM">3PM</option>
                      <option value="4PM">4PM</option>
                      <option value="5PM">5PM</option>
                      <option value="6PM">6PM</option>
                      <option value="7PM">7PM</option>
                      <option value="8PM">8PM</option>
                      <option value="9PM">9PM</option>
                      <option value="10PM">10PM</option>
                      <option value="11PM">11PM</option>
                    </select>
                  </div>
                  {errors.timeRange?.from && (
                    <p className="text-red-500 text-xs">
                      {errors.timeRange.from.message}
                    </p>
                  )}
                  {errors.timeRange?.to && (
                    <p className="text-red-500 text-xs">
                      {errors.timeRange.to.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </>
    </Modal>
  );
};

export default CreateTrip;

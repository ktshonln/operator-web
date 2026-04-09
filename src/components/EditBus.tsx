import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { BusDetails } from "../hooks/useAddBus";
import { Bus } from "../hooks/useBus";
import useDrivers, { DriverQuery } from "../hooks/useDrivers";
import useEditBus from "../hooks/useEditBus";
import DropDown from "./DropDown";
import Modal from "./Modal";

interface Props {
  effectTwo: () => void;
  companyId: string;
  bus: Bus;
}

const schema = z.object({
  brand: z
    .string()
    .min(2, { message: "Brand name must be at least 2 characters." }),
  model: z
    .string()
    .min(2, { message: "Model name must be at least 2 characters." }),
  seatingCapacity: z
    .number()
    .min(15, { message: "Oops! Your vehicle has a very low seat capacity." })
    .max(200, {
      message: "Oops! Your vehicle has an unusual high seat capacity.",
    }),
  plateNumber: z
    .string()
    .min(4, { message: "Please enter a valid plate number." }),
    assignedDriverId: z.string().min(1, { message: "Please enter a valid driver." }),
    status: z.string().min(1, { message: "Please enter a valid status." }),
});
type FormData = z.infer<typeof schema>;

const EditBus = ({ effectTwo, companyId, bus }: Props) => {
  const { data: drivers } = useDrivers(companyId, {} as DriverQuery);
  if(!drivers) return
  const currentDriver = drivers.pages.flat()?.filter(
    (driver) => driver.driverId === bus.assignedDriverId
  )[0];
  const driverOptions = [
    { id: "None", name: "None" },
    ...(drivers?.pages.flat()?.map((d) => ({
      id: d.driverId,
      name: `${d.firstName} ${d.lastName}`,
    })) || [])
  ];
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const editBus = useEditBus(companyId, bus.busId);

  const onSubmit = async (data: BusDetails) => {
    console.log("Edited!", data);
    editBus.mutate(data);
    effectTwo();
  };

  return (
    <Modal
      title="Edit bus"
      actionOne="Edit"
      actionTwo="Cancel"
      effectOne={handleSubmit(onSubmit)}
      effectTwo={effectTwo}
      form
    >
      <>
        <label htmlFor="brand" className="block mb-0.5 font-medium">
          Brand <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("brand")}
              type="text"
              id="brand"
              name="brand"
              defaultValue={bus.brand}
              className="outline-none w-full"
            />
          </div>
          {errors.brand && (
            <p className="text-red-500 text-xs">{errors.brand.message}</p>
          )}
        </div>

        <label htmlFor="model" className="block mb-0.5 font-medium">
          Model <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("model")}
              type="text"
              id="model"
              name="model"
              defaultValue={bus.model}
              className="outline-none w-full"
            />
          </div>
          {errors.model && (
            <p className="text-red-500 text-xs">{errors.model.message}</p>
          )}
        </div>

        <label htmlFor="seatingCapacity" className="block mb-0.5 font-medium">
          Seating Capacity <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("seatingCapacity", { valueAsNumber: true })}
              type="number"
              min={1}
              id="seatingCapacity"
              name="seatingCapacity"
              defaultValue={bus.seatingCapacity}
              className="outline-none w-full"
            />
          </div>
          {errors.seatingCapacity && (
            <p className="text-red-500 text-xs">
              {errors.seatingCapacity.message}
            </p>
          )}
        </div>
        <label htmlFor="phoneNumber" className="block mb-0.5 font-medium">
          Plate number <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("plateNumber")}
              type="text"
              id="plateNumber"
              name="plateNumber"
              defaultValue={bus.plateNumber}
              className="outline-none w-full"
            />
          </div>
          {errors.plateNumber && (
            <p className="text-red-500 text-xs">{errors.plateNumber.message}</p>
          )}
        </div>

        {
          <>
            <label htmlFor="assignedDriverId" className="block mb-0.5 font-medium">
              Driver
            </label>
            <div className="mb-5">
              <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
                <Controller
                  name="assignedDriverId"
                  defaultValue={currentDriver?.driverId || ""}
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={field.value}
                      onSelect={field.onChange}
                      options={driverOptions.map((d) => d.id)}
                      label={((driverId)=>{
                        const match = driverOptions.find((d) => d.id === driverId);
                        return match ? match.name : "Unknown";
                    })
                    }
                      style="v1"
                    />
                  )}
                />
              </div>
              {errors.assignedDriverId && (
                <p className="text-red-500 text-xs">{errors.assignedDriverId.message}</p>
              )}
            </div>
          </>
        }
        {
          <>
            <label htmlFor="status" className="block mb-0.5 font-medium">
              Status
            </label>
            <div className="mb-5">
              <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
                <Controller
                  name="status"
                  defaultValue={bus.status}
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={field.value}
                      onSelect={field.onChange}
                      options={['Operational', 'Not operational']}
                      style="v1"
                    />
                  )}
                />
              </div>
              {errors.status && (
                <p className="text-red-500 text-xs">{errors.status.message}</p>
              )}
            </div>
          </>
        }
      </>
    </Modal>
  );
};

export default EditBus;

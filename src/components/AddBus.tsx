import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import useAddBus, { BusDetails } from "../hooks/useAddBus";
import DropDown from "./DropDown";
import Modal from "./Modal";
import useDrivers from "../hooks/useDrivers";
import { BusQuery } from "../hooks/useBuses";

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
    vin: z.string()
    .min(17, { message: "Please enter a valid Vehicle Identification Number." }),
  plateNumber: z
    .string()
    .min(4, { message: "Please enter a valid plate number." }),
  driver: z.string().min(1, { message: "Please enter a valid driver." }),
});
type FormData = z.infer<typeof schema>;

const AddBus = ({
  effectTwo,
  companyId,
}: {
  effectTwo: () => void;
  companyId: string;
}) => {
  const { data: drivers } = useDrivers(companyId, {} as BusQuery);

  // Prepare mapping from name to ID
  const nameToIdMap = new Map(
    drivers?.map((d) => [`${d.firstName} ${d.lastName}`, d.driverId])
  );
  const options = drivers
    ? ["None", ...drivers.map((dri) => dri.firstName + " " + dri.lastName)]
    : ["None"];
  // Get current selected name from stored ID
  const getNameFromId = (id: string | undefined) => {
    if (!id) return "None";
    const entry = [...nameToIdMap.entries()].find(([, val]) => val === id);
    return entry ? entry[0] : "None";
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const addBus = useAddBus(companyId);

  const onSubmit = async (data: BusDetails) => {
    console.log("Added!", data);
    addBus.mutate(data);
  };

  return (
    <Modal
      title="Add bus"
      actionOne="Add"
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
              defaultValue={1}
              id="seatingCapacity"
              name="seatingCapacity"
              className="outline-none w-full"
            />
          </div>
          {errors.seatingCapacity && (
            <p className="text-red-500 text-xs">
              {errors.seatingCapacity.message}
            </p>
          )}
        </div>
        <label htmlFor="vin" className="block mb-0.5 font-medium">
          VIN <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("vin")}
              type="text"
              id="vin"
              name="vin"
              className="outline-none w-full"
            />
          </div>
          {errors.vin && (
            <p className="text-red-500 text-xs">{errors.vin.message}</p>
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
              className="outline-none w-full"
            />
          </div>
          {errors.plateNumber && (
            <p className="text-red-500 text-xs">{errors.plateNumber.message}</p>
          )}
        </div>

        {
          <>
            <label htmlFor="driver" className="block mb-0.5 font-medium">
              Driver
            </label>
            <div className="mb-5">
              <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
                <Controller
                  name="driver"
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={getNameFromId(field.value)}
                      onSelect={(selectedName) => {
                        // convert selected name back to ID before updating form state
                        const id = nameToIdMap.get(selectedName) || "";
                        field.onChange(id);
                      }}
                      options={options}
                      style="v1"
                    />
                  )}
                />
              </div>
              {errors.driver && (
                <p className="text-red-500 text-xs">{errors.driver.message}</p>
              )}
            </div>
          </>
        }
      </>
    </Modal>
  );
};

export default AddBus;

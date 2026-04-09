import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import useBuses, { BusQuery } from "../hooks/useBuses";
import { Driver } from "../hooks/useDrivers";
import DropDown from "./DropDown";
import Modal from "./Modal";
import useEditDriver from "../hooks/useEditDriver";
import { DriverDetails } from "../hooks/useAddDriver";

interface Props {
  effectTwo: () => void;
  companyId: string;
  driver: Driver;
}

const schema = z.object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters." }),
    lastName: z
      .string()
      .min(2, { message: "Last name name must be at least 2 characters." }),
      licenseNumber: z.string()
      .min(5, { message: "Please enter a valid license number." }),
    phoneNumber: z
      .string()
      .min(11, { message: "Please enter a valid phone number. starting with country code(eg:+250)" }),
    assignedBusId: z.string().min(1, { message: "Please enter a valid bus." }),
    status: z.string().min(1, { message: "Please enter a valid status." }),
  });
type FormData = z.infer<typeof schema>;

const EditDriver = ({ effectTwo, companyId, driver }: Props) => {
  const { data: buses } = useBuses(companyId, {} as BusQuery);
  if(!buses) return
  const currentBus = buses?.pages.flat()?.find(
    (bus) => bus.busId === driver.assignedBusId
  );
  const busOptions = [
    { id: "None", plateNumber: "None" },
    ...(buses?.pages.flat()?.map((b) => ({
      id: b.busId,
      plateNumber: b.plateNumber,
    })) || [])
  ];
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const editDriver = useEditDriver(companyId, driver.driverId);

  const onSubmit = async (data: DriverDetails) => {
    console.log("Edited!", data);
    editDriver.mutate(data);
    effectTwo();
  };

  return (
    <Modal
      title="Edit driver"
      actionOne="Edit"
      actionTwo="Cancel"
      effectOne={handleSubmit(onSubmit)}
      effectTwo={effectTwo}
      form
    >
      <>
        <label htmlFor="firstName" className="block mb-0.5 font-medium">
          First Name <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("firstName")}
              type="text"
              id="firstName"
              name="firstName"
              defaultValue={driver.firstName}
              className="outline-none w-full"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-xs">{errors.firstName.message}</p>
          )}
        </div>

        <label htmlFor="lastName" className="block mb-0.5 font-medium">
        Last Name <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("lastName")}
              type="text"
              id="lastName"
              name="lastName"
              defaultValue={driver.lastName}
              className="outline-none w-full"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-xs">{errors.lastName.message}</p>
          )}
        </div>
        <label htmlFor="licenseNumber" className="block mb-0.5 font-medium">
          License Number <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("licenseNumber")}
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              defaultValue={driver.licenseNumber}
              className="outline-none w-full"
            />
          </div>
          {errors.licenseNumber && (
            <p className="text-red-500 text-xs">{errors.licenseNumber.message}</p>
          )}
        </div>
        <label htmlFor="phoneNumber" className="block mb-0.5 font-medium">
          Phone number <span className="text-red-500 text-base">*</span>
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
            <input
              {...register("phoneNumber")}
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              defaultValue={driver.phoneNumber}
              className="outline-none w-full"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>

        {
          <>
            <label htmlFor="assignedBusId" className="block mb-0.5 font-medium">
              Bus
            </label>
            <div className="mb-5">
              <div className="ring ring-gray-200 mb-1 p-1 rounded-xs bg-white">
                <Controller
                  name="assignedBusId"
                  defaultValue={currentBus?.busId || ""}
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={field.value}
                      onSelect={field.onChange}
                      options={busOptions.map((d) => d.id)}
                      label={((busId)=>{
                        const match = busOptions.find((b) => b.id === busId);
                        return match ? match.plateNumber : "Unknown";
                    })
                    }
                      style="v1"
                    />
                  )}
                />
              </div>
              {errors.assignedBusId && (
                <p className="text-red-500 text-xs">{errors.assignedBusId.message}</p>
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
                  defaultValue={driver.status}
                  control={control}
                  render={({ field }) => (
                    <DropDown
                      value={field.value}
                      onSelect={field.onChange}
                      options={['Available', 'Unavailible']}
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

export default EditDriver;

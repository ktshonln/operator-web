import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import useAddAgent, { AgentDetails } from "../hooks/useAddAgent";
import useCompany from "../hooks/useCompany";
import { userRoles } from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import DropDown from "./DropDown";
import { useState } from "react";
const schema = z.object({
  inviteUserId: z
    .string()
    .min(2, { message: "Please enter a valid ID of the inviting user." }),
  companyId: z.string().min(2, { message: "Please enter a valid company ID" }),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().min(11, {
    message:
      "Please enter a valid phone number, starting with country code(eg:+250)",
  }),
  role: z.enum(userRoles, { message: "Please select a user role." }),
  branch: z.string().min(2, { message: "Please select a branch" }),
});
type FormData = z.infer<typeof schema>;

interface Props {
  companyId: string;
  userId: string;
}
const AddAgent = ({ companyId, userId }: Props) => {
  const { data: company } = useCompany(companyId);
  const [refreshKey, setRefreshKey] = useState(0)

  const values = {
    inviteUserId: userId,
    companyId: companyId,
    branch: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: userRoles[1],
  };

  const {
    register,
    handleSubmit,
    control,
    resetField,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), values });
  const addAgent = useAddAgent(companyId);

  const onSubmit = async (data: AgentDetails) => {
    console.log("Added!", data);
    addAgent.mutate(data);
    resetField('firstName'),
    resetField('lastName'),
    resetField('email'),
    resetField('phoneNumber'),
    resetField('branch')
    setRefreshKey(c=>c+1)
  };
  console.log("Invite user", userId);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="text-sm">
      <p className="font-bold text-sm w-fit mx-auto mb-3 dark:text-white">
        Add new user
      </p>
      <div className="flex justify-between">
        <p className="text-sm font-semibold dark:text-white">Add</p>
        <div>
          <div className="ring ring-gray-200 p-0.5 rounded-sm dark:text-white">
            <Controller
              name="role"
              defaultValue={userRoles[1]} // default to agent
              control={control}
              render={({ field }) => (
                <DropDown
                key={refreshKey} //Trick to make dropdown component refresh when key changes to prevent staleness after form submission
                  onSelect={field.onChange}
                  options={[...userRoles.slice(1)]} // Skip admin as a role
                  label={(choice) => camelCaseToTitle(choice)}
                  style="v2"
                />
              )}
            />
          </div>
          {errors.role && (
            <p className="text-red-500 text-xs">{errors.role.message}</p>
          )}
        </div>
      </div>
      <label
        htmlFor="firstName"
        className="block mb-0.5 font-medium dark:text-white"
      >
        First Name <span className="text-red-500 text-base">*</span>
      </label>
      <div className="mb-5">
        <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
          <input
            {...register("firstName")}
            type="text"
            id="firstName"
            name="firstName"
            className="outline-none w-full"
          />
        </div>
        {errors.firstName && (
          <p className="text-red-500 text-xs">{errors.firstName.message}</p>
        )}
      </div>
      <label
        htmlFor="lastName"
        className="block mb-0.5 font-medium dark:text-white"
      >
        Last Name <span className="text-red-500 text-base">*</span>
      </label>
      <div className="mb-5">
        <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
          <input
            {...register("lastName")}
            type="text"
            id="lastName"
            name="lastName"
            className="outline-none w-full"
          />
        </div>
        {errors.lastName && (
          <p className="text-red-500 text-xs">{errors.lastName.message}</p>
        )}
      </div>
      <label
        htmlFor="email"
        className="block mb-0.5 font-medium dark:text-white"
      >
        Email <span className="text-red-500 text-base">*</span>
      </label>
      <div className=" mb-5">
        <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
          <input
            {...register("email")}
            type="email"
            id="email"
            name="email"
            className="outline-none w-full"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email.message}</p>
        )}
      </div>
      <label
        htmlFor="phoneNumber"
        className="block mb-0.5 font-medium dark:text-white"
      >
        Phone Number <span className="text-red-500 text-base">*</span>
      </label>
      <div className="mb-5">
        <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
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
      <label
        htmlFor="branch"
        className="block mb-0.5 font-medium dark:text-white"
      >
        Branch <span className="text-red-500 text-base">*</span>
      </label>
      <div className="mb-5">
        <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:bg-black dark:text-white">
          <Controller
            name="branch"
            control={control}
            render={({ field }) => (
              <DropDown
              key={refreshKey+1}
                onSelect={field.onChange}
                options={["Select a branch", ...(company?.branches ?? "")]}
                style="v1"
              />
            )}
          />
        </div>
        {errors.branch && (
          <p className="text-red-500 text-xs">{errors.branch.message}</p>
        )}
      </div>
      <div className="text-sm font-medium flex items-center gap-14 mx-16">
        <button
          type="submit"
          className="bg-brand p-1.5 w-full text-white mt-1 rounded-xs cursor-pointer active:scale-95"
        >
          Add User
        </button>
      </div>
    </form>
  );
};

export default AddAgent;

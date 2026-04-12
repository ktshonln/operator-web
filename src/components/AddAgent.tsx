import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInviteUser } from "../hooks/useInviteUser";
import { camelCaseToTitle } from "../utils/helpers";
import DropDown from "./DropDown";
import { useState } from "react";

const schema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters." }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters." }),
    email: z
      .string()
      .email({ message: "Please enter a valid email." })
      .optional(),
    phoneNumber: z
      .string()
      .min(11, {
        message:
          "Please enter a valid phone number, starting with country code (eg: +250)",
      })
      .optional(),
    role: z.string().min(1, { message: "Please select a user role." }),
    locale: z.enum(["rw", "en", "fr"]).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phoneNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone number is required.",
        path: ["email"],
      });
    }
  });

type FormData = z.infer<typeof schema>;

interface Props {
  companyId: string;
  roles: string[];
  rolePermissions: Record<string, string[]>;
}

const AddAgent = ({ companyId, roles, rolePermissions }: Props) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const inviteUser = useInviteUser();

  const values: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: roles[0] ?? "",
    locale: "en",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: values,
  });

  const selectedRole = watch("role", values.role);

  const onSubmit: Parameters<typeof handleSubmit>[0] = async (data) => {
    inviteUser.mutate({
      first_name: data.firstName,
      last_name: data.lastName,
      role_slug: data.role,
      org_id: companyId,
      email: data.email || undefined,
      phone_number: data.phoneNumber || undefined,
      locale: data.locale || "en",
    });
    reset(values);
    setRefreshKey((c) => c + 1);
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
      <form onSubmit={handleSubmit(onSubmit)} className="text-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-auto">
            <div className="ring ring-gray-200 p-0.5 rounded-sm dark:text-white">
              <Controller
                name="role"
                defaultValue={roles[0] ?? ""}
                control={control}
                render={({ field }) => (
                  <DropDown
                    key={refreshKey}
                    onSelect={field.onChange}
                    options={roles}
                    label={(choice) => camelCaseToTitle(choice)}
                    value={field.value}
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

        {selectedRole && rolePermissions[selectedRole] && (
          <div className="mb-4 rounded-md bg-gray-50 p-3 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            <p className="font-semibold mb-2">
              Permissions for {camelCaseToTitle(selectedRole)}:
            </p>
            <div className="flex flex-wrap gap-2">
              {rolePermissions[selectedRole].map((permission) => (
                <span
                  key={permission}
                  className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] text-brand"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}

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
          Email
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
            <input
              {...register("email")}
              type="email"
              id="email"
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
          Phone Number
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
            <input
              {...register("phoneNumber")}
              type="text"
              id="phoneNumber"
              className="outline-none w-full"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>

        <label
          htmlFor="locale"
          className="block mb-0.5 font-medium dark:text-white"
        >
          Locale
        </label>
        <div className="mb-5">
          <div className="ring ring-gray-200 p-0.5 rounded-sm dark:text-white">
            <Controller
              name="locale"
              control={control}
              render={({ field }) => (
                <DropDown
                  key={refreshKey + 1}
                  onSelect={field.onChange}
                  options={["rw", "en", "fr"]}
                  label={(choice) => choice.toUpperCase()}
                  value={field.value}
                  style="v2"
                />
              )}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-brand p-2 w-full text-white rounded-sm cursor-pointer hover:brightness-95 active:scale-95 transition-all"
          >
            Invite User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAgent;

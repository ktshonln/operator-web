import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SettingsNav from "../components/SettingsNav";
import useUser from "../hooks/useUser";
import { useUpdateUserMe } from "../hooks/useUpdateUser";
import { camelCaseToTitle } from "../utils/helpers";
import { useToastStore } from "../stores/toastStore";

const profileSchema = z
  .object({
    first_name: z.string().min(2, { message: "First name is required." }),
    last_name: z.string().min(2, { message: "Last name is required." }),
    email: z
      .string()
      .email({ message: "Please enter a valid email." })
      .optional(),
    phone_number: z
      .string()
      .min(8, { message: "Please enter a valid phone number." })
      .optional(),
    notif_channel: z.enum(["sms", "email", "app", "all"]),
  })
  .refine((data) => Boolean(data.email || data.phone_number), {
    message: "Provide either an email or phone number.",
    path: ["email"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileSettings() {
  const { user, loading } = useUser();
  const updateUser = useUpdateUserMe();
  const showToast = useToastStore((state) => state.showToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      notif_channel: "all",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email ?? "",
        phone_number: user.phone_number ?? "",
        notif_channel: user.notif_channel ?? "all",
      });
    }
  }, [user, reset]);

  const roleLabel = user
    ? camelCaseToTitle(
        "roles" in user ? (user.roles[0] ?? user.user_type) : user.user_type,
      )
    : "User";

  const onSubmit = (values: ProfileFormValues) => {
    updateUser.mutate(values, {
      onSuccess: () => {
        showToast("Profile updated successfully.", "success");
      },
      onError: () => {
        showToast("Unable to update your profile.", "error");
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SettingsNav />
        <div className="mt-6">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SettingsNav />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <h1 className="font-bold text-2xl mb-4">Profile Settings</h1>
          <div className="grid gap-6 lg:grid-cols-[minmax(400px,500px)_1fr]">
            <div className="space-y-4">
              <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-full bg-brand/10 p-3 text-brand">
                    {user?.first_name?.[0] ?? "U"}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block mb-1 font-medium dark:text-white"
                    >
                      First Name
                    </label>
                    <input
                      {...register("first_name")}
                      id="first_name"
                      className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white text-sm outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block mb-1 font-medium dark:text-white"
                    >
                      Last Name
                    </label>
                    <input
                      {...register("last_name")}
                      id="last_name"
                      className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white text-sm outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-1 font-medium dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      {...register("email")}
                      id="email"
                      type="email"
                      className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white text-sm outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone_number"
                      className="block mb-1 font-medium dark:text-white"
                    >
                      Phone Number
                    </label>
                    <input
                      {...register("phone_number")}
                      id="phone_number"
                      type="tel"
                      className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white text-sm outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone_number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="notif_channel"
                      className="block mb-1 font-medium dark:text-white"
                    >
                      Notification Channel
                    </label>
                    <select
                      {...register("notif_channel")}
                      id="notif_channel"
                      className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white text-sm outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                    >
                      <option value="all">All</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="app">In-app</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-sm bg-brand px-4 py-2 text-white hover:brightness-95 transition-colors"
                  >
                    {isSubmitting ? "Saving..." : "Save profile"}
                  </button>
                </form>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                <h2 className="font-bold text-lg mb-4 dark:text-white">
                  Profile details
                </h2>
                <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex justify-between">
                    <span>Role</span>
                    <span>{roleLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email</span>
                    <span>{user?.email ?? "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone</span>
                    <span>{user?.phone_number ?? "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organization</span>
                    <span>{(user as any)?.org_id ?? "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;

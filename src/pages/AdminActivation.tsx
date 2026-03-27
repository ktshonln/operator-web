import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import useActivateOrganization from "../hooks/useActivateOrganization";
import Footer from "../components/Footer";

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm password." }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const AdminActivation = () => {
  const { activationToken } = useParams<{ activationToken?: string }>();
  const activateOrg = useActivateOrganization();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    activateOrg.mutate({
      token: activationToken || "",
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
    });

    reset();
  };

  return (
    <div className="relative bg-[#0A4370] font-heebo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 "
        viewBox="0 0 614 1024"
        fill="none"
      >
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="p-2 pt-10 sm:p-10 sm:pr-32 sm:pl-32">
        <div className="bg-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-screen flex justify-between">
          <div className="w-full lg:w-1/2 xl:w-1/3">
            <img
              src="/logoOne.svg"
              className="w-20 ml-5 mt-2 mb-7"
              alt="Katisha-logo"
            />
            <div className="m-12 mt-0">
              <h1 className="font-bold text-2xl mb-5">Account setup</h1>
              <p className="text-sm text-[#6A717D] mb-5">
                Finish setting up your admin account using the activation link.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="text-xs">
                <label
                  htmlFor="first_name"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  First Name (optional)
                </label>
                <input
                  {...register("first_name")}
                  type="text"
                  id="first_name"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none mb-4"
                />
                <label
                  htmlFor="last_name"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Last Name (optional)
                </label>
                <input
                  {...register("last_name")}
                  type="text"
                  id="last_name"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none mb-4"
                />
                <label
                  htmlFor="email"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none mb-4"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors.email.message}
                  </p>
                )}
                <label
                  htmlFor="password"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none mb-4"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors.password.message}
                  </p>
                )}
                <label
                  htmlFor="confirmPassword"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Confirm Password
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  id="confirmPassword"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none mb-4"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
                <button
                  disabled={activateOrg.isPending}
                  className="bg-[#0A4370] p-2 w-full text-white mt-3 rounded-sm cursor-pointer hover:text-[#0A4370] hover:bg-white hover:ring hover:ring-[#0A4370] active:scale-95 disabled:active:scale-none disabled:hover:ring-0 disabled:opacity-50 disabled:hover:bg-[#0A4370] disabled:hover:text-white disabled:cursor-not-allowed"
                >
                  {activateOrg.isPending ? "ACTIVATING..." : "ACTIVATE ACCOUNT"}
                </button>
              </form>
            </div>
            <p className="text-xs w-fit pb-3 mt-10 mx-auto sm:ml-12">
              Already have an account?
              <Link to="/login" className="text-brand cursor-pointer">
                {" "}
                Login
              </Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminActivation;

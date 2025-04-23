import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import Footer from "../components/Footer";
import useRegister, { User } from "../hooks/useRegister";

const schema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First Name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  userType: z
    .string()
    .min(3, { message: "User type must be at least 3 characters." }),
  companyName: z
    .string()
    .min(3, { message: "Company name must be at least 3 characters." }),
  companyRegNo: z
    .string()
    .min(5, { message: "Please enter a valid company registration number." }),
  companyAddress: z
    .string()
    .min(5, { message: "Company address must be at least 5 characters." }),
  companyContact: z.string().min(10, {
    message: "Company contact must start with a country code(e.g:+250).",
  }),
});

type FormData = z.infer<typeof schema>;

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const addUser = useRegister();

  const onSubmit = async (data: User) => {
    console.log("submitting");
    console.log(data);
    addUser.mutate(data);
    resetField("password");
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
          <div className="w-full">
            <img
              src="/logoOne.svg"
              className="w-20 ml-5 mt-2 "
              alt="Katisha-logo"
            />
            <h1 className="w-fit mx-auto font-bold text-2xl -mt-5 mb-5">
              Create your account
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="text-xs justify-self-center w-full px-32"
            >
              <div className="flex gap-48 items-baseline">
                <div className="w-full">
                  <h2 className="font-bold text-base mb-8">
                    Company information
                  </h2>
                  <label
                    htmlFor="companyName"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Name
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200  p-2 rounded-xs bg-white">
                      <input
                        {...register("companyName")}
                        type="text"
                        id="companyName"
                        name="companyName"
                        className=" outline-none w-full"
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-red-500 text-xs">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>
                  <label
                    htmlFor="regNo"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Registration Number
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200  p-2 rounded-xs bg-white">
                      <input
                        {...register("companyRegNo")}
                        type="text"
                        id="companyRegNo"
                        name="companyRegNo"
                        className="outline-none w-full"
                      />
                    </div>
                    {errors.companyRegNo && (
                      <p className="text-red-500 text-xs">
                        {errors.companyRegNo.message}
                      </p>
                    )}
                  </div>
                  <label
                    htmlFor="address"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Address
                  </label>
                  <div className=" mb-5">
                    <div className="ring ring-gray-200 p-2 rounded-xs bg-white">
                      <input
                        {...register("companyAddress")}
                        type="text"
                        id="companyAddress"
                        name="companyAddress"
                        className="outline-none w-full"
                      />
                    </div>
                    {errors.companyAddress && (
                      <p className="text-red-500 text-xs">
                        {errors.companyAddress.message}
                      </p>
                    )}
                  </div>
                  <label
                    htmlFor="contact"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Contact information
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200 p-2 rounded-xs bg-white">
                      <input
                        {...register("companyContact")}
                        type="text"
                        id="companyContact"
                        name="companyContact"
                        className="outline-none w-full"
                      />
                    </div>
                    {errors.companyContact && (
                      <p className="text-red-500 text-xs">
                        {errors.companyContact.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <h2 className="font-bold text-base mb-8">
                    Admin information
                  </h2>
                  <label
                    htmlFor="firstName"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    First Name
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200 p-2 rounded-xs bg-white">
                      <input
                        {...register("firstName")}
                        type="text"
                        id="firstName"
                        name="firstName"
                        className=" outline-none w-full"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-xs">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <label
                    htmlFor="lastName"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Last Name
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200 p-2 rounded-xs bg-white">
                      <input
                        {...register("lastName")}
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="outline-none w-full"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-xs">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <label
                    htmlFor="email"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Email
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200 p-2 rounded-xs bg-white">
                      <input
                        {...register("email")}
                        type="email"
                        id="email"
                        name="email"
                        className="outline-none w-full"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <label
                    htmlFor="password"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Password
                  </label>
                  <div className="mb-5">
                    <div className="ring ring-gray-200 p-2 rounded-xs bg-white">
                      <input
                        {...register("password")}
                        type="password"
                        id="password"
                        name="password"
                        className="outline-none w-full"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <input
                    {...register("userType")}
                    type="text"
                    id="userType"
                    name="userType"
                    value={"operator"}
                    className=" outline-none w-full hidden"
                  />
                </div>
              </div>
              <button
                disabled={addUser.isPending}
                type="submit"
                className="bg-[#0A4370] p-2 block pl-20 pr-20 w-fit mx-auto text-white mt-10 rounded-sm cursor-pointer hover:text-[#0A4370] hover:bg-white hover:ring hover:ring-[#0A4370] active:scale-95 disabled:active:scale-none disabled:hover:ring-0 disabled:opacity-50 disabled:hover:bg-[#0A4370] disabled:hover:text-white disabled:cursor-not-allowed"
              >
                {addUser.isPending ? "REGISTERING..." : "REGISTER"}
              </button>
            </form>
            <p className="text-xs w-fit pb-3 mt-10 mx-auto sm:ml-12">
              Already have an account?
              <Link to={"/"} className="text-brand cursor-pointer">
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

export default RegisterPage;

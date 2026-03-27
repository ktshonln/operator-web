import { BsTicketFill } from "react-icons/bs";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  contact: z.string().min(1, { message: "Please enter your email or phone number." }),
});

type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    console.log("Submitting forgot password for:", data);
    // Simulate API call
    setTimeout(() => {
      setIsPending(false);
      navigate("/login-mfa"); // Redirect to OTP verification
    }, 1500);
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
        <div className="bg-white dark:bg-neutral-900 dark:text-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-screen flex justify-between">
          <div className="w-full  lg:w-1/2 xl:w-1/3">
            <img
              src="/logoOne.svg"
              className="w-32 ml-5 mt-2 pt-5 mb-7 dark:invert"
              alt="Katisha-logo"
            />
            <div className="m-12 mt-0">
              <h1 className="text-2xl font-bold text-[#0A4370] dark:text-blue-400 mb-2">Forgot Password</h1>
              <p className="text-[#6A717D] text-sm mb-8">
                Enter your email or phone number and we'll send you a verification code to reset your password.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="text-xs">
                <label
                  htmlFor="contact"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Email or Phone Number
                </label>
                <div>
                  <div className="ring ring-gray-200 dark:ring-neutral-800 mb-5 p-2 rounded-xs bg-white dark:bg-neutral-900">
                    <input
                      {...register("contact")}
                      type="text"
                      id="contact"
                      name="contact"
                      placeholder="e.g. user@example.com or +250..."
                      className=" outline-none w-full bg-transparent"
                    />
                  </div>
                  {errors.contact && (
                    <p className="text-red-500 text-xs -mt-3 mb-3">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
                
                <button
                  disabled={isPending}
                  className="bg-[#0A4370] p-2 w-full text-white mt-5 rounded-sm cursor-pointer hover:text-[#0A4370] hover:bg-white dark:hover:bg-black hover:ring hover:ring-[#0A4370] active:scale-95 disabled:active:scale-none disabled:hover:ring-0 disabled:opacity-50 disabled:hover:bg-[#0A4370] disabled:hover:text-white disabled:cursor-not-allowed"
                >
                  {isPending ? "SENDING..." : "SEND VERIFICATION CODE"}
                </button>
              </form>
            </div>
            <p className="text-xs w-fit pb-5 mx-auto sm:ml-12 mt-4 cursor-pointer">
              Remembered your password?
              <Link to={"/login"} className="text-brand ml-1">
                Back to Login
              </Link>
            </p>
          </div>
          <div className=" absolute right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="aspect-[838/800] -mr-1  h-[200px] md:h-[255px] lg:h-[451px] xl:h-[547px]"
              viewBox="0 0 838 800"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M741.484 799.46L242.072 704.401C221.487 700.483 204.448 686.093 197.13 666.446L4.39013 149.048C-3.0883 128.973 0.699696 106.42 14.3287 89.8773L88.3733 0H813C826.807 0 838 11.1929 838 25V774.46C838 788.267 826.807 799.46 813 799.46H741.484Z"
                fill="#0A4370"
              />
            </svg>
          </div>
          <div className="absolute w-12 h-12 lg:w-32 lg:h-32 bg-[#6A717D]/25 top-8 right-12 lg:right-24 rounded-full" />
          <div className="absolute w-5 h-5 lg:w-14 lg:h-14 bg-[#6A717D]/25 top-8 right-40 lg:right-[450px] rounded-full" />
          <div className="absolute w-20 h-20 -z-10 lg:z-0 lg:w-56 lg:h-56 bg-[#6A717D]/25 top-52 right-24 lg:right-52 rounded-full" />
          <BsTicketFill className="absolute lg:w-14 lg:h-14 rotate-45 top-28 right-1/3 fill-[#6A717D]/25" />
          <BsTicketFill className="absolute lg:w-18 lg:h-18 rotate-45 top-64 right-2 fill-[#6A717D]/25" />
          <BsTicketFill className="absolute lg:w-7 lg:h-7 rotate-[30deg] bottom-20 right-52 fill-[#6A717D]/25" />
          <p className="absolute md:bottom-3/4 lg:bottom-80 xl:bottom-1/2 top-5 md:top-auto -right-5 sm:-right-3 md:right-0 font-semibold md:text-lg lg:text-2xl  text-white max-w-40 md:max-w-52 lg:max-w-96 xl:max-w-[450px]">
            Making travel simpler, smarter, and more convenient for everyone.{" "}
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ForgotPassword;

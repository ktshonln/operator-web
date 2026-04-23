import { BsTicketFill } from "react-icons/bs";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToastStore } from "../stores/toastStore";
import authService from "../services/authService";

const schema = z.object({
  identifier: z.string().min(1, { message: "Please enter your email or phone number." }),
});
type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const response = await authService.forgotPassword({ identifier: data.identifier });
      const expiresIn = response?.expires_in || 300;
      showToast("Verification code sent", "success");
      navigate(`/verify-password-reset?identifier=${encodeURIComponent(data.identifier)}&expires_in=${expiresIn}`);
    } catch (error: any) {
      showToast(error.message || "Failed to send verification code", "error");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
      <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 pointer-events-none" viewBox="0 0 614 1024" fill="none">
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="relative p-4 pt-8 sm:p-10">
        <div className="bg-white dark:bg-neutral-900 dark:text-white relative drop-shadow-lg rounded-2xl w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 overflow-hidden">
          <div className="w-full lg:w-1/2 xl:w-2/5 p-8 sm:p-12">
            <img src="/logoOne.svg" className="w-28 mb-6 dark:invert" alt="Katisha" />
            <h1 className="text-2xl font-bold text-[#0A4370] dark:text-brand mb-2">Forgot Password</h1>
            <p className="text-[#6A717D] text-sm mb-8">Enter the email or phone number associated with your account and we'll send you a verification code.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="text-[#6A717D] block mb-1 text-xs font-medium">Email or Phone Number</label>
                <div className="ring ring-gray-200 dark:ring-neutral-700 p-2 rounded-sm bg-white dark:bg-neutral-900">
                  <input {...register("identifier")} type="text" id="identifier" placeholder="e.g. user@example.com or +250780000001" className="outline-none w-full text-sm dark:text-white dark:bg-neutral-900" disabled={isPending} />
                </div>
                {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
              </div>
              <button disabled={isPending} className="w-full bg-[#0A4370] text-white py-2.5 rounded-sm font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isPending ? "Sending..." : "Send Verification Code"}
              </button>
            </form>

            <p className="text-xs text-center mt-6 text-neutral-500">
              Remembered your password?{" "}
              <Link to="/login" className="text-brand hover:underline">Back to Login</Link>
            </p>
          </div>
          <div className="hidden lg:block absolute right-0 top-0 h-full pointer-events-none select-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[838/800] -mr-1 h-full" viewBox="0 0 838 800" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M741.484 799.46L242.072 704.401C221.487 700.483 204.448 686.093 197.13 666.446L4.39013 149.048C-3.0883 128.973 0.699696 106.42 14.3287 89.8773L88.3733 0H813C826.807 0 838 11.1929 838 25V774.46C838 788.267 826.807 799.46 813 799.46H741.484Z" fill="#0A4370" />
            </svg>
            <BsTicketFill className="absolute w-14 h-14 rotate-45 top-28 right-1/3 fill-[#6A717D]/25" />
            <BsTicketFill className="absolute w-7 h-7 rotate-[30deg] bottom-20 right-52 fill-[#6A717D]/25" />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ForgotPassword;

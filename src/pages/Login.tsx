import { BsTicketFill } from "react-icons/bs";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import useLogin from "../hooks/useLogin";

const schema = z.object({
  identifier: z.string().min(3, { message: "Please enter email or phone." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});
type FormData = z.infer<typeof schema>;

// Shared decorative right panel — hidden on mobile
const DecorativePanel = ({ tagline }: { tagline?: string }) => (
  <div className="hidden lg:block absolute right-0 top-0 h-full pointer-events-none select-none">
    <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[838/800] -mr-1 h-full" viewBox="0 0 838 800" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M741.484 799.46L242.072 704.401C221.487 700.483 204.448 686.093 197.13 666.446L4.39013 149.048C-3.0883 128.973 0.699696 106.42 14.3287 89.8773L88.3733 0H813C826.807 0 838 11.1929 838 25V774.46C838 788.267 826.807 799.46 813 799.46H741.484Z" fill="#0A4370" />
    </svg>
    <div className="absolute w-32 h-32 bg-[#6A717D]/25 top-8 right-24 rounded-full" />
    <div className="absolute w-14 h-14 bg-[#6A717D]/25 top-8 right-[450px] rounded-full" />
    <div className="absolute w-56 h-56 bg-[#6A717D]/25 top-52 right-52 rounded-full" />
    <BsTicketFill className="absolute w-14 h-14 rotate-45 top-28 right-1/3 fill-[#6A717D]/25" />
    <BsTicketFill className="absolute w-18 h-18 rotate-45 top-64 right-2 fill-[#6A717D]/25" />
    <BsTicketFill className="absolute w-7 h-7 rotate-[30deg] bottom-20 right-52 fill-[#6A717D]/25" />
    {tagline && (
      <p className="absolute bottom-1/2 right-0 font-semibold text-2xl text-white max-w-[450px] pr-4">
        {tagline}
      </p>
    )}
  </div>
);

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const loginUser = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: FormData) => {
    loginUser.mutate({ identifier: data.identifier, password: data.password, user_type: "staff", device_name: "web" });
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
            <p className="text-[#6A717D] text-sm mb-1">Welcome to</p>
            <img src="/logoTwo.svg" className="mb-8 w-28 dark:invert" alt="Katisha" />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="text-[#6A717D] block mb-1 text-xs font-medium">Email or Phone</label>
                <div className="ring ring-gray-200 dark:ring-neutral-700 p-2 rounded-sm bg-white dark:bg-neutral-900">
                  <input {...register("identifier")} type="text" id="identifier" className="outline-none w-full text-sm dark:text-white dark:bg-neutral-900" />
                </div>
                {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="text-[#6A717D] block mb-1 text-xs font-medium">Password</label>
                <div className="ring ring-gray-200 dark:ring-neutral-700 p-2 rounded-sm bg-white dark:bg-neutral-900 flex items-center gap-2">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="outline-none flex-1 text-sm dark:text-white dark:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs text-brand hover:underline">Forgot Password?</Link>
                </div>
              </div>

              <button
                disabled={loginUser.isPending}
                className="w-full bg-[#0A4370] text-white py-2.5 rounded-sm font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {loginUser.isPending ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-xs text-center mt-6 text-neutral-500">
              No account yet?{" "}
              <Link to="/register" className="text-brand hover:underline">Register</Link>
            </p>
          </div>
          <DecorativePanel tagline="Making travel simpler, smarter, and more convenient for everyone." />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LoginPage;

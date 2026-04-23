import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import useActivateOrganization from "../hooks/useActivateOrganization";
import Footer from "../components/Footer";

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm password." }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const AdminActivation = () => {
  const { activationToken } = useParams<{ activationToken?: string }>();
  const activateOrg = useActivateOrganization();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    if (data.password !== data.confirmPassword) return;
    activateOrg.mutate({
      token: activationToken || "",
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
    });
    reset();
  };

  const inputClass = "ring ring-gray-200 p-2 rounded-sm bg-white w-full outline-none text-sm mb-1";
  const labelClass = "text-[#6A717D] block mb-1 text-xs font-medium";

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
      <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 pointer-events-none" viewBox="0 0 614 1024" fill="none">
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="relative p-4 pt-8 sm:p-10">
        <div className="bg-white relative drop-shadow-lg rounded-2xl w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 overflow-hidden">
          <div className="w-full lg:w-1/2 xl:w-2/5 p-8 sm:p-12">
            <img src="/logoOne.svg" className="w-28 mb-6" alt="Katisha" />
            <h1 className="font-bold text-2xl mb-2 text-[#0A4370]">Account setup</h1>
            <p className="text-sm text-[#6A717D] mb-6">Finish setting up your admin account using the activation link.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name (optional)</label>
                  <input {...register("first_name")} type="text" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name (optional)</label>
                  <input {...register("last_name")} type="text" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email *</label>
                <input {...register("email")} type="email" className={inputClass} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Password *</label>
                <input {...register("password")} type="password" className={inputClass} />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input {...register("confirmPassword")} type="password" className={inputClass} />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
              </div>

              <button
                disabled={activateOrg.isPending}
                className="w-full bg-[#0A4370] text-white py-2.5 rounded-sm font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {activateOrg.isPending ? "Activating..." : "Activate Account"}
              </button>
            </form>

            <p className="text-xs text-center mt-6 text-neutral-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand hover:underline">Login</Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminActivation;

import { BsTicketFill } from "react-icons/bs";
import Footer from "../components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToastStore } from "../stores/toastStore";
import authService from "../services/authService";

const schema = z
  .object({
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const VerifyPasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);

  const identifier = searchParams.get("identifier");
  const expiresIn = searchParams.get("expires_in");
  const [timeLeft, setTimeLeft] = useState(
    expiresIn ? parseInt(expiresIn) : 300,
  );
  const [isPending, setIsPending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      navigate("/forgot-password");
    }
  }, [identifier, navigate]);

  // Format identifier for display (hide most of phone/email)
  const formatContactDisplay = () => {
    if (!identifier) return "";
    if (identifier.includes("@")) {
      const [name, domain] = identifier.split("@");
      return `${name.substring(0, 2)}***@${domain}`;
    }
    // Phone: +250780000001 → +250***0001
    return (
      identifier.substring(0, 4) +
      "***" +
      identifier.substring(identifier.length - 4)
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timeLeft === 0 && identifier) {
      try {
        setIsPending(true);
        await authService.forgotPassword({ identifier });
        setTimeLeft(300);
        setOtpError("");
        setPasswordError("");
        showToast("Verification code sent", "success");
      } catch (error) {
        showToast("Failed to resend code", "error");
      } finally {
        setIsPending(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!identifier) {
      showToast("Session expired", "error");
      navigate("/forgot-password");
      return;
    }

    setIsPending(true);
    setOtpError("");
    setPasswordError("");

    try {
      await authService.resetPassword({
        identifier,
        otp: data.otp,
        new_password: data.password,
      });
      showToast("Password reset successfully", "success");
      navigate("/login");
    } catch (error: any) {
      let errorMessage = "Failed to reset password";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (
        errorMessage.toLowerCase().includes("otp") ||
        errorMessage.toLowerCase().includes("verification")
      ) {
        setOtpError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordError(errorMessage);
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative bg-[#0A4370] font-heebo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="aspect-[614/1024] absolute lg:w-1/2 bottom-0"
        viewBox="0 0 614 1024"
        fill="none"
      >
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="p-2 pt-10 sm:p-10 sm:pr-32 sm:pl-32">
        <div className="bg-white dark:bg-neutral-900 dark:text-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-screen flex justify-between">
          <div className="w-full lg:w-1/2 xl:w-1/3">
            <img
              src="/logoOne.svg"
              className="w-32 ml-5 mt-2 pt-5 mb-7 dark:invert"
              alt="Katisha-logo"
            />
            <div className="m-12 mt-0 mb-20">
              <h1 className="text-2xl font-bold text-[#0A4370] dark:text-brand mb-2">
                Reset Password
              </h1>
              <p className="font-medium text-sm mb-1">
                We sent a verification code to:
              </p>
              <p className="text-brand text-sm font-semibold mb-6">
                {formatContactDisplay()}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="text-xs">
                <label
                  htmlFor="otp"
                  className="text-[#6A717D] block mb-2 text-xs font-medium"
                >
                  Verification Code
                </label>
                <div className="relative mb-6 flex items-center gap-x-3 justify-between text-xl">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoFocus={index === 0}
                      disabled={isPending}
                      className="ring ring-gray-200 dark:ring-neutral-700 text-center w-10 sm:w-12 h-10 sm:h-12 p-2 rounded-xs bg-white dark:bg-neutral-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:ring-brand disabled:opacity-50"
                    />
                  ))}
                  {otpError && (
                    <div className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                      {otpError}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="text-[#6A717D] block mb-2 text-xs font-medium"
                  >
                    New Password
                  </label>
                  <div className="ring ring-gray-200 dark:ring-neutral-700 mb-2 p-2 rounded-xs bg-white dark:bg-neutral-800">
                    <input
                      {...register("password")}
                      type="password"
                      id="password"
                      placeholder="At least 8 characters"
                      className="outline-none w-full bg-transparent dark:text-white"
                      disabled={isPending}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs">
                      {errors.password.message}
                    </p>
                  )}
                  {passwordError && (
                    <p className="text-red-500 text-xs">{passwordError}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="confirmPassword"
                    className="text-[#6A717D] block mb-2 text-xs font-medium"
                  >
                    Confirm Password
                  </label>
                  <div className="ring ring-gray-200 dark:ring-neutral-700 mb-2 p-2 rounded-xs bg-white dark:bg-neutral-800">
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm password"
                      className="outline-none w-full bg-transparent dark:text-white"
                      disabled={isPending}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <p className="text-xs mb-4">
                  Didn't get code?
                  {timeLeft > 0 ? (
                    <span className="text-neutral-500 ml-2">
                      Wait {timeLeft}s to resend
                    </span>
                  ) : (
                    <span
                      onClick={handleResend}
                      className="text-brand cursor-pointer ml-2 hover:underline"
                    >
                      Click to resend
                    </span>
                  )}
                </p>

                <div className="mt-4 flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={isPending || timeLeft <= 0}
                    className="bg-[#0A4370] p-2 w-full text-white rounded-sm cursor-pointer hover:text-[#0A4370] hover:bg-white dark:hover:bg-neutral-800 hover:ring hover:ring-[#0A4370] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "RESETTING..." : "RESET PASSWORD"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    disabled={isPending}
                    className="ring ring-gray-300 dark:ring-neutral-700 p-2 w-full text-neutral-500 dark:text-neutral-400 rounded-sm cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    BACK TO LOGIN
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right side decorations */}
          <div className="absolute right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="aspect-[838/800] -mr-1 h-[200px] md:h-[255px] lg:h-[451px] xl:h-[547px]"
              viewBox="0 0 838 800"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
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
          <p className="absolute md:bottom-3/4 lg:bottom-80 xl:bottom-1/2 top-5 md:top-auto -right-5 sm:-right-3 md:right-0 font-semibold md:text-lg lg:text-2xl text-white max-w-40 md:max-w-52 lg:max-w-96 xl:max-w-[450px]">
            Making travel simpler, smarter, and more convenient for everyone.
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default VerifyPasswordReset;

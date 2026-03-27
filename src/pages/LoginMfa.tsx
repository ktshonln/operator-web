import { BsTicketFill } from "react-icons/bs";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useVerifyPhone, useResendOtp } from "../hooks/useAuth";
import { useRegStore } from "../stores/regStore";
import { FullSchema } from "./Register";

const LoginMfa = () => {
  const navigate = useNavigate();
  const { formData } = useRegStore();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyPhone();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  if (!formData) {
    navigate("/register");
  }

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
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

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(60);
      // Logic to resend OTP
      if (formData.contact_phone) {
        resendOtp(
          { phone_number: formData.contact_phone },
          {
            onSuccess: () => setTimeLeft(60),
          },
        );
      }
    }
  };

  if (!formData.userId) {
    navigate("/register");
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("* 6-digit OTP required");
      return;
    }
    setError("");
    const finalData = { ...formData, otp: otp.join("") };
    const result = FullSchema.safeParse(finalData);
    if (result.success && formData.userId) {
      verifyOtp(
        { user_id: formData.userId, otp: otp.join("") },
        {
          onSuccess: () => navigate("/register/success"),
        },
      );
    }
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
          <div className="w-full  lg:w-1/2 xl:w-1/3">
            <img
              src="/logoOne.svg"
              className="w-20 ml-5 mt-2 mb-7"
              alt="Katisha-logo"
            />
            <div className="m-12 mt-0 mb-[134px]">
              <form onSubmit={handleVerify} className="text-xs">
                <p className="text-sm font-bold">Enter verification code</p>
                <p className="font-medium">
                  We've sent a code to{" "}
                  <span className="text-brand2">{formData.contact_phone}</span>
                </p>

                <div className="relative mt-14 mb-14 flex items-center gap-x-3 justify-between text-xl">
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
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoFocus={index === 0}
                      className="ring ring-gray-200 text-center w-10 sm:w-12 h-10 sm:h-12 p-2 rounded-xs bg-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:ring-brand"
                    />
                  ))}
                  {error && (
                    <div className=" absolute bottom-[-20px] left-0 text-red-500 text-xs">
                      {error}
                    </div>
                  )}
                </div>
                <p className="text-xs">
                  Didn't get code?
                  {timeLeft > 0 ? (
                    <span className="text-neutral-500 ml-2">
                      Wait {timeLeft}s to resend
                    </span>
                  ) : (
                    <span
                      onClick={handleResend}
                      className="text-brand cursor-pointer ml-2"
                    >
                      Click to resend
                    </span>
                  )}
                </p>
                <div className="mt-3 flex items-center space-x-5">
                  <button
                    disabled={isVerifying}
                    type="submit"
                    className="bg-[#0A4370] p-2 w-full text-white rounded-sm cursor-pointer hover:text-[#0A4370] hover:bg-white hover:ring hover:ring-[#0A4370] active:scale-95"
                  >
                    {isVerifying ? "Verifying..." : "VERIFY"}
                  </button>
                  <button
                    type="button"
                    className="ring ring-gray-300 p-2 w-full text-neutral-500 rounded-sm cursor-pointer hover:bg-neutral-400 hover:text-white active:scale-95"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
            <p className="text-xs w-fit pb-3 mx-auto sm:ml-12">
              No account yet?
              <Link to={"/register"} className="text-brand cursor-pointer">
                {" "}
                Register
              </Link>
            </p>
          </div>
          <div className=" absolute right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="aspect-[838/800] -mr-1  h-[200px] md:h-[255px] lg:h-[451px] xl:h-[535px]"
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
            Making travel simpler, smarter, and more convenient for
            everyone.{" "}
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LoginMfa;

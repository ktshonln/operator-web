import { BsTicketFill } from "react-icons/bs";
import Footer from "../components/Footer";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useVerify2FA from "../hooks/useVerify2FA";
import useVerifyLogin from "../hooks/useVerifyLogin";
import { useResendOtp2FA, useResendOtp } from "../hooks/useAuth";

// ─── Decorative right panel (shared with Login) ───────────────────────────────

const DecorativePanel = () => (
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
    <p className="absolute bottom-1/2 right-0 font-semibold text-2xl text-white max-w-[450px] pr-4">
      Making travel simpler, smarter, and more convenient for everyone.
    </p>
  </div>
);

const LoginMfa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Determine mode: "2fa" (has 2FA enabled) or "verify" (account not yet verified)
  const mode = searchParams.get("mode") ?? "2fa";
  const channel = (searchParams.get("channel") ?? "phone") as "phone" | "email";
  const expiresIn = searchParams.get("expires_in");

  // The correct pending ID depending on mode
  const userId2fa = localStorage.getItem("user_id_pending_2fa") ?? "";
  const userIdVerify = localStorage.getItem("user_id_pending_verification") ?? "";
  const userId = mode === "verify" ? userIdVerify : userId2fa;

  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const expiresInValue = Number(expiresIn);
  const [timeLeft, setTimeLeft] = useState(expiresInValue > 0 ? expiresInValue : 60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── The right hook for the right mode ────────────────────────────────────
  const verify2FA = useVerify2FA();
  const verifyLogin = useVerifyLogin();
  const resendOtp2FA = useResendOtp2FA();
  const resendOtp = useResendOtp();

  const isPending = mode === "verify" ? verifyLogin.isPending : verify2FA.isPending;
  const mutationError = mode === "verify" ? verifyLogin.error : verify2FA.error;

  useEffect(() => {
    if (timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timeLeft]);

  // Redirect if no pending user ID
  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value !== "" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timeLeft !== 0 || isPending) return;
    if (mode === "verify") {
      resendOtp.mutate(
        { user_id: userId, channel },
        { onSuccess: () => setTimeLeft(60) }
      );
    } else {
      resendOtp2FA.mutate(
        { user_id: userId },
        { onSuccess: () => setTimeLeft(60) }
      );
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    if (!userId) {
      setError("Session expired. Please log in again.");
      navigate("/login");
      return;
    }
    setError("");

    if (mode === "verify") {
      verifyLogin.mutate({ user_id: userId, otp: code, channel });
    } else {
      verify2FA.mutate({ user_id: userId, otp: code });
    }
  };

  const subtitle =
    mode === "verify"
      ? `We sent a code to your ${channel === "email" ? "email address" : "phone number"}`
      : "We sent a code to your registered phone number";

  const isResendPending = mode === "verify" ? resendOtp.isPending : resendOtp2FA.isPending;

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
      <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 pointer-events-none" viewBox="0 0 614 1024" fill="none">
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="relative p-4 pt-8 sm:p-10">
        <div className="bg-white dark:bg-neutral-900 relative drop-shadow-lg rounded-2xl w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 overflow-hidden min-h-[480px]">
          <div className="w-full lg:w-1/2 xl:w-2/5 p-8 sm:p-12">
            <img src="/logoOne.svg" className="w-28 mb-8 dark:invert" alt="Katisha" />

            <form onSubmit={handleVerify} className="text-xs space-y-6">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">Enter verification code</p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-xs">{subtitle}</p>
              </div>

              {/* OTP inputs */}
              <div className="relative flex items-center gap-x-3 justify-between text-xl">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    autoFocus={index === 0}
                    disabled={isPending}
                    className="ring ring-gray-200 dark:ring-neutral-700 text-center w-10 sm:w-12 h-10 sm:h-12 p-2 rounded-sm bg-white dark:bg-neutral-900 dark:text-white outline-none focus:ring-brand disabled:opacity-50 transition-all"
                  />
                ))}
              </div>

              {/* Error */}
              {(error || mutationError) && (
                <p className="text-red-500 text-xs -mt-2">
                  {error || mutationError?.message || "Verification failed. Please try again."}
                </p>
              )}

              {/* Resend */}
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Didn't get the code?{" "}
                {timeLeft > 0 ? (
                  <span className="ml-1">Wait {timeLeft}s to resend</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResendPending}
                    className={`ml-1 text-brand ${isResendPending ? "opacity-50 cursor-not-allowed" : "hover:underline cursor-pointer"}`}
                  >
                    {isResendPending ? "Resending..." : "Resend code"}
                  </button>
                )}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-[#0A4370] py-2.5 text-white rounded-sm font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isPending ? "Verifying..." : "Verify"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={isPending}
                  className="flex-1 ring ring-gray-300 dark:ring-neutral-700 py-2.5 text-neutral-500 dark:text-neutral-400 rounded-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-xs text-center mt-8 text-neutral-500">
              No account yet?{" "}
              <Link to="/register" className="text-brand hover:underline">Register</Link>
            </p>
          </div>

          <DecorativePanel />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LoginMfa;

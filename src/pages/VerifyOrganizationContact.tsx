import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToastStore } from "../stores/toastStore";
import {
  useVerifyOrganizationContact,
  useResendOrganizationVerificationOtp,
} from "../hooks/useOrganizationApplications";

const VerifyOrganizationContact = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);
  const verifyContact = useVerifyOrganizationContact();
  const resendOtp = useResendOrganizationVerificationOtp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const orgId = searchParams.get("org_id") || "";

  useEffect(() => {
    if (!orgId) {
      showToast("Missing organization identifier.", "error");
      navigate("/register");
    }
  }, [orgId, navigate, showToast]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setError("");
    setIsPending(true);

    verifyContact.mutate(
      { org_id: orgId, otp: code },
      {
        onSuccess: () => {
          showToast("Organization contact verified successfully", "success");
          navigate("/register/success");
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.error?.message ||
            err?.message ||
            "Verification failed.";
          setError(message);
          setIsPending(false);
        },
      },
    );
  };

  const handleResend = async () => {
    if (!orgId || resendCooldown > 0) return;

    setError("");
    resendOtp.mutate(orgId, {
      onSuccess: () => {
        setResendCooldown(30);
        setOtp(["", "", "", "", "", ""]);
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          "Unable to resend code.";
        setError(message);
      },
    });
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="aspect-[614/1024] absolute lg:w-1/2 bottom-0"
        viewBox="0 0 614 1024"
        fill="none"
      >
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="p-2 pt-10 sm:p-10 sm:pr-32 sm:pl-32">
        <div className="bg-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-screen flex justify-between">
          <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto p-8">
            <img
              src="/logoOne.svg"
              className="w-28 mx-auto mb-6"
              alt="Katisha-logo"
            />
            <h1 className="text-2xl font-bold text-[#0A4370] mb-4">
              Verify your organization
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter the 6-digit code sent to your organization contact email.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              <div>
                <label className="text-[#6A717D] block mb-2 text-xs font-medium">
                  Verification code
                </label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-12 h-12 text-center text-xl ring ring-gray-200 rounded-xs bg-white outline-none"
                      disabled={isPending}
                    />
                  ))}
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#0A4370] text-white py-3 rounded-sm disabled:opacity-50"
              >
                {isPending ? "VERIFYING..." : "Verify contact"}
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500">
              <p>
                Didn’t receive the code? We sent it to the email address you
                provided during registration.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendOtp.isPending}
                className="w-full border border-[#0A4370] text-[#0A4370] py-3 rounded-sm disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : resendOtp.isPending
                    ? "Resending..."
                    : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOrganizationContact;

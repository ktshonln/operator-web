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
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const orgId = searchParams.get("org_id") || "";
  const orgName = searchParams.get("org_name") || "";
  const orgType = searchParams.get("org_type") || "";

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
      { org_id: orgId, otp: code, channel },
      {
        onSuccess: () => {
          showToast("Organization contact verified successfully", "success");
          navigate(`/register/success?org_name=${encodeURIComponent(orgName)}&org_type=${encodeURIComponent(orgType)}`);
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          let message = "Verification failed.";
          
          if (code === "INVALID_OTP") {
            message = "The code you entered is incorrect.";
          } else if (code === "OTP_EXPIRED") {
            message = "This code has expired. Please request a new one.";
          } else if (code === "CONTACT_ALREADY_VERIFIED") {
            showToast("This contact has already been verified.", "success");
            navigate(`/register/success?org_name=${encodeURIComponent(orgName)}&org_type=${encodeURIComponent(orgType)}`);
            return;
          } else {
            message = err?.response?.data?.error?.message || err?.message || message;
          }
          
          setError(message);
          setIsPending(false);
        },
      },
    );
  };

  const handleResend = async () => {
    if (!orgId || resendCooldown > 0) return;

    setError("");
    resendOtp.mutate({ org_id: orgId, channel }, {
      onSuccess: () => {
        setResendCooldown(30);
        setOtp(["", "", "", "", "", ""]);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        let message = "Unable to resend code.";
        
        if (code === "OTP_FLOW_NOT_INITIATED") {
          message = "No verification flow found. Please restart the application process.";
        } else if (code === "CONTACT_ALREADY_VERIFIED") {
          showToast("This contact has already been verified.", "success");
          navigate(`/register/success?org_name=${encodeURIComponent(orgName)}&org_type=${encodeURIComponent(orgType)}`);
          return;
        } else {
          message = err?.response?.data?.error?.message || err?.message || message;
        }
        
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
      <div className="p-4 pt-8 sm:p-10">
        <div className="bg-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-lg mx-auto overflow-hidden">
          <div className="p-8 sm:p-10">
            <img
              src="/logoOne.svg"
              className="w-28 mx-auto mb-6"
              alt="Katisha-logo"
            />
            
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">Application Details</span>
                </div>
                <div className="w-12 h-0.5 bg-brand mx-2"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-brand">Verify Contact</span>
                </div>
              </div>
            </div>

            {orgName && (
              <p className="text-sm text-gray-600 mb-2">
                Organization: <span className="font-semibold text-[#0A4370]">{orgName}</span>
              </p>
            )}
            <h1 className="text-2xl font-bold text-[#0A4370] mb-4">
              Verify your contact
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              We've sent verification codes to your phone and email. Enter either one to confirm your application.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Channel selector */}
              <div>
                <label className="text-[#6A717D] block mb-2 text-xs font-medium">
                  Which code did you receive?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel("phone")}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      channel === "phone"
                        ? "border-[#0A4370] bg-[#0A4370] text-white"
                        : "border-gray-200 text-gray-700 hover:border-[#0A4370]"
                    }`}
                  >
                    Phone (SMS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      channel === "email"
                        ? "border-[#0A4370] bg-[#0A4370] text-white"
                        : "border-gray-200 text-gray-700 hover:border-[#0A4370]"
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

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
                Didn't receive the code? Check your {channel === "phone" ? "phone messages" : "email inbox"} (including spam folder).
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
                    : `Resend code to ${channel === "phone" ? "phone" : "email"}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOrganizationContact;

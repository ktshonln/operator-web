import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { axiosInstance } from "../services/apiClient";
import Footer from "../components/Footer";

interface InviteInfo {
  first_name: string;
  channels: ("phone" | "email")[];
  masked_phone?: string | null;
  masked_email?: string | null;
}

type Step = "loading" | "invalid" | "set-password" | "done";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  // Spec uses ?t=, legacy uses ?token=
  const token = searchParams.get("t") || searchParams.get("token");
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("loading");
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [invalidReason, setInvalidReason] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successChannels, setSuccessChannels] = useState<string[]>([]);

  // Step 1: validate the token on mount
  useEffect(() => {
    if (!token) {
      setInvalidReason("No invitation token found in the URL.");
      setStep("invalid");
      return;
    }
    axiosInstance.get(`/auth/invite/validate?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setInviteInfo(res.data);
        setStep("set-password");
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 410) setInvalidReason("This invitation link has expired. Please ask your administrator to resend it.");
        else setInvalidReason("This invitation link is invalid or has already been used.");
        setStep("invalid");
      });
  }, [token]);

  // Step 2: set password → POST /users/accept-invite
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/users/accept-invite", { token, password });
      if (res.data?.user_id) {
        localStorage.setItem("user_id_pending_verification", res.data.user_id);
      }
      setSuccessChannels(res.data?.channels ?? []);
      setStep("done");
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVALID_TOKEN") setError("This invitation link is invalid or has already been used.");
      else if (code === "TOKEN_EXPIRED") setError("This invitation link has expired.");
      else if (code === "PHONE_ALREADY_REGISTERED" || code === "EMAIL_ALREADY_REGISTERED") setError("An account with this contact already exists. Try logging in instead.");
      else setError(err?.response?.data?.message || "Failed to set up account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full text-sm border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2.5 bg-white dark:bg-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
      <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 pointer-events-none" viewBox="0 0 614 1024" fill="none">
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="relative p-4 pt-8 sm:p-10">
        <div className="bg-white dark:bg-neutral-950 relative drop-shadow-lg rounded-2xl w-full max-w-md mx-auto overflow-hidden">
          <div className="p-8 sm:p-10">
            <img src="/logoOne.svg" className="w-24 mb-6 dark:invert" alt="Katisha" />

            {/* Loading */}
            {step === "loading" && (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
                <p className="text-sm text-neutral-500">Validating your invitation...</p>
              </div>
            )}

            {/* Invalid */}
            {step === "invalid" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">Invalid Invitation</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{invalidReason}</p>
                <Link to="/login" className="text-sm text-brand hover:underline">Back to Login</Link>
              </div>
            )}

            {/* Set password */}
            {step === "set-password" && inviteInfo && (
              <div>
                <h2 className="font-bold text-xl text-[#0A4370] dark:text-white mb-1">
                  Welcome, {inviteInfo.first_name}!
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  Set a password to activate your account.
                </p>

                {/* Show where OTP will be sent */}
                {(inviteInfo.masked_email || inviteInfo.masked_phone) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-5 text-xs text-blue-700 dark:text-blue-300">
                    After setting your password, a verification code will be sent to:
                    <div className="mt-1 font-medium">
                      {inviteInfo.masked_email && <div>✉️ {inviteInfo.masked_email}</div>}
                      {inviteInfo.masked_phone && <div>📱 {inviteInfo.masked_phone}</div>}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required minLength={8}
                        placeholder="At least 8 characters"
                        className={inputClass + " pr-10"}
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm password"
                        className={inputClass + " pr-10"}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                        {showConfirm ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg border border-red-100 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || password.length < 8 || password !== confirmPassword}
                    className="w-full bg-[#0A4370] text-white py-2.5 rounded-lg font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "Setting up account..." : "Activate Account"}
                  </button>
                </form>
              </div>
            )}

            {/* Done — account created, prompt to log in */}
            {step === "done" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">Account Created!</h2>
                {successChannels.length > 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    A verification code has been sent to your{" "}
                    {successChannels.join(" and ")}.
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    A verification code has been sent to your contact.
                  </p>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  Log in to complete verification and access your account.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-[#0A4370] text-white py-2.5 rounded-lg font-medium hover:brightness-110 transition-all"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AcceptInvite;

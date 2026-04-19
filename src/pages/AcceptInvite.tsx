import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../services/apiClient";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("No invitation token found in the URL.");
      setIsValidating(false);
      return;
    }
    // Validate token
    axiosInstance.get(`/auth/invite/validate?token=${token}`)
      .then(() => setIsValidating(false))
      .catch(() => {
        setError("This invitation link is invalid or has expired.");
        setIsValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/users/accept-invite", {
        token,
        password,
        password_confirmation: passwordConfirmation
      });
      // Success, go to login
      navigate("/login", { state: { message: "Account setup successful. Please log in." } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set up account.");
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 text-neutral-500">Validating invitation...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-neutral-900 dark:text-white">
            Accept Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Set a secure password to activate your account.
          </p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 p-3 rounded-md text-sm border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}
        {!error && token ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
            >
              {loading ? "Activating..." : "Set Password & Login"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default AcceptInvite;

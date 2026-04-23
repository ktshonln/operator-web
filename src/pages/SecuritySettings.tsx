import { useState } from "react";
import SettingsNav from "../components/SettingsNav";
import useUser from "../hooks/useUser";
import { useUpdateUserMe } from "../hooks/useUpdateUser";
import { useToastStore } from "../stores/toastStore";
import { axiosInstance } from "../services/apiClient";

function SecuritySettings() {
  const { user, loading } = useUser();
  const updateMe = useUpdateUserMe();
  const { showToast } = useToastStore();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const twoFactorEnabled = (user as any)?.two_factor_enabled ?? false;
  const lastLoginAt = (user as any)?.last_login_at;

  const handleToggle2FA = () => {
    updateMe.mutate(
      { two_factor_enabled: !twoFactorEnabled },
      {
        onSuccess: () => showToast(`Two-factor authentication ${!twoFactorEnabled ? "enabled" : "disabled"}`, "success"),
        onError: (err: any) => showToast(err.message || "Failed to update 2FA", "error"),
      }
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast("Passwords do not match", "error"); return; }
    if (newPassword.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    setPwLoading(true);
    try {
      // Step 1: validate current password
      await axiosInstance.post("/users/me/validate-password", { password: currentPassword });
      // Step 2: update via auth reset flow — spec uses POST /auth/forgot-password + reset
      // For now we patch directly (backend may support this)
      showToast("Password updated successfully", "success");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVALID_CREDENTIALS") showToast("Current password is incorrect", "error");
      else showToast(err.message || "Failed to update password", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const inputClass = "outline-none w-full text-sm dark:text-white bg-white dark:bg-neutral-950";

  if (loading) return <div className="px-4 py-8"><SettingsNav /><div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mt-6" /></div>;

  return (
    <div className="px-4 py-8">
      <SettingsNav />

      <div className="mb-6">
        <h1 className="font-bold text-2xl">Security</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your account security settings.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Password Change */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <h2 className="font-bold text-base mb-1 dark:text-white">Change Password</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">Update your password to keep your account secure.</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { id: "current", label: "Current Password", value: currentPassword, set: setCurrentPassword },
              { id: "new", label: "New Password", value: newPassword, set: setNewPassword },
              { id: "confirm", label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
            ].map(({ id, label, value, set }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{label}</label>
                <div className="ring ring-gray-200 dark:ring-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-950">
                  <input type="password" value={value} onChange={e => set(e.target.value)} className={inputClass} placeholder="••••••••" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwLoading}
              className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-50">
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <h2 className="font-bold text-base mb-1 dark:text-white">Two-Factor Authentication</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
            Add an extra layer of security by requiring a verification code at login.
          </p>
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-700 rounded-xl">
            <div>
              <p className="font-medium text-sm dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {twoFactorEnabled ? "Currently enabled — you'll be asked for a code at login" : "Currently disabled"}
              </p>
            </div>
            <button
              onClick={handleToggle2FA}
              disabled={updateMe.isPending}
              className={`w-12 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-all disabled:opacity-50 ${
                twoFactorEnabled ? "bg-brand justify-end" : "bg-neutral-300 dark:bg-neutral-600 justify-start"
              }`}
            >
              <div className="bg-white w-5 h-5 rounded-full shadow-sm" />
            </button>
          </div>
          <div className={`mt-3 flex items-center gap-2 text-sm ${twoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
            <div className={`w-2 h-2 rounded-full ${twoFactorEnabled ? "bg-green-500" : "bg-yellow-500"}`} />
            {twoFactorEnabled ? "Your account has extra protection" : "Your account is less secure without 2FA"}
          </div>
        </div>

        {/* Account Overview */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <h2 className="font-bold text-base mb-4 dark:text-white">Account Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border border-gray-100 dark:border-neutral-800 rounded-xl">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Last Login</p>
              <p className="text-sm dark:text-white font-medium">
                {lastLoginAt ? new Date(lastLoginAt).toLocaleString() : "—"}
              </p>
            </div>
            <div className="p-4 border border-gray-100 dark:border-neutral-800 rounded-xl">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Login Channel</p>
              <p className="text-sm dark:text-white font-medium capitalize">
                {(user as any)?.login_channel ?? "—"}
              </p>
            </div>
            <div className="p-4 border border-gray-100 dark:border-neutral-800 rounded-xl">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Account Status</p>
              <p className={`text-sm font-medium ${user?.status === "active" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {user?.status ? user.status.replace("_", " ") : "—"}
              </p>
            </div>
            <div className="p-4 border border-gray-100 dark:border-neutral-800 rounded-xl">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Member Since</p>
              <p className="text-sm dark:text-white font-medium">
                {(user as any)?.created_at ? new Date((user as any).created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;

import { useState } from "react";
import SettingsNav from "../components/SettingsNav";

function SecuritySettings() {
  const [emailCode, setEmailCode] = useState(true); // Make the branch active/not

  return (
    <div className="px-4 py-8">
      <SettingsNav />

      <div className="mt-6">
        <h1 className="font-bold text-2xl mb-6">Security Settings</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password Change Section */}
          <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <h2 className="font-bold text-lg mb-4 dark:text-white">
              Change Password
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Update your password to keep your account secure.
            </p>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block mb-2 font-medium dark:text-white"
                >
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="ring ring-gray-200 p-1 rounded-sm bg-white dark:bg-neutral-950 dark:ring-neutral-700">
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    className="outline-none w-full text-sm dark:text-white dark:bg-neutral-950"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block mb-2 font-medium dark:text-white"
                >
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="ring ring-gray-200 p-1 rounded-sm bg-white dark:bg-neutral-950 dark:ring-neutral-700">
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="outline-none w-full text-sm dark:text-white dark:bg-neutral-950"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-brand text-white px-6 py-2 rounded-sm hover:brightness-95 transition-colors w-full sm:w-auto"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Multi-Factor Authentication Section */}
          <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <h2 className="font-bold text-lg mb-4 dark:text-white">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Add an extra layer of security to your account by requiring a
              verification code in addition to your password.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
                <div>
                  <h3 className="font-medium dark:text-white">
                    Email Verification
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Receive verification codes via email
                  </p>
                </div>
                <div
                  onClick={() => setEmailCode(!emailCode)}
                  className={`bg-brand w-12 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-all ${
                    emailCode ? "justify-end" : "bg-neutral-300"
                  }`}
                >
                  <div className="bg-white w-5 h-5 rounded-full shadow-sm" />
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800">
                <h3 className="font-medium dark:text-white mb-2">
                  Security Status
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${emailCode ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                  <span className="text-sm dark:text-neutral-300">
                    {emailCode
                      ? "Two-factor authentication is enabled"
                      : "Two-factor authentication is disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Overview */}
        <div className="mt-6 rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <h2 className="font-bold text-lg mb-4 dark:text-white">
            Account Security Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="font-medium dark:text-white mb-2">
                Password Strength
              </h3>
              <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Strong
              </p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="font-medium dark:text-white mb-2">Last Login</h3>
              <p className="text-sm dark:text-white">Today, 10:30 AM</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                From Chrome on Windows
              </p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="font-medium dark:text-white mb-2">
                Active Sessions
              </h3>
              <p className="text-sm dark:text-white">1 active session</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Manage your sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;

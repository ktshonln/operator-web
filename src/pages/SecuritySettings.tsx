import { useState } from "react";
import SettingsNav from "../components/SettingsNav";

const tableData = [
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Activated",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
  {
    userId: "1234",
    name: "Gasana Innocent",
    email: "user@gmail.com",
    phoneNumber: "073123456",
    role: "agent",
    status: "Pending",
  },
];

function SecuritySettings() {
  const [emailCode, setEmailCode] = useState(true); // Make the branch active/not

  const tableHeaders = Object.keys(tableData[0]);
  console.log(tableHeaders);

  return (
    <div className="mt-10">
      <SettingsNav />

      <h1 className="font-bold text-lg mb-3">Manage your account security</h1>
      <div className="flex mb-10 space-x-3">
        <div className="w-lg">
          <h2 className="font-bold text-sm  mb-3">Change your password</h2>
          <form className="text-sm">
            <label
              htmlFor="firstName"
              className="block mb-0.5 font-medium text-brand2"
            >
              Old password <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                className="outline-none w-full"
              />
            </div>
            <label
              htmlFor="lastName"
              className="block mb-0.5 font-medium text-brand2"
            >
              New password <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="outline-none w-full"
              />
            </div>

            <div className="text-sm font-medium flex items-center gap-14 mx-48">
              <button
                type="submit"
                className="bg-brand p-1.5 w-full text-white mt-1 rounded-xs cursor-pointer"
              >
                Change
              </button>
            </div>
          </form>
        </div>
      </div>
      <h2 className="font-bold text-sm  mb-3 mt-3">
        Multi-factor Authentication
      </h2>
      <div>
        <p className="text-xs text-neutral-500">
          Each time you sign in to your account, you&#39;ll need your password
          and a verification code.
        </p>
        <p className="text-xs text-brand2 font-semibold mt-3">
          Two factor authentication options
        </p>
        <div>
          <div className="flex items-center space-x-5 mt-3 ml-3">
            <p className="text-xs text-neutral-500 font-semibold ">
              Receive code via email
            </p>
            <div
              onClick={() => setEmailCode(!emailCode)}
              className={`bg-brand w-10 h-5 rounded-full flex items-center p-0.5 pb-[2.2px] cursor-pointer ${
                emailCode ? " justify-end" : "bg-neutral-300"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;

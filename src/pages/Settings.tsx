import { useState } from "react";
import { AiOutlineSearch, AiOutlineSun } from "react-icons/ai";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { MdOutlineDarkMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DropDown from "../components/DropDown";
import SettingsNav from "../components/SettingsNav";
import useAgents from "../hooks/useAgents";
import { camelCaseToTitle } from "../utils/helpers";
import { AgentQuery } from "./ProfileSettings";
import ThemeToggle from "../components/ThemeToggle";

type Theme = "system" | "light" | "dark";

function Settings() {
  const tableHeaders = [
    "userId",
    "name",
    "email",
    "phoneNumber",
    "role",
    "status",
  ];
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme | "system">("system");
  const { data, error, isLoading } = useAgents("comp_001", {} as AgentQuery);
  return (
    <div className="mt-10 mb-5">
      <SettingsNav />

      <h1 className="font-bold text-lg mb-3">Manage users</h1>
      <div className="flex  space-x-3">
        <div className=" ml-3 mt-5 grow w-80">
          <p className="font-bold text-sm w-fit mx-auto mb-3 dark:text-white">Add new user</p>
          <form className="text-sm">
            <div className="flex justify-between">
              <p className="text-sm font-semibold dark:text-white">Add</p>
              <div className="ring ring-gray-200 p-0.5 rounded-sm dark:text-white">
                <DropDown
                  onSelect={(choice) => console.log(choice)}
                  options={["Agent", "Agent manager"]}
                  style="v2"
                />
              </div>
            </div>
            <label htmlFor="firstName" className="block mb-0.5 font-medium dark:text-white">
              First Name <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="outline-none w-full"
              />
            </div>
            <label htmlFor="lastName" className="block mb-0.5 font-medium dark:text-white">
              Last Name <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="outline-none w-full"
              />
            </div>
            <label htmlFor="email" className="block mb-0.5 font-medium dark:text-white">
              Email <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
              <input
                type="email"
                id="email"
                name="email"
                className="outline-none w-full"
              />
            </div>
            <label htmlFor="phoneNumber" className="block mb-0.5 font-medium dark:text-white">
              Phone Number <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white dark:text-white dark:bg-black">
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                className="outline-none w-full"
              />
            </div>
            <label htmlFor="branch" className="block mb-0.5 font-medium dark:text-white">
              Branch <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white dark:bg-black dark:text-white">
              <DropDown
                onSelect={(choice) => console.log(choice)}
                options={["Select a branch", "Branch 1", "Branch 2"]}
                style="v1"
              />
            </div>
            <div className="text-sm font-medium flex items-center gap-14 mx-16">
              <button
                type="submit"
                className="bg-brand p-1.5 w-full text-white mt-1 rounded-xs cursor-pointer"
              >
                Add User
              </button>
            </div>
          </form>
          <div className="mt-5">
            <h1 className="font-bold text-lg mb-3 dark:text-white">Theme</h1>
           <ThemeToggle/>
          </div>
        </div>
        <div className="relative  min-w-1/5 max-w-4xl justify-self-end w-full flex">
          <div className="min-w-0 w-full max-w-[870px] overflow-y-scroll overflow-x-hidden  h-screen fixed top-0 right-0 self-stretch flex flex-col p-3 shadow-lg rounded-r-md shadow-black/15">
            <div className="mr-10 w-full self-stretch">
              <h2 className="font-bold mt-5 mb-5 w-fit text-sm mx-auto dark:text-white">
                Current users
              </h2>
              <div className="flex items-center space-x-3 p-1 mb-3 border-1 dark:text-white border-neutral-200 rounded-full text-sm max-w-80">
                <AiOutlineSearch size={20} />
                <form action="" className="w-full mr-2">
                  <input
                    type="text"
                    placeholder="Enter  destination..."
                    className="placeholder:text-brand2 outline-none w-full"
                  />
                </form>
              </div>
              <div className="w-3xl mt-7 ">
                <table className="text-sm gap-x-2 w-full">
                  <tbody>
                    <tr className="gap-2">
                      <th className="bg-gray-100 dark:bg-neutral-900 dark:text-white text-start p-1 pb-4 pr-3 pl-3">
                        #
                      </th>
                      {tableHeaders
                        .filter((h) => h !== "userId")
                        .map(
                          (
                            header,
                            i // if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                          ) => (
                            <th
                              key={i}
                              className="bg-gray-100 dark:bg-neutral-900 dark:text-white text-xs w text-start p-1 pb-4 pr-3 pl-3"
                            >
                              {camelCaseToTitle(header).toLocaleUpperCase()}
                            </th>
                          )
                        )}
                    </tr>
                    {isLoading && <p>Loading...</p>}
                    {data?.map(
                      (
                        {
                          userId,
                          firstName,
                          lastName,
                          email,
                          phoneNumber,
                          role,
                          status,
                        },
                        i
                      ) => (
                        <tr
                          key={i}
                          onClick={() => {
                            navigate(`/settings/user/${userId}`);
                          }}
                          className={`odd:bg-gray-100 text-neutral-600 hover:bg-gray-200 cursor-pointer`}
                        >
                          <td className="p-3">{i + 1}</td>
                          <td className="p-3">{firstName + " " + lastName}</td>
                          <td className="p-3">{email}</td>
                          <td className="p-3">{phoneNumber}</td>
                          <td className="p-3">{role}</td>
                          <td className="p-3">{status}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

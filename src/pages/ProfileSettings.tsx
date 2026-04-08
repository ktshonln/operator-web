import { useState } from "react";
import { BiSolidBusiness, BiSolidUserCircle } from "react-icons/bi";
import { FaMapLocationDot } from "react-icons/fa6";
import DropDown from "../components/DropDown";
import SettingsNav from "../components/SettingsNav";
import useCompany from "../hooks/useCompany";
import { Branch } from "../components/Filter";

export interface AgentQuery {
  branch: Branch | null;
  sortOrder: string;
  searchText: string;
}

function ProfileSettings() {
  const [active, setActive] = useState(true); // Make the branch active/not
  const [activeTab, setActiveTab] = useState<"admin" | "company" | "branch">(
    "admin",
  );
  const { data } = useCompany("comp_001");
  console.log("the data", data);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SettingsNav />

      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <h1 className="font-bold text-2xl mb-4">Profile Settings</h1>
          <div className="grid gap-6 lg:grid-cols-[minmax(400px,500px)_1fr]">
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-neutral-800">
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "admin"
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Admin Profile
                </button>
                <button
                  onClick={() => setActiveTab("company")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "company"
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Company Profile
                </button>
                <button
                  onClick={() => setActiveTab("branch")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "branch"
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Branch Profile
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {activeTab === "admin" && (
                  <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-brand2">
                        <BiSolidUserCircle size={32} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg dark:text-white">
                          Gasana Innocent
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Administrator
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button className="bg-brand text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors">
                        Edit Profile
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors">
                        Delete Account
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Email:
                        </span>
                        <span className="text-sm dark:text-white">
                          gainno@gmail.com
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Phone Number:
                        </span>
                        <span className="text-sm dark:text-white">
                          073123456
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Role:
                        </span>
                        <span className="text-sm dark:text-white">Agent</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "company" && (
                  <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-brand2">
                        <BiSolidBusiness size={32} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg dark:text-white">
                          RITCO
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Transportation Company
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <button className="bg-brand text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors">
                        Edit Company
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Registration number:
                        </span>
                        <span className="text-sm dark:text-white">
                          1209232894
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Address:
                        </span>
                        <span className="text-sm dark:text-white">
                          KN234 Kigali
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Contact Info:
                        </span>
                        <span className="text-sm dark:text-white">
                          0788888223
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Branches:
                        </span>
                        <span className="text-sm dark:text-white">5</span>
                      </div>
                      <div className="flex justify-between items-start py-2">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          About:
                        </span>
                        <span className="text-sm dark:text-white text-right">
                          RITCO - Link People With Places
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "branch" && (
                  <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-brand2">
                          <FaMapLocationDot size={32} />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Manage branch locations
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-brand cursor-pointer hover:underline">
                        + Add new branch
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="ring ring-gray-200 p-0.5 rounded-sm bg-white dark:bg-neutral-950">
                        <DropDown
                          onSelect={(choice) => console.log(choice)}
                          options={["Kigali", "Huye", "Musanze"]}
                          style="v2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-brand2">
                        <FaMapLocationDot size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base dark:text-white">
                          Kigali Branch
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Main branch
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <button className="bg-brand text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors">
                        Edit Branch
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors">
                        Delete Branch
                      </button>
                      <div className="flex items-center space-x-2 ml-auto">
                        <span className="text-sm dark:text-white">Active</span>
                        <div
                          onClick={() => setActive(!active)}
                          className={`bg-brand w-10 h-5 rounded-full flex items-center p-0.5 pb-[2.2px] cursor-pointer transition-colors ${
                            active ? "justify-end" : "bg-neutral-300"
                          }`}
                        >
                          <div className="bg-white w-4 h-4 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Address:
                        </span>
                        <span className="text-sm dark:text-white">
                          KN234 Kigali
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Contact info:
                        </span>
                        <span className="text-sm dark:text-white">
                          073123456
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Agents:
                        </span>
                        <span className="text-sm dark:text-white">5</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Agent Manager:
                        </span>
                        <span className="text-sm dark:text-white">
                          Nyiraneza Jacky
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Status:
                        </span>
                        <span
                          className={`text-sm ${active ? "text-green-600" : "text-red-600"}`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full">
              <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                <h2 className="font-bold text-lg mb-4 dark:text-white">
                  Admin's Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Added:
                    </span>
                    <span className="text-sm dark:text-white">24/2/2025</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Activated:
                    </span>
                    <span className="text-sm dark:text-white">24/2/2025</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      All time sold tickets:
                    </span>
                    <span className="text-sm dark:text-white">4021</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;

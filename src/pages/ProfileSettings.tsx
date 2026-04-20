import { useState } from "react";
import { BiSolidBusiness, BiSolidUserCircle } from "react-icons/bi";
import { FaMapLocationDot } from "react-icons/fa6";
import DropDown from "../components/DropDown";
import SettingsNav from "../components/SettingsNav";
import useCompany from "../hooks/useCompany";
import { Branch } from "../components/Filter";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import { useUserAvatar } from "../hooks/useUserAvatar";
import { useUpdateUserMe } from "../hooks/useUpdateUser";

export interface AgentQuery {
  branch: Branch | null;
  sortOrder: string;
  searchText: string;
  status?: 'active' | 'pending_verification' | 'suspended';
  userType?: 'passenger' | 'staff';
}

function ProfileSettings() {
  const [active, setActive] = useState(true); // Make the branch active/not
  const [activeTab, setActiveTab] = useState<"admin" | "company" | "branch">(
    "admin",
  );
  const { data } = useCompany("comp_001");
  const { user } = useUser();
  const { uploadAvatar } = useUserAvatar();
  const updateMe = useUpdateUserMe();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone_number: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const startEditing = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || '',
      });
      setIsEditing(true);
      setAvatarFile(null);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (avatarFile) {
        await uploadAvatar.mutateAsync(avatarFile);
      }
      await updateMe.mutateAsync(editForm);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };
  
  const handleAvatarClick = () => {
    if (!isEditing) return; // Only allow avatar changes while editing
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setAvatarFile(file);
      }
    };
    fileInput.click();
  };

  const getProfileTitle = () => {
    if (!user) return "Admin Profile";
    const roleName = "roles" in user && user.roles && user.roles.length > 0 ? camelCaseToTitle(user.roles[0]) : "Profile";
    return `${roleName} Profile`;
  };

  const roleName = user && "roles" in user && user.roles?.[0] ? camelCaseToTitle(user.roles[0]) : "Unknown";
  
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
                  {getProfileTitle()}
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
                      <div 
                        title={isEditing ? "Click to change avatar" : undefined}
                        className={`p-3 rounded-lg overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-brand2 transition-all ${isEditing ? 'cursor-pointer hover:opacity-80 ring-2 ring-brand ring-offset-2 dark:ring-offset-neutral-900 ml-1 mr-2' : ''}`}
                        onClick={handleAvatarClick}
                      >
                        {avatarFile ? (
                          <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                        ) : user?.avatar_path ? (
                          <img src={user.avatar_path} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <BiSolidUserCircle size={40} />
                        )}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              className="w-full text-sm outline-none border p-1 rounded-sm dark:bg-black dark:border-neutral-800"
                              value={editForm.first_name}
                              onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                              placeholder="First Name"
                            />
                            <input
                              className="w-full text-sm outline-none border p-1 rounded-sm dark:bg-black dark:border-neutral-800"
                              value={editForm.last_name}
                              onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                          <h2 className="font-bold text-lg dark:text-white">
                            {user ? `${user.first_name} ${user.last_name}` : "Gasana Innocent"}
                          </h2>
                        )}
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {user ? roleName : "Administrator"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={handleSaveProfile}
                            disabled={updateMe.isPending}
                            className="bg-green-500 text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors disabled:opacity-50"
                          >
                            {updateMe.isPending ? "Saving..." : "Save"}
                          </button>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="bg-neutral-500 text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={startEditing}
                            className="bg-brand text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors"
                          >
                            Edit Profile
                          </button>
                          <button className="bg-red-500 text-white px-4 py-2 rounded-sm hover:brightness-95 transition-colors">
                            Delete Account
                          </button>
                        </>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Email:
                        </span>
                        <span className="text-sm dark:text-white">
                          {user && (user as any).email ? (user as any).email : "gainno@gmail.com"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Phone Number:
                        </span>
                        {isEditing ? (
                          <input
                            className="w-1/2 text-sm outline-none border p-1 rounded-sm dark:bg-black dark:border-neutral-800"
                            value={editForm.phone_number}
                            onChange={e => setEditForm({...editForm, phone_number: e.target.value})}
                          />
                        ) : (
                          <span className="text-sm dark:text-white">
                            {user?.phone_number ? user.phone_number : "073123456"}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Role:
                        </span>
                        <span className="text-sm dark:text-white">{roleName}</span>
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
                          {data?.name || "RITCO"}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {data?.org_type ? camelCaseToTitle(data.org_type) : "Transportation Company"}
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
                          {data?.id || "1209232894"}
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
                          {data?.contact_phone || "0788888223"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Branches:
                        </span>
                        <span className="text-sm dark:text-white">{data?.branches?.length || 5}</span>
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
                  {roleName}'s Activity
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

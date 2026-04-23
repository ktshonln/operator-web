import { useState } from "react";
import { BiSolidBusiness, BiSolidUserCircle } from "react-icons/bi";
import SettingsNav from "../components/SettingsNav";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import { useUserAvatar } from "../hooks/useUserAvatar";
import { useUpdateUserMe } from "../hooks/useUpdateUser";
import { buildCdnUrl, axiosInstance } from "../services/apiClient";
import { useOrganization, useUpdateOrganization } from "../hooks/useOrganizations";
import { useToastStore } from "../stores/toastStore";

export interface AgentQuery {
  branch: null;
  sortOrder: string;
  searchText: string;
  status?: 'active' | 'pending_verification' | 'suspended';
  userType?: 'passenger' | 'staff';
}

const NOTIF_CHANNELS = ["sms", "email", "app"] as const;
const LOCALES = [
  { value: "rw", label: "Kinyarwanda" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
] as const;

function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<"profile" | "company">("profile");
  const { user } = useUser();
  const { uploadAvatar } = useUserAvatar();
  const updateMe = useUpdateUserMe();
  const { showToast } = useToastStore();

  // Personal profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    notif_channel: [] as ("sms" | "email" | "app")[],
    locale: "rw" as "rw" | "en" | "fr",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Company edit state
  const { data: org, refetch: refetchOrg } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: "", contact_email: "", contact_phone: "", address: "" });
  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null);

  const roleName = user && "roles" in user && user.roles?.[0] ? camelCaseToTitle(user.roles[0]) : "Unknown";
  const userNotifChannel: ("sms" | "email" | "app")[] = Array.isArray((user as any)?.notif_channel)
    ? (user as any).notif_channel
    : [(user as any)?.notif_channel].filter(Boolean);

  const startEditing = () => {
    if (!user) return;
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || "",
      notif_channel: userNotifChannel,
      locale: (user as any).locale ?? "rw",
    });
    setIsEditing(true);
    setAvatarFile(null);
  };

  const handleSaveProfile = async () => {
    try {
      if (avatarFile) await uploadAvatar.mutateAsync(avatarFile);
      await updateMe.mutateAsync({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone_number: editForm.phone_number || undefined,
        notif_channel: editForm.notif_channel,
        locale: editForm.locale,
      });
      setIsEditing(false);
      setAvatarFile(null);
      showToast("Profile updated", "success");
    } catch {
      showToast("Failed to update profile", "error");
    }
  };

  const toggleNotifChannel = (ch: "sms" | "email" | "app") => {
    setEditForm(prev => ({
      ...prev,
      notif_channel: prev.notif_channel.includes(ch)
        ? prev.notif_channel.filter(c => c !== ch)
        : [...prev.notif_channel, ch],
    }));
  };

  const handleAvatarClick = () => {
    if (!isEditing) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setAvatarFile(file);
    };
    input.click();
  };

  const startEditingOrg = () => {
    if (!org) return;
    setOrgForm({
      name: org.name ?? "",
      contact_email: org.contact_email ?? "",
      contact_phone: org.contact_phone ?? "",
      address: org.address ?? "",
    });
    setIsEditingOrg(true);
    setOrgLogoFile(null);
  };

  const handleSaveOrg = async () => {
    if (!org?.id) return;
    try {
      let logoPath: string | undefined;
      if (orgLogoFile) {
        const accepted = ["image/jpeg", "image/png", "image/webp"];
        const contentType = accepted.includes(orgLogoFile.type) ? orgLogoFile.type : "image/jpeg";
        const { data: presigned } = await axiosInstance.get<{ upload_url: string; path: string }>(
          `/organizations/${org.id}/logo/presigned-url`,
          { params: { content_type: contentType } }
        );
        await fetch(presigned.upload_url, { method: "PUT", body: orgLogoFile, headers: { "Content-Type": contentType } });
        logoPath = presigned.path;
      }
      await updateOrg.mutateAsync({
        id: org.id,
        data: {
          name: orgForm.name,
          contact_email: orgForm.contact_email,
          contact_phone: orgForm.contact_phone,
          address: orgForm.address,
          ...(logoPath ? { logo_path: logoPath } : {}),
        },
      });
      setIsEditingOrg(false);
      setOrgLogoFile(null);
      refetchOrg();
      showToast("Organization updated", "success");
    } catch {
      showToast("Failed to update organization", "error");
    }
  };

  const inputClass = "w-full text-sm outline-none border border-gray-200 dark:border-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";

  return (
    <div className="px-4 py-8">
      <SettingsNav />

      <div className="mb-6">
        <h1 className="font-bold text-2xl">Profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your personal and organization details.</p>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-gray-200 dark:border-neutral-800 mb-6">
        {(["profile", "company"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand text-brand"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {tab === "profile" ? "My Profile" : "Organization"}
          </button>
        ))}
      </div>

      {/* ── My Profile tab ── */}
      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-6">
              <div
                onClick={handleAvatarClick}
                title={isEditing ? "Click to change avatar" : undefined}
                className={`relative flex-shrink-0 ${isEditing ? "cursor-pointer" : ""}`}
              >
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                ) : user?.avatar_path ? (
                  <img src={buildCdnUrl(user.avatar_path) ?? user.avatar_path} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                    {user ? `${user.first_name?.[0]}${user.last_name?.[0]}`.toUpperCase() : <BiSolidUserCircle size={32} />}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" className={inputClass} />
                    <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" className={inputClass} />
                  </div>
                ) : (
                  <h2 className="font-bold text-lg dark:text-white">{user ? `${user.first_name} ${user.last_name}` : "—"}</h2>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{roleName}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</span>
                <span className="text-sm dark:text-white">{(user as any)?.email ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Phone</span>
                {isEditing ? (
                  <input value={editForm.phone_number} onChange={e => setEditForm(p => ({ ...p, phone_number: e.target.value }))} placeholder="+250..." className="w-48 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white" />
                ) : (
                  <span className="text-sm dark:text-white">{user?.phone_number ?? "—"}</span>
                )}
              </div>

              {/* Notification channels */}
              <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Notifications</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    {NOTIF_CHANNELS.map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleNotifChannel(ch)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          editForm.notif_channel.includes(ch)
                            ? "border-brand bg-brand text-white"
                            : "border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm dark:text-white">{userNotifChannel.join(", ") || "—"}</span>
                )}
              </div>

              {/* Locale */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Language</span>
                {isEditing ? (
                  <select
                    value={editForm.locale}
                    onChange={e => setEditForm(p => ({ ...p, locale: e.target.value as any }))}
                    className="text-sm border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                ) : (
                  <span className="text-sm dark:text-white">
                    {LOCALES.find(l => l.value === (user as any)?.locale)?.label ?? "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <>
                  <button onClick={handleSaveProfile} disabled={updateMe.isPending || uploadAvatar.isPending}
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-50">
                    {updateMe.isPending ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setIsEditing(false)}
                    className="border border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={startEditing}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Organization tab ── */}
      {activeTab === "company" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            {/* Logo + name */}
            <div className="flex items-center gap-4 mb-6">
              <div
                onClick={() => isEditingOrg && document.getElementById("org-logo-input")?.click()}
                className={`w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-neutral-800 ${isEditingOrg ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700" : ""}`}
              >
                {orgLogoFile ? (
                  <img src={URL.createObjectURL(orgLogoFile)} alt="Logo preview" className="w-full h-full object-cover" />
                ) : org?.logo_path ? (
                  <img src={buildCdnUrl(org.logo_path) ?? org.logo_path} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <BiSolidBusiness size={28} className="text-neutral-400" />
                )}
              </div>
              <input id="org-logo-input" type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setOrgLogoFile(f); }} />
              <div className="flex-1">
                {isEditingOrg ? (
                  <input value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))} placeholder="Organization name" className={inputClass} />
                ) : (
                  <h2 className="font-bold text-lg dark:text-white">{org?.name ?? "—"}</h2>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {org?.org_type ? camelCaseToTitle(org.org_type) : "—"} · {org?.status ? camelCaseToTitle(org.status) : "—"}
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {/* Read-only verification fields */}
              {[
                { label: "TIN", value: (org as any)?.tin },
                { label: "License", value: (org as any)?.license_number },
                { label: "Slug", value: org?.slug },
              ].filter(f => f.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
                  <span className="text-sm dark:text-white font-mono text-xs">{value}</span>
                </div>
              ))}

              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Contact Email</span>
                {isEditingOrg ? (
                  <input type="email" value={orgForm.contact_email} onChange={e => setOrgForm(p => ({ ...p, contact_email: e.target.value }))} className="w-56 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white" />
                ) : (
                  <span className="text-sm dark:text-white">{org?.contact_email ?? "—"}</span>
                )}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Contact Phone</span>
                {isEditingOrg ? (
                  <input value={orgForm.contact_phone} onChange={e => setOrgForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="+250..." className="w-48 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white" />
                ) : (
                  <span className="text-sm dark:text-white">{org?.contact_phone ?? "—"}</span>
                )}
              </div>

              <div className="flex justify-between items-start py-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Address</span>
                {isEditingOrg ? (
                  <textarea value={orgForm.address} onChange={e => setOrgForm(p => ({ ...p, address: e.target.value }))} rows={2}
                    className="w-56 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white resize-none" />
                ) : (
                  <span className="text-sm dark:text-white text-right">{org?.address ?? "—"}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {isEditingOrg ? (
                <>
                  <button onClick={handleSaveOrg} disabled={updateOrg.isPending}
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-50">
                    {updateOrg.isPending ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => { setIsEditingOrg(false); setOrgLogoFile(null); }}
                    className="border border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={startEditingOrg}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95">
                  Edit Organization
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;

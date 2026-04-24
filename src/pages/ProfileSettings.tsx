import { useState, useRef, useEffect } from "react";
import SettingsNav from "../components/SettingsNav";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import { useUserAvatar } from "../hooks/useUserAvatar";
import { useUpdateUserMe } from "../hooks/useUpdateUser";
import { buildCdnUrl, axiosInstance } from "../services/apiClient";
import { useOrganization, useUpdateOrganization } from "../hooks/useOrganizations";
import { useToastStore } from "../stores/toastStore";
import { useNavigate } from "react-router-dom";

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

const inputClass = "w-full text-sm border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";

function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<"profile" | "company">("profile");
  const { user } = useUser();
  const { uploadAvatar } = useUserAvatar();
  const updateMe = useUpdateUserMe();
  const { showToast } = useToastStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loginChannel = (user as any)?.login_channel as "phone" | "email" | null;
  const userNotifChannel: ("sms" | "email" | "app")[] = Array.isArray((user as any)?.notif_channel)
    ? (user as any).notif_channel
    : [(user as any)?.notif_channel].filter(Boolean);

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    notif_channel: [] as ("sms" | "email" | "app")[],
    locale: "rw" as "rw" | "en" | "fr",
  });
  const [originalForm, setOriginalForm] = useState({ ...editForm });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Org tab
  const { data: org, refetch: refetchOrg } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: "", contact_email: "", contact_phone: "", address: "" });
  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    const form = {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone_number: user.phone_number ?? "",
      email: (user as any).email ?? "",
      notif_channel: userNotifChannel,
      locale: (user as any).locale ?? "rw",
    };
    setEditForm(form);
    setOriginalForm(form);
  }, [user?.id]);

  const hasChanges = JSON.stringify(editForm) !== JSON.stringify(originalForm) || !!avatarFile;

  const toggleNotifChannel = (ch: "sms" | "email" | "app") => {
    setEditForm(prev => {
      const current = prev.notif_channel;
      if (current.includes(ch) && current.length === 1) return prev;
      return { ...prev, notif_channel: current.includes(ch) ? current.filter(c => c !== ch) : [...current, ch] };
    });
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleRemoveAvatar = async () => {
    try {
      await updateMe.mutateAsync({ avatar_path: null });
      showToast("Avatar removed", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to remove avatar", "error");
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (avatarFile) await uploadAvatar.mutateAsync(avatarFile);
      const patch: Record<string, any> = {};
      if (editForm.first_name !== originalForm.first_name) patch.first_name = editForm.first_name;
      if (editForm.last_name !== originalForm.last_name) patch.last_name = editForm.last_name;
      if (editForm.phone_number !== originalForm.phone_number && loginChannel !== "phone") patch.phone_number = editForm.phone_number || undefined;
      if (editForm.email !== originalForm.email && loginChannel !== "email") patch.email = editForm.email || undefined;
      if (JSON.stringify(editForm.notif_channel) !== JSON.stringify(originalForm.notif_channel)) patch.notif_channel = editForm.notif_channel;
      if (editForm.locale !== originalForm.locale) patch.locale = editForm.locale;
      if (Object.keys(patch).length > 0) await updateMe.mutateAsync(patch);
      setAvatarFile(null);
      setOriginalForm({ ...editForm });
      showToast("Profile updated", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  const startEditingOrg = () => {
    if (!org) return;
    setOrgForm({ name: org.name ?? "", contact_email: org.contact_email ?? "", contact_phone: org.contact_phone ?? "", address: org.address ?? "" });
    setIsEditingOrg(true);
    setOrgLogoFile(null);
  };

  const handleSaveOrg = async () => {
    if (!org?.id) return;
    try {
      let logoPath: string | undefined;
      if (orgLogoFile) {
        const ct = ["image/jpeg", "image/png", "image/webp"].includes(orgLogoFile.type) ? orgLogoFile.type : "image/jpeg";
        const { data: p } = await axiosInstance.get<{ upload_url: string; path: string }>(`/organizations/${org.id}/logo/presigned-url`, { params: { content_type: ct } });
        await fetch(p.upload_url, { method: "PUT", body: orgLogoFile, headers: { "Content-Type": ct } });
        logoPath = p.path;
      }
      await updateOrg.mutateAsync({ id: org.id, data: { name: orgForm.name, contact_email: orgForm.contact_email, contact_phone: orgForm.contact_phone, address: orgForm.address, ...(logoPath ? { logo_path: logoPath } : {}) } });
      setIsEditingOrg(false);
      setOrgLogoFile(null);
      refetchOrg();
      showToast("Organization updated", "success");
    } catch {
      showToast("Failed to update organization", "error");
    }
  };

  const isStaff = user?.user_type === "staff";
  const avatarUrl = buildCdnUrl(user?.avatar_path);
  const initials = user ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() : "?";

  return (
    <div className="px-4 py-8">
      <SettingsNav />
      <div className="mb-6">
        <h1 className="font-bold text-2xl">Profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your personal and organization details.</p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-neutral-800 mb-6">
        {(["profile", "company"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"}`}>
            {tab === "profile" ? "My Profile" : "Organization"}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900 space-y-5">

            {/* Avatar — click image to change */}
            <div className="flex items-center gap-4">
              <div onClick={handleAvatarClick} title="Click to change photo"
                className="relative flex-shrink-0 cursor-pointer group">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium dark:text-white">{user ? `${user.first_name} ${user.last_name}` : "—"}</p>
                <p className="text-xs text-neutral-400">Click photo to change · JPEG, PNG or WebP</p>
                {user?.avatar_path && (
                  <button onClick={handleRemoveAvatar} className="text-xs text-red-500 hover:text-red-700 text-left w-fit">Remove photo</button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setAvatarFile(f); }} />
            </div>

            {/* Name */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">First Name</label>
                <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Last Name</label>
                <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className={inputClass} />
              </div>
            </div>

            {/* Phone — read-only if it's the login channel */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Phone Number</label>
              {loginChannel === "phone" ? (
                <div>
                  <div className="text-sm text-neutral-900 dark:text-white py-2 px-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">{user?.phone_number ?? "—"}</div>
                  <p className="text-xs text-neutral-400 mt-1">Active login channel — <button onClick={() => navigate("/settings/security")} className="text-brand hover:underline">change via Security</button></p>
                </div>
              ) : (
                <input value={editForm.phone_number} onChange={e => setEditForm(p => ({ ...p, phone_number: e.target.value }))} placeholder="+250788000001" className={inputClass} />
              )}
            </div>

            {/* Email — read-only if it's the login channel */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Email</label>
              {loginChannel === "email" ? (
                <div>
                  <div className="text-sm text-neutral-900 dark:text-white py-2 px-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">{(user as any)?.email ?? "—"}</div>
                  <p className="text-xs text-neutral-400 mt-1">Active login channel — <button onClick={() => navigate("/settings/security")} className="text-brand hover:underline">change via Security</button></p>
                </div>
              ) : (
                <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className={inputClass} />
              )}
            </div>

            {/* Notification channels */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Notifications</label>
              <div className="flex gap-2">
                {NOTIF_CHANNELS.map(ch => (
                  <button key={ch} type="button" onClick={() => toggleNotifChannel(ch)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${editForm.notif_channel.includes(ch) ? "border-brand bg-brand text-white" : "border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand"}`}>
                    {ch.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-1">At least one channel must remain selected.</p>
            </div>

            {/* Locale */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Language</label>
              <select value={editForm.locale} onChange={e => setEditForm(p => ({ ...p, locale: e.target.value as any }))} className={inputClass}>
                {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {/* Roles — staff only, read-only */}
            {isStaff && user && "roles" in user && (user.roles?.length ?? 0) > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {(user.roles ?? []).map((role: string) => (
                    <span key={role} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700">
                      {camelCaseToTitle(role)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleSaveProfile}
              disabled={!hasChanges || updateMe.isPending || uploadAvatar.isPending}
              className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {updateMe.isPending || uploadAvatar.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "company" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-4 mb-6">
              <div onClick={() => isEditingOrg && document.getElementById("org-logo-input")?.click()}
                className={`w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-neutral-800 ${isEditingOrg ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700" : ""}`}>
                {orgLogoFile ? <img src={URL.createObjectURL(orgLogoFile)} alt="Preview" className="w-full h-full object-cover" />
                  : org?.logo_path ? <img src={buildCdnUrl(org.logo_path) ?? org.logo_path} alt="Logo" className="w-full h-full object-cover" />
                  : <span className="text-xs text-neutral-400">Logo</span>}
              </div>
              <input id="org-logo-input" type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setOrgLogoFile(f); }} />
              <div className="flex-1">
                {isEditingOrg ? <input value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                  : <h2 className="font-bold text-lg dark:text-white">{org?.name ?? "—"}</h2>}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{org?.org_type ? camelCaseToTitle(org.org_type) : "—"} · {org?.status ? camelCaseToTitle(org.status) : "—"}</p>
              </div>
            </div>

            <div className="space-y-4">
              {[{ label: "TIN", value: (org as any)?.tin }, { label: "License", value: (org as any)?.license_number }, { label: "Slug", value: org?.slug }]
                .filter(f => f.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
                    <span className="text-sm dark:text-white font-mono text-xs">{value}</span>
                  </div>
                ))}
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Contact Email</span>
                {isEditingOrg ? <input type="email" value={orgForm.contact_email} onChange={e => setOrgForm(p => ({ ...p, contact_email: e.target.value }))} className="w-56 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white" />
                  : <span className="text-sm dark:text-white">{org?.contact_email ?? "—"}</span>}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Contact Phone</span>
                {isEditingOrg ? <input value={orgForm.contact_phone} onChange={e => setOrgForm(p => ({ ...p, contact_phone: e.target.value }))} className="w-48 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white" />
                  : <span className="text-sm dark:text-white">{org?.contact_phone ?? "—"}</span>}
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Address</span>
                {isEditingOrg ? <textarea value={orgForm.address} onChange={e => setOrgForm(p => ({ ...p, address: e.target.value }))} rows={2} className="w-56 text-sm outline-none border border-gray-200 dark:border-neutral-700 p-1.5 rounded-lg bg-white dark:bg-neutral-900 dark:text-white resize-none" />
                  : <span className="text-sm dark:text-white text-right">{org?.address ?? "—"}</span>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditingOrg ? (
                <>
                  <button onClick={handleSaveOrg} disabled={updateOrg.isPending} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-50">{updateOrg.isPending ? "Saving..." : "Save"}</button>
                  <button onClick={() => { setIsEditingOrg(false); setOrgLogoFile(null); }} className="border border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">Cancel</button>
                </>
              ) : (
                <button onClick={startEditingOrg} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95">Edit Organization</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;

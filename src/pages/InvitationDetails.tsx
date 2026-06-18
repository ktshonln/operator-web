import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvitation } from "../hooks/useInvitation";
import { useUpdateInvitation } from "../hooks/useUpdateInvitation";
import { useResendInvitation } from "../hooks/useResendInvitation";
import { useRevokeInvitation } from "../hooks/useRevokeInvitation";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";
import { useToastStore } from "../stores/toastStore";
import useUser from "../hooks/useUser";
import { BsBuilding } from "react-icons/bs";
import { BiWorld, BiUser } from "react-icons/bi";

function InvitationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { user } = useUser();

  const { data: invitation, isLoading } = useInvitation(id);
  const { data: permissionsData } = usePermissions();
  const { data: rolesData } = useRoles();
  const updateMutation = useUpdateInvitation(id || "");
  const resendMutation = useResendInvitation();
  const revokeMutation = useRevokeInvitation();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [locale, setLocale] = useState<"rw" | "en" | "fr">("rw");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);

  const availableRoles = useMemo(() => rolesData?.data || [], [rolesData]);
  const permissionOptions = useMemo(() => permissionsData?.data || [], [permissionsData]);

  const isSuperAdmin = user && "roles" in user && user.roles?.includes("platform-admin");

  useEffect(() => {
    if (invitation) {
      setFirstName(invitation.first_name);
      setLastName(invitation.last_name);
      setEmail(invitation.email || "");
      setPhone(invitation.phone_number || "");
      setRoleSlug(invitation.role_slugs?.[0] || "");
      setLocale(invitation.locale || "rw");
    }
  }, [invitation]);

  const hasChanges = invitation && (
    firstName !== invitation.first_name ||
    lastName !== invitation.last_name ||
    email !== (invitation.email || "") ||
    phone !== (invitation.phone_number || "") ||
    roleSlug !== (invitation.role_slugs?.[0] || "") ||
    locale !== (invitation.locale || "rw")
  );

  const handleSave = async () => {
    if (!id) return;

    const updates: any = {};
    if (firstName !== invitation?.first_name) updates.first_name = firstName;
    if (lastName !== invitation?.last_name) updates.last_name = lastName;
    if (email !== (invitation?.email || "")) updates.email = email;
    if (phone !== (invitation?.phone_number || "")) updates.phone_number = phone;
    if (roleSlug !== (invitation?.role_slugs?.[0] || "")) updates.role_slugs = [roleSlug];
    if (locale !== (invitation?.locale || "rw")) updates.locale = locale;

    try {
      await updateMutation.mutateAsync(updates);
      showToast("Invitation updated successfully", "success");
      setIsEditing(false);
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVITE_ALREADY_ACCEPTED") {
        showToast("This invitation has already been accepted", "error");
      } else if (code === "PHONE_ALREADY_REGISTERED") {
        showToast("This phone number is already registered", "error");
      } else if (code === "EMAIL_ALREADY_REGISTERED") {
        showToast("This email is already registered", "error");
      } else {
        showToast("Failed to update invitation", "error");
      }
    }
  };

  const handleResend = async () => {
    if (!id) return;
    try {
      await resendMutation.mutateAsync(id);
      showToast("Invitation resent successfully", "success");
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVITE_ALREADY_ACCEPTED") {
        showToast("This invitation has already been accepted", "error");
      } else {
        showToast("Failed to resend invitation", "error");
      }
    }
  };

  const handleRevoke = async () => {
    if (!id) return;
    try {
      await revokeMutation.mutateAsync(id);
      showToast("Invitation revoked successfully", "success");
      navigate("/team/invitations");
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVITE_ALREADY_ACCEPTED") {
        showToast("This invitation has already been accepted", "error");
      } else {
        showToast("Failed to revoke invitation", "error");
      }
    }
  };

  // Group permissions by subject
  const permissionsBySubject = useMemo(() => {
    const grouped: Record<string, typeof permissionOptions> = {};
    permissionOptions.forEach((perm) => {
      if (!grouped[perm.subject]) grouped[perm.subject] = [];
      grouped[perm.subject].push(perm);
    });
    return grouped;
  }, [permissionOptions]);

  const subjects = Object.keys(permissionsBySubject).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">Invitation not found</h2>
        <button
          onClick={() => navigate("/team/invitations")}
          className="text-brand hover:underline"
        >
          Back to Invitations
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";

  return (
    <div className="px-4 py-6 min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/team/invitations")}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invitations
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">
              {invitation.first_name} {invitation.last_name}
            </h1>
            <div className="mt-2">
              {invitation.expired ? (
                <span className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                  Expired
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Valid
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand/5 disabled:opacity-50 transition-colors"
            >
              {resendMutation.isPending ? "Resending..." : "Resend"}
            </button>
            <button
              onClick={() => setRevokeConfirm(true)}
              disabled={revokeMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>

      {/* Invitation Details */}
      <div className="bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg text-neutral-900 dark:text-white">Invitation Details</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-brand hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              placeholder="+250788000001"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              value={roleSlug}
              onChange={(e) => setRoleSlug(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            >
              <option value="">Select a role...</option>
              {availableRoles.map((role) => (
                <option key={role.slug} value={role.slug}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Language</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "rw" | "en" | "fr")}
              disabled={!isEditing}
              className={inputClass}
            >
              <option value="rw">Kinyarwanda</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Expires: {new Date(invitation.expires_at).toLocaleString()}
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                if (invitation) {
                  setFirstName(invitation.first_name);
                  setLastName(invitation.last_name);
                  setEmail(invitation.email || "");
                  setPhone(invitation.phone_number || "");
                  setRoleSlug(invitation.role_slugs?.[0] || "");
                  setLocale(invitation.locale || "rw");
                }
              }}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Advanced Permissions */}
      <div className="bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="font-semibold text-lg text-neutral-900 dark:text-white">Advanced Permissions</h2>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-6 text-xs text-blue-700 dark:text-blue-300">
              These permissions take effect when the user accepts their invitation and logs in.
            </div>

            {/* Permissions table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Permission</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300 w-32">Own</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300 w-32">Org</th>
                    {isSuperAdmin && (
                      <th className="text-center py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300 w-32">Platform</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject} className="border-b border-gray-100 dark:border-neutral-800/50">
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">{subject}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-neutral-400">
                          <BiUser className="w-4 h-4" />
                          <span className="text-xs">via role</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-neutral-400">
                          <BsBuilding className="w-4 h-4" />
                          <span className="text-xs">via role</span>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-neutral-400">
                            <BiWorld className="w-4 h-4" />
                            <span className="text-xs">via role</span>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
              Direct grant management will be available in a future update. Currently, all permissions are inherited from the assigned role.
            </div>
          </div>
        )}
      </div>

      {/* Revoke confirmation dialog */}
      {revokeConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setRevokeConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md z-[60]">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">Revoke Invitation?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              This will permanently delete the invitation and prevent the invitee from using the link. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRevokeConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InvitationDetails;

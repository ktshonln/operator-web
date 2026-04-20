import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, buildCdnUrl } from "../services/apiClient";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { useToastStore } from "../stores/toastStore";
import SettingsNav from "../components/SettingsNav";
import { camelCaseToTitle } from "../utils/helpers";

// Fetch user by ID directly from GET /users/:id
function useUserById(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: user, isLoading, refetch } = useUserById(userId ?? "");
  const updateUser = useUpdateUser(userId ?? "");
  const deleteUser = useDeleteUser();

  const handleToggleStatus = () => {
    if (!user) return;
    const newStatus = user.status === "active" ? "suspended" : "active";
    updateUser.mutate({ status: newStatus }, {
      onSuccess: () => {
        refetch();
        showToast(`User ${newStatus === "active" ? "activated" : "suspended"}`, "success");
      },
      onError: (err: Error) => showToast(err.message, "error"),
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteUser.mutate(userId ?? "", {
      onSuccess: () => {
        showToast("User deleted", "success");
        navigate("/settings");
      },
      onError: (err: Error) => showToast(err.message, "error"),
    });
  };

  const avatarUrl = buildCdnUrl(user?.avatar_path);
  const initials = user ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() : "?";
  const fullName = user ? `${user.first_name} ${user.last_name}` : "";
  const roles: string[] = user?.roles ?? [];
  const primaryRole = roles[0] ?? "user";

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SettingsNav />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SettingsNav />
        <p className="text-neutral-500 dark:text-neutral-400 mt-8">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SettingsNav />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mt-4 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        <button onClick={() => navigate("/settings")} className="hover:text-brand transition-colors">
          Users
        </button>
        <span>/</span>
        <span className="text-neutral-900 dark:text-white font-medium">{fullName}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main card */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{fullName}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Status badge */}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : user.status === "suspended" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                    {camelCaseToTitle(user.status)}
                  </span>
                  {/* Role badge */}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700">
                    {camelCaseToTitle(primaryRole)}
                  </span>
                  {/* User type badge */}
                  {user.user_type && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {camelCaseToTitle(user.user_type)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {user.status !== "pending_verification" && (
                  <button
                    onClick={handleToggleStatus}
                    disabled={updateUser.isPending}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                      user.status === "active"
                        ? "border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                        : "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                    }`}
                  >
                    {updateUser.isPending ? "..." : user.status === "active" ? "Suspend" : "Activate"}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleteUser.isPending}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                    confirmDelete
                      ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                      : "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  }`}
                >
                  {deleteUser.isPending ? "Deleting..." : confirmDelete ? "Confirm Delete?" : "Delete"}
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {user.email && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email</span>
                  <span className="text-sm text-neutral-900 dark:text-white">{user.email}</span>
                </div>
              )}
              {user.phone_number && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Phone</span>
                  <span className="text-sm text-neutral-900 dark:text-white">{user.phone_number}</span>
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">User ID</span>
                <span className="text-sm text-neutral-900 dark:text-white font-mono bg-gray-50 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs">{user.id}</span>
              </div>
              {user.org_id && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Organization ID</span>
                  <span className="text-sm text-neutral-900 dark:text-white font-mono text-xs">{user.org_id}</span>
                </div>
              )}
              {user.last_login_at && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Last Login</span>
                  <span className="text-sm text-neutral-900 dark:text-white">{new Date(user.last_login_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Joined</span>
                <span className="text-sm text-neutral-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Roles */}
            {roles.length > 0 && (
              <div className="pt-2">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide mb-3">Roles</h2>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role: string) => (
                    <span key={role} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700">
                      {camelCaseToTitle(role)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">2FA</span>
                <span className={user.two_factor_enabled ? "text-green-600 dark:text-green-400" : "text-neutral-400"}>
                  {user.two_factor_enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              {user.login_channel && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Login via</span>
                  <span className="text-neutral-900 dark:text-white capitalize">{user.login_channel}</span>
                </div>
              )}
              {user.notif_channel && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Notifications</span>
                  <span className="text-neutral-900 dark:text-white">
                    {Array.isArray(user.notif_channel) ? user.notif_channel.join(", ") : user.notif_channel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;

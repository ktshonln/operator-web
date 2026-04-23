import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import useUsers, { UserQuery } from "../hooks/useUsers";
import AddAgent from "../components/AddAgent";
import useUser from "../hooks/useUser";
import Search from "../components/Search";
import { Can } from "../contexts/AbilityContext";
import { useOrganizations } from "../hooks/useOrganizations";
import { UsersTable } from "../components/UsersTable";
import { useMemo } from "react";

function Settings() {
  const { user } = useUser();
  const companyId = (user as any)?.org_id ?? "";
  const userId = user?.id ?? "";
  const [userQuery, setUserQuery] = useState<UserQuery>({ branch: null, sortOrder: "", searchText: "" });
  const [selectedOrgId, setSelectedOrgId] = useState<string>(companyId);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);

  const isSuperAdmin = user && "roles" in user && user.roles?.includes("platform-admin");
  const orgQueryResult = useOrganizations({});
  const allOrgs = (Array.isArray(orgQueryResult.data) ? orgQueryResult.data : []) as any[];

  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: permissionsData } = usePermissions();
  const availableRoles = useMemo(() => rolesData?.data || [], [rolesData]);
  const permissionOptions = useMemo(() => permissionsData?.data || [], [permissionsData]);

  const usersQuery = useUsers(selectedOrgId, userQuery);

  return (
    <div className="px-4 py-6 min-h-screen">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl">Users</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your organization's users and their access.
          </p>
        </div>
        <Can I="invite" a="User">
          <button
            onClick={() => setInvitePanelOpen(true)}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite User
          </button>
        </Can>
      </div>

      {/* Users card */}
      <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/90 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Status filter */}
            <div className="relative">
              <select
                value={userQuery.status || "all"}
                onChange={(e) => setUserQuery({ ...userQuery, status: e.target.value === "all" ? undefined : e.target.value as any })}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending_verification">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={userQuery.userType || "all"}
                onChange={(e) => setUserQuery({ ...userQuery, userType: e.target.value === "all" ? undefined : e.target.value as any })}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="staff">Staff</option>
                <option value="passenger">Passenger</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Org filter — superadmin only */}
            {isSuperAdmin && (
              <div className="relative">
                <select
                  value={selectedOrgId || "all"}
                  onChange={(e) => setSelectedOrgId(e.target.value === "all" ? "" : e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
                >
                  <option value="all">All Organizations</option>
                  {allOrgs.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64">
            <Search
              label="Search users..."
              onSearch={(searchText) => setUserQuery({ ...userQuery, searchText })}
              alt
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <UsersTable
            usersQuery={usersQuery}
            rolesLoading={rolesLoading}
            userQuery={userQuery}
            onClearFilters={() => setUserQuery({ branch: null, sortOrder: "", searchText: "" })}
          />
        </div>
      </div>

      {/* Invite User slide-over panel */}
      {invitePanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setInvitePanelOpen(false)}
          />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-neutral-950 shadow-2xl z-[60] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800 shrink-0">
              <div>
                <h2 className="font-bold text-lg dark:text-white">Invite User</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Send an invitation to join your organization.</p>
              </div>
              <button
                onClick={() => setInvitePanelOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AddAgent
                companyId={companyId}
                userId={userId}
                roles={availableRoles}
                permissionOptions={permissionOptions}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;


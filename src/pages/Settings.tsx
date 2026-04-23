import { useMemo, useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import SettingsNav from "../components/SettingsNav";
import useUsers, { UserQuery } from "../hooks/useUsers";
import ThemeToggle from "../components/ThemeToggle";
import AddAgent from "../components/AddAgent";
import useUser from "../hooks/useUser";
import Search from "../components/Search";
import { Can } from "../contexts/AbilityContext";
import RoleManager from "../components/RoleManager";
import { useOrganizations } from "../hooks/useOrganizations";
import { UsersTable } from "../components/UsersTable";



function Settings() {
  const { user } = useUser();
  const companyId = (user as any)?.org_id ?? "";
  const userId = user?.id ?? "";
  const [userQuery, setUserQuery] = useState<UserQuery>({
    branch: null,
    sortOrder: '',
    searchText: ''
  });
  const [activeTab, setActiveTab] = useState<"add" | "roles" | "theme">("add");
  const [selectedOrgId, setSelectedOrgId] = useState<string>(companyId);

  const isSuperAdmin = user && "roles" in user && user.roles?.includes("platform-admin");
  const orgQueryResult = useOrganizations({});
  const allOrgs = (Array.isArray(orgQueryResult.data) ? orgQueryResult.data : []) as any[];

  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: permissionsData } = usePermissions();

  const availableRoles = useMemo(() => rolesData?.data || [], [rolesData]);

  const permissionOptions = useMemo(
    () => permissionsData?.data || [],
    [permissionsData],
  );

  const usersQuery = useUsers(selectedOrgId, userQuery);

  const getPageTitle = () => {
    switch (activeTab) {
      case "add": return "Add New User";
      case "roles": return "Manage Roles & Permissions";
      case "theme": return "Theme Settings";
      default: return "General Settings";
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case "add": return "Create and invite new users to your organization";
      case "roles": return "Define roles and assign permissions to control access";
      case "theme": return "Customize the appearance of your application";
      default: return "Manage users, roles, and application settings";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      <div className="mb-4">
        <SettingsNav />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-auto lg:flex-1">
          <div className="mb-6">
            <h1 className="font-bold text-2xl mb-1">{getPageTitle()}</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {getPageDescription()}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[450px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-neutral-800 shrink-0">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "add"
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Add User
                </button>
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "roles"
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Roles
                </button>
                <button
                  onClick={() => setActiveTab("theme")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "theme"
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Theme
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-10">
                {activeTab === "add" && (
                  <Can I="create" a="User">
                    <AddAgent
                      companyId={companyId}
                      userId={userId}
                      roles={availableRoles}
                      permissionOptions={permissionOptions}
                    />
                  </Can>
                )}
                {activeTab === "roles" && (
                  <RoleManager
                    roles={availableRoles}
                    permissionOptions={permissionOptions}
                  />
                )}
                {activeTab === "theme" && (
                  <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      Choose your preferred theme for the application.
                    </p>
                    <ThemeToggle />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full min-w-0">
              <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/90 shadow-sm overflow-hidden">
                {/* Card header — sticky title + search */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="font-bold text-lg dark:text-white">
                      Current users
                    </h2>
                    <div className="w-full sm:w-auto">
                      <Search
                        label="Search users..."
                        onSearch={(searchText) =>
                          setUserQuery({ ...userQuery, searchText })
                        }
                        alt
                      />
                    </div>
                  </div>
                </div>

                {/* Scrollable content area */}
                <div className="flex flex-col px-6 pb-6" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                  {/* Filters row — compact dropdowns */}
                  <div className="shrink-0 flex flex-wrap gap-3 items-center pt-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
                    {/* Status filter */}
                    <div className="relative">
                      <select
                        value={userQuery.status || 'all'}
                        onChange={(e) => setUserQuery({ ...userQuery, status: e.target.value === 'all' ? undefined : e.target.value as any })}
                        className="appearance-none px-4 py-2 pr-10 text-sm font-medium rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending_verification">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* User type filter */}
                    <div className="relative">
                      <select
                        value={userQuery.userType || 'all'}
                        onChange={(e) => setUserQuery({ ...userQuery, userType: e.target.value === 'all' ? undefined : e.target.value as any })}
                        className="appearance-none px-4 py-2 pr-10 text-sm font-medium rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
                      >
                        <option value="all">All Types</option>
                        <option value="staff">Staff</option>
                        <option value="passenger">Passenger</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Org filter for superadmin */}
                    {isSuperAdmin && (
                      <div className="relative">
                        <select
                          value={selectedOrgId || 'all'}
                          onChange={(e) => setSelectedOrgId(e.target.value === 'all' ? '' : e.target.value)}
                          className="appearance-none px-4 py-2 pr-10 text-sm font-medium rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
                        >
                          <option value="all">All Organizations</option>
                          {allOrgs.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Scrollable table area */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 min-w-0">
                    <UsersTable
                      usersQuery={usersQuery}
                      rolesLoading={rolesLoading}
                      userQuery={userQuery}
                    />
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

export default Settings;

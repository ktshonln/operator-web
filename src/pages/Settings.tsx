import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import SettingsNav from "../components/SettingsNav";
import useAgents from "../hooks/useAgents";
import { camelCaseToTitle } from "../utils/helpers";
import { AgentQuery } from "./ProfileSettings";
import ThemeToggle from "../components/ThemeToggle";
import AddAgent from "../components/AddAgent";
import useUser from "../hooks/useUser";
import Search from "../components/Search";
import DropDown from "../components/DropDown";
import { Can } from "../contexts/AbilityContext";
import RoleManager from "../components/RoleManager";
import useUpdateAgent from "../hooks/useUpdateAgent";
import { GrantDisplay } from "../components/AddAgent";
import { useOrganizations } from "../hooks/useOrganizations";



function Settings() {
  const { user } = useUser();
  const companyId = (user as any)?.org_id ?? "";
  const userId = user?.id ?? "";
  const tableHeaders = [
    "userId",
    "name",
    "email",
    "phoneNumber",
    "role",
    "status",
  ];
  const navigate = useNavigate();
  const [agentQuery, setAgentQuery] = useState<AgentQuery>({} as AgentQuery);
  const [roleSelection, setRoleSelection] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"add" | "roles" | "theme">("add");
  const [selectedOrgId, setSelectedOrgId] = useState<string>(companyId);

  const isSuperAdmin = user && "roles" in user && user.roles?.includes("platform-admin");
  const orgQueryResult = useOrganizations({});
  const allOrgs = (Array.isArray(orgQueryResult.data) ? orgQueryResult.data : []) as any[];
  const orgNames = ["All Organizations", ...allOrgs.map(o => o.name)];

  const updateRole = useUpdateAgent(selectedOrgId || companyId);

  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: permissionsData } = usePermissions();

  const availableRoles = useMemo(() => rolesData?.data || [], [rolesData]);

  const roleNames = useMemo(
    () => availableRoles.map((role) => role.slug),
    [availableRoles],
  );

  const permissionOptions = useMemo(
    () => permissionsData?.data || [],
    [permissionsData],
  );

  const getGrantDisplay = (pattern: string): GrantDisplay => {
    const parts = pattern.split(":");
    const scope = parts.length >= 3 ? parts.pop() || "" : "";
    const code = parts.join(":");
    const perm = permissionOptions.find((p) => p.code === code);
    
    // Grammatical Fallback Engine (Action Subject+s)
    let fallbackName = code;
    if (code === "*:*") fallbackName = "Full Access";
    else if (code.includes(":")) {
      const [subject, action] = code.split(":");
      if (subject && action) {
        const capAction = action.charAt(0).toUpperCase() + action.slice(1);
        const pluralSubject = subject.endsWith("s") ? subject : `${subject}s`;
        fallbackName = `${capAction} ${pluralSubject}`;
      }
    }

    return {
      pattern,
      displayName: perm ? perm.display_name : fallbackName,
      description: perm?.description ?? "No description provided by backend catalog.",
      scope
    };
  };

  const rolePermissions = useMemo(
    () =>
      availableRoles.reduce<Record<string, GrantDisplay[]>>((acc, role) => {
        acc[role.slug] = role.grants ? role.grants.map((g) => getGrantDisplay(g.pattern)) : [];
        return acc;
      }, {}),
    [availableRoles, permissionOptions],
  );

  const handleRoleChange = (userId: string, role: string) => {
    setRoleSelection((prev) => ({ ...prev, [userId]: role }));
    if (companyId) {
      updateRole.mutate({ userId, role });
    }
  };

  const getSelectedRole = (userId: string, fallbackRole: string) =>
    roleSelection[userId] ?? fallbackRole;

  // Use selectedOrgId instead of static companyId. If "All Logs" (no specific org ID), we can omit or send what the API expects.
  // We'll pass selectedOrgId if it's set and not the generic bypass.
  const { data: agents, isLoading } = useAgents(selectedOrgId, agentQuery);

  const getPageTitle = () => {
    switch (activeTab) {
      case "add":
        return "Add New User";
      case "roles":
        return "Manage Roles & Permissions";
      case "theme":
        return "Theme Settings";
      default:
        return "General Settings";
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case "add":
        return "Create and invite new users to your organization";
      case "roles":
        return "Define roles and assign permissions to control access";
      case "theme":
        return "Customize the appearance of your application";
      default:
        return "Manage users, roles, and application settings";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-20px)] flex flex-col overflow-hidden">
      <div className="shrink-0 mb-4">
        <SettingsNav />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-4 shrink-0">
            <h1 className="font-bold text-2xl mb-1">{getPageTitle()}</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {getPageDescription()}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(400px,450px)_1fr] flex-1 min-h-0">
            <div className="flex flex-col min-h-0 space-y-4">
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
                      roles={roleNames}
                      rolePermissions={rolePermissions}
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
            <div className="w-full flex flex-col min-h-0">
              <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/90 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 shrink-0">
                  <h2 className="font-bold text-lg dark:text-white">
                    Current users
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-4 overflow-hidden h-full">
                  <div className="shrink-0 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full">
                      <Search
                        label="Search users..."
                        onSearch={(searchText) =>
                          setAgentQuery({ ...agentQuery, searchText: searchText })
                        }
                        alt
                      />
                    </div>
                    {isSuperAdmin && (
                      <div className="w-full md:w-64 z-10 shrink-0">
                        <DropDown
                          options={orgNames}
                          value={allOrgs.find(o => o.id === selectedOrgId)?.name || "All Organizations"}
                          onSelect={(choice) => {
                            if (choice === "All Organizations") setSelectedOrgId("");
                            else {
                              const org = allOrgs.find(o => o.name === choice);
                              if (org) setSelectedOrgId(org.id);
                            }
                          }}
                          style="v2"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          <th className="px-3 py-2">#</th>
                          {tableHeaders
                            .filter((h) => h !== "userId")
                            .map((header, i) => (
                              <th key={i} className="px-3 py-2">
                                {camelCaseToTitle(header)}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                        {isLoading || rolesLoading ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4">
                              Loading...
                            </td>
                          </tr>
                        ) : null}
                        {agents?.pages.map((page, pageIndex) => (
                          <React.Fragment key={pageIndex}>
                            {page?.map(
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
                                rowIndex,
                              ) => (
                                <tr
                                  key={userId || rowIndex}
                                  onClick={() => {
                                    navigate(`/settings/user/${userId}`);
                                  }}
                                  className="hover:bg-gray-50 dark:text-white dark:hover:bg-neutral-900 cursor-pointer"
                                >
                                  <td className="px-3 py-3">{rowIndex + 1}</td>
                                  <td className="px-3 py-3">
                                    {firstName} {lastName}
                                  </td>
                                  <td className="px-3 py-3">{email}</td>
                                  <td className="px-3 py-3">{phoneNumber}</td>
                                  <td
                                    className="px-3 py-3"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="max-w-[240px] w-full">
                                      <DropDown
                                        key={getSelectedRole(userId, role)}
                                        options={roleNames}
                                        onSelect={(choice) =>
                                          handleRoleChange(userId, choice)
                                        }
                                        label={(choice) =>
                                          camelCaseToTitle(choice)
                                        }
                                        value={getSelectedRole(userId, role)}
                                        style="v1"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    {camelCaseToTitle(status)}
                                  </td>
                                </tr>
                              ),
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
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

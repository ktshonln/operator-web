import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

type RoleDefinition = {
  name: string;
  permissions: string[];
};

const defaultRoles: RoleDefinition[] = [
  {
    name: "admin",
    permissions: [
      "Sell tickets",
      "Schedule trips",
      "Manage users",
      "Manage routes",
      "View reports",
    ],
  },
  {
    name: "agentManager",
    permissions: ["Manage users", "View reports", "Schedule trips"],
  },
  {
    name: "agent",
    permissions: ["Sell tickets", "View reports"],
  },
];

const permissionOptions = [
  "Sell tickets",
  "Schedule trips",
  "Manage users",
  "Manage routes",
  "View reports",
  "Manage company settings",
];

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
  const [availableRoles, setAvailableRoles] =
    useState<RoleDefinition[]>(defaultRoles);
  const [roleSelection, setRoleSelection] = useState<Record<string, string>>(
    {},
  );
  const [activeTab, setActiveTab] = useState<"add" | "roles" | "theme">("add");
  const updateRole = useUpdateAgent(companyId);

  const handleCreateRole = (role: RoleDefinition) => {
    const normalized = role.name.trim();
    if (!normalized || availableRoles.some((item) => item.name === normalized))
      return;
    setAvailableRoles((prev) => [...prev, { ...role, name: normalized }]);
  };

  const handleRoleChange = (userId: string, role: string) => {
    setRoleSelection((prev) => ({ ...prev, [userId]: role }));
    if (companyId) {
      updateRole.mutate({ userId, role });
    }
  };

  const getSelectedRole = (userId: string, fallbackRole: string) =>
    roleSelection[userId] ?? fallbackRole;

  const roleNames = useMemo(
    () => availableRoles.map((role) => role.name),
    [availableRoles],
  );

  const rolePermissions = useMemo(
    () =>
      availableRoles.reduce<Record<string, string[]>>((acc, role) => {
        acc[role.name] = role.permissions;
        return acc;
      }, {}),
    [availableRoles],
  );

  const { data: agents, isLoading } = useAgents(companyId, agentQuery);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SettingsNav />

      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="font-bold text-2xl mb-2">{getPageTitle()}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {getPageDescription()}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(400px,450px)_1fr]">
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-neutral-800">
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
              <div className="min-h-[400px]">
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
                    onCreateRole={handleCreateRole}
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
            <div className="w-full">
              <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/90 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800">
                  <h2 className="font-bold text-lg dark:text-white">
                    Current users
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <Search
                    label="Search users..."
                    onSearch={(searchText) =>
                      setAgentQuery({ ...agentQuery, searchText: searchText })
                    }
                    alt
                  />
                  <div className="overflow-x-auto">
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
                        {isLoading && (
                          <tr>
                            <td colSpan={6} className="px-3 py-4">
                              Loading...
                            </td>
                          </tr>
                        )}
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

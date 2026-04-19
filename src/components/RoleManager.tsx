import { useState, useMemo } from "react";
import { useCreateRole } from "../hooks/useCreateRole";
import { Role } from "../hooks/useRoles";
import { Permission } from "../hooks/usePermissions";

interface RoleManagerProps {
  roles: Role[];
  permissionOptions: Permission[];
}

const RoleManager = ({ roles, permissionOptions }: RoleManagerProps) => {
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const createRole = useCreateRole();

  const groupedPermissions = useMemo(() => {
    return permissionOptions.reduce((groups, permission) => {
      const group = permission.group || "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }, [permissionOptions]);

  const handleCreate = () => {
    const trimmed = roleName.trim();
    if (!trimmed) {
      setError("Role name cannot be empty.");
      return;
    }
    if (roles.some((role) => role.name === trimmed)) {
      setError("This role already exists.");
      return;
    }

    const patterns = selectedPermissions.map(code => `${code}:org`);

    createRole.mutate(
      { name: trimmed, patterns },
      {
        onSuccess: () => {
          setRoleName("");
          setSelectedPermissions([]);
          setError("");
        },
        onError: () => {
          setError("Failed to create role.");
        },
      }
    );
  };

  const togglePermission = (permission: string) => {
    setError("");
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        Create a role, assign core permissions, and then use it when adding
        users.
      </p>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="New role name"
            className="w-full rounded-sm border border-gray-200 p-2 text-sm outline-none dark:bg-black dark:text-white dark:border-neutral-800"
            disabled={createRole.isPending}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={createRole.isPending}
            className="bg-brand text-white px-4 py-2 rounded-sm text-sm hover:brightness-95 disabled:opacity-50"
          >
            {createRole.isPending ? "Creating..." : "Create"}
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                {group}
              </h4>
              <div className="flex flex-wrap gap-2">
                {perms.map((permission) => (
                  <button
                    key={permission.code}
                    type="button"
                    onClick={() => togglePermission(permission.code)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedPermissions.includes(permission.code)
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-gray-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
                    }`}
                  >
                    {permission.display_name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
          <h3 className="font-semibold text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
            Existing roles
          </h3>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-lg border border-gray-100 dark:border-neutral-800 p-3 bg-gray-50 dark:bg-neutral-950"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {role.name}
                    </p>
                    {role.is_managed && (
                      <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded-sm dark:text-neutral-300">
                        Managed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] uppercase text-neutral-500 dark:text-neutral-400">
                    {role.grants.length} permissions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {role.grants.map((grant) => (
                    <span
                      key={grant.id}
                      className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {grant.pattern}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;


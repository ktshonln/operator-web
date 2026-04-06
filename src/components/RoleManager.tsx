import { useState } from "react";

type RoleDefinition = {
  name: string;
  permissions: string[];
};

interface RoleManagerProps {
  roles: RoleDefinition[];
  permissionOptions: string[];
  onCreateRole: (role: RoleDefinition) => void;
}

const RoleManager = ({
  roles,
  permissionOptions,
  onCreateRole,
}: RoleManagerProps) => {
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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

    onCreateRole({ name: trimmed, permissions: selectedPermissions });
    setRoleName("");
    setSelectedPermissions([]);
    setError("");
  };

  const togglePermission = (permission: string) => {
    setError("");
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    );
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
      <h2 className="font-bold text-lg mb-2 dark:text-white">
        Role management
      </h2>
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
          />
          <button
            type="button"
            onClick={handleCreate}
            className="bg-brand text-white px-4 py-2 rounded-sm text-sm hover:brightness-95"
          >
            Create
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {permissionOptions.map((permission) => (
            <button
              key={permission}
              type="button"
              onClick={() => togglePermission(permission)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                selectedPermissions.includes(permission)
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-gray-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
              }`}
            >
              {permission}
            </button>
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
                key={role.name}
                className="rounded-lg border border-gray-100 dark:border-neutral-800 p-3 bg-gray-50 dark:bg-neutral-950"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {role.name}
                  </p>
                  <p className="text-[11px] uppercase text-neutral-500 dark:text-neutral-400">
                    {role.permissions.length} permissions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {permission}
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

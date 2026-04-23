import { useState, useMemo, useRef, useEffect } from "react";
import { useRoles, useRoleById, Role } from "../hooks/useRoles";
import { usePermissions, Permission } from "../hooks/usePermissions";
import { useDeleteRole } from "../hooks/useDeleteRole";
import { useCreateRole } from "../hooks/useCreateRole";
import { useUpdateRole } from "../hooks/useUpdateRole";
import { useAddGrant } from "../hooks/useAddGrant";
import { useRemoveGrant } from "../hooks/useRemoveGrant";
import { useToastStore } from "../stores/toastStore";
import { Can } from "../contexts/AbilityContext";
import { BsBuilding, BsLock } from "react-icons/bs";
import { BiWorld, BiUser } from "react-icons/bi";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function buildGrantDisplay(pattern: string, permissionOptions: Permission[]) {
  const parts = pattern.split(":");
  const scope = parts.length >= 3 ? parts.pop() || "" : "";
  const code = parts.join(":");
  const perm = permissionOptions.find((p) => p.code === code);
  let fallbackName = code;
  if (code === "*:*") fallbackName = "Full Access";
  else if (code.includes(":")) {
    const [subject, action] = code.split(":");
    if (subject && action) {
      const capAction = action.charAt(0).toUpperCase() + action.slice(1);
      fallbackName = `${capAction} ${subject.endsWith("s") ? subject : subject + "s"}`;
    }
  }
  return {
    pattern,
    displayName: perm ? perm.display_name : fallbackName,
    description: perm?.description ?? "No description provided.",
    scope,
  };
}

function ScopeIcon({ scope }: { scope: string }) {
  if (scope === "org") return <BsBuilding title="Organization scope" />;
  if (scope === "platform") return <BiWorld title="Platform scope" />;
  if (scope === "own") return <BiUser title="Self scope" />;
  return null;
}

// The same badge style used in AddAgent permissions preview
function GrantBadge({
  grant,
  onRemove,
  isManaged,
}: {
  grant: { pattern: string; displayName: string; description: string; scope: string };
  onRemove?: () => void;
  isManaged?: boolean;
}) {
  return (
    <div className="rounded-md border border-brand/20 bg-brand/5 px-3 py-1.5 flex flex-col relative group">
      <div className="flex items-center text-brand font-medium text-xs">
        {grant.displayName}
        <div className="ml-1.5 opacity-70 flex items-center">
          <ScopeIcon scope={grant.scope} />
        </div>
        {onRemove && !isManaged && (
          <button
            onClick={onRemove}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
            title="Remove grant"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <span className="text-[10px] text-brand/70 mt-0.5 truncate max-w-[220px]" title={grant.description}>
        {grant.description}
      </span>
    </div>
  );
}

// ─── Role detail / edit slide-over ───────────────────────────────────────────

function RoleDetailPanel({
  role,
  permissionOptions,
  onClose,
}: {
  role: Role;
  permissionOptions: Permission[];
  onClose: () => void;
}) {
  const { data: roleDetail, isLoading } = useRoleById(role.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(role.name);
  const [addingGrant, setAddingGrant] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedScope, setSelectedScope] = useState<"own" | "org" | "platform">("org");
  const { showToast } = useToastStore();

  const updateRole = useUpdateRole(role.id);
  const addGrant = useAddGrant(role.id);
  const removeGrant = useRemoveGrant(role.id);

  const grants = roleDetail?.grants ?? [];

  // Available scopes for the selected permission
  const selectedPerm = permissionOptions.find((p) => p.code === selectedCode);
  const availableScopes = selectedPerm?.scopes ?? ["own", "org", "platform"];

  const groupedPermissions = useMemo(() =>
    permissionOptions.reduce((groups, perm) => {
      const g = perm.group || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(perm);
      return groups;
    }, {} as Record<string, Permission[]>),
    [permissionOptions]
  );

  const handleRename = () => {
    if (!editName.trim()) return;
    updateRole.mutate({ name: editName.trim() }, {
      onSuccess: () => { setIsEditing(false); showToast("Role renamed", "success"); },
      onError: (err: any) => showToast(err.message, "error"),
    });
  };

  const handleAddGrant = () => {
    if (!selectedCode) return;
    const pattern = `${selectedCode}:${selectedScope}`;
    addGrant.mutate({ pattern }, {
      onSuccess: () => { setAddingGrant(false); setSelectedCode(""); showToast("Grant added", "success"); },
      onError: (err: any) => showToast(err.message, "error"),
    });
  };

  const handleRemoveGrant = (grantId: string, isManaged: boolean) => {
    if (isManaged) { showToast("Managed grants cannot be removed.", "error"); return; }
    removeGrant.mutate(grantId, {
      onSuccess: () => showToast("Grant removed", "success"),
      onError: (err: any) => showToast(err.message, "error"),
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[59]" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-neutral-950 shadow-2xl z-[60] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800 shrink-0">
          <div className="flex-1 min-w-0">
            {isEditing && !role.is_managed ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b-2 border-brand outline-none dark:text-white"
                  autoFocus
                />
                <button onClick={handleRename} disabled={updateRole.isPending}
                  className="text-xs bg-brand text-white px-3 py-1 rounded-lg hover:brightness-95 disabled:opacity-50">
                  {updateRole.isPending ? "..." : "Save"}
                </button>
                <button onClick={() => { setIsEditing(false); setEditName(role.name); }}
                  className="text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg dark:text-white truncate">{roleDetail?.name ?? role.name}</h2>
                {!role.is_managed && (
                  <Can I="update" a="Role">
                    <button onClick={() => setIsEditing(true)}
                      className="text-neutral-400 hover:text-brand transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </Can>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-400 font-mono">{role.slug}</span>
              {role.is_managed && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded-sm">
                  <BsLock className="w-2.5 h-2.5" /> Managed
                </span>
              )}
              <span className="text-[10px] text-neutral-400 bg-gray-50 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">
                {role.org_id ? "Org-scoped" : "Global"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors ml-2 shrink-0">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* Grants section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Permissions ({grants.length})
              </h3>
              {!role.is_managed && (
                <Can I="update" a="Role">
                  <button
                    onClick={() => setAddingGrant((v) => !v)}
                    className="text-xs text-brand hover:underline flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add permission
                  </button>
                </Can>
              )}
            </div>

            {/* Add grant form */}
            {addingGrant && (
              <div className="mb-4 p-4 rounded-xl border border-brand/20 bg-brand/5 space-y-3">
                <p className="text-xs font-semibold text-brand">Add a permission</p>
                <div className="space-y-2">
                  {Object.entries(groupedPermissions).map(([group, perms]) => (
                    <div key={group}>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {perms.map((perm) => (
                          <button
                            key={perm.code}
                            type="button"
                            onClick={() => { setSelectedCode(perm.code); setSelectedScope((perm.scopes?.[0] ?? "org") as any); }}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              selectedCode === perm.code
                                ? "border-brand bg-brand text-white"
                                : "border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand hover:text-brand"
                            }`}
                          >
                            {perm.display_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedCode && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Scope:</span>
                    <div className="flex gap-1">
                      {availableScopes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedScope(s as any)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                            selectedScope === s
                              ? "border-brand bg-brand text-white"
                              : "border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleAddGrant}
                      disabled={addGrant.isPending}
                      className="ml-auto text-xs bg-brand text-white px-3 py-1.5 rounded-lg hover:brightness-95 disabled:opacity-50"
                    >
                      {addGrant.isPending ? "Adding..." : "Add"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Grants list */}
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400 py-4">
                <div className="animate-spin rounded-full h-3 w-3 border border-brand border-t-transparent" />
                Loading permissions...
              </div>
            ) : grants.length === 0 ? (
              <p className="text-sm text-neutral-400 py-2">No permissions assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {grants.map((g) => {
                  const display = buildGrantDisplay(g.pattern, permissionOptions);
                  return (
                    <GrantBadge
                      key={g.id}
                      grant={display}
                      isManaged={g.is_managed}
                      onRemove={() => handleRemoveGrant(g.id, g.is_managed)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Role card 3-dot menu ─────────────────────────────────────────────────────

function RoleCardMenu({ role, onDelete, onView }: { role: Role; onDelete: () => void; onView: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setConfirmDelete(false); return; }
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 z-50 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View / Edit
          </button>
          {!role.is_managed && (
            <Can I="delete" a="Role">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!confirmDelete) { setConfirmDelete(true); return; }
                  onDelete();
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                  confirmDelete
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "hover:bg-gray-50 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {confirmDelete ? "Confirm Delete?" : "Delete Role"}
              </button>
            </Can>
          )}
          {role.is_managed && (
            <div className="px-4 py-2.5 text-xs text-neutral-400 flex items-center gap-2">
              <BsLock className="w-3 h-3" /> Managed — read only
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  permissionOptions,
  onDelete,
  onView,
}: {
  role: Role;
  permissionOptions: Permission[];
  onDelete: () => void;
  onView: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: roleDetail, isLoading } = useRoleById(expanded ? role.id : "");
  const grants = roleDetail?.grants ?? [];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-neutral-900 dark:text-white">{role.name}</span>
            {role.is_managed && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded-sm">
                <BsLock className="w-2.5 h-2.5" /> Managed
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-gray-50 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              {role.org_id ? <BsBuilding className="w-2.5 h-2.5" title="Org-scoped" /> : <BiWorld className="w-2.5 h-2.5" title="Global" />}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-neutral-400 hover:text-brand transition-colors px-2 py-1 rounded"
          >
            {expanded ? "Hide" : "Permissions"}
          </button>
          <RoleCardMenu role={role} onDelete={onDelete} onView={onView} />
        </div>
      </div>

      {/* Inline permissions preview — same badge style as AddAgent */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <div className="animate-spin rounded-full h-3 w-3 border border-brand border-t-transparent" />
              Loading...
            </div>
          ) : grants.length === 0 ? (
            <p className="text-xs text-neutral-400">No permissions assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {grants.map((g) => {
                const display = buildGrantDisplay(g.pattern, permissionOptions);
                return <GrantBadge key={g.id} grant={display} isManaged={g.is_managed} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create Role slide-over ───────────────────────────────────────────────────

function CreateRolePanel({ permissionOptions, onClose }: { permissionOptions: Permission[]; onClose: () => void }) {
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<{ code: string; scope: "own" | "org" | "platform" }[]>([]);
  const [error, setError] = useState("");
  const createRole = useCreateRole();

  const groupedPermissions = useMemo(() =>
    permissionOptions.reduce((groups, perm) => {
      const g = perm.group || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(perm);
      return groups;
    }, {} as Record<string, Permission[]>),
    [permissionOptions]
  );

  const togglePermission = (perm: Permission) => {
    setError("");
    setSelectedPermissions((prev) => {
      const exists = prev.find((p) => p.code === perm.code);
      if (exists) return prev.filter((p) => p.code !== perm.code);
      const defaultScope = (perm.scopes?.[0] ?? "org") as "own" | "org" | "platform";
      return [...prev, { code: perm.code, scope: defaultScope }];
    });
  };

  const setScope = (code: string, scope: "own" | "org" | "platform") => {
    setSelectedPermissions((prev) => prev.map((p) => p.code === code ? { ...p, scope } : p));
  };

  const handleCreate = () => {
    const trimmed = roleName.trim();
    if (!trimmed) { setError("Role name is required."); return; }
    if (selectedPermissions.length === 0) { setError("Select at least one permission."); return; }
    const patterns = selectedPermissions.map(({ code, scope }) => `${code}:${scope}`);
    createRole.mutate({ name: trimmed, patterns }, {
      onSuccess: () => { onClose(); },
      onError: () => setError("Failed to create role."),
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[59]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-neutral-950 shadow-2xl z-[60] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="font-bold text-lg dark:text-white">Create Role</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Define a new role and assign permissions.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
          {/* Role name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role name</label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Senior Dispatcher"
              className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>

          {/* Permission picker */}
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Permissions</p>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">{group}</h4>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => {
                      const selected = selectedPermissions.find((p) => p.code === perm.code);
                      return (
                        <button
                          key={perm.code}
                          type="button"
                          onClick={() => togglePermission(perm)}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            selected
                              ? "border-brand bg-brand/10 text-brand"
                              : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:border-brand hover:text-brand"
                          }`}
                        >
                          {perm.display_name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected permissions with scope picker — same badge style */}
          {selectedPermissions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
                Selected permissions
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPermissions.map(({ code, scope }) => {
                  const perm = permissionOptions.find((p) => p.code === code);
                  const display = buildGrantDisplay(`${code}:${scope}`, permissionOptions);
                  const availableScopes = perm?.scopes ?? ["own", "org", "platform"];
                  return (
                    <div key={code} className="rounded-md border border-brand/20 bg-brand/5 px-3 py-1.5 flex flex-col">
                      <div className="flex items-center text-brand font-medium text-xs gap-1.5">
                        {display.displayName}
                        <div className="opacity-70"><ScopeIcon scope={scope} /></div>
                        <button
                          onClick={() => togglePermission(perm!)}
                          className="text-red-400 hover:text-red-600 ml-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-[10px] text-brand/70 mt-0.5 truncate max-w-[200px]">{display.description}</span>
                      {availableScopes.length > 1 && (
                        <div className="flex gap-1 mt-1.5">
                          {availableScopes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setScope(code, s as any)}
                              className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                                scope === s
                                  ? "border-brand bg-brand text-white"
                                  : "border-brand/30 text-brand/70 hover:border-brand"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 shrink-0">
          <button
            onClick={handleCreate}
            disabled={createRole.isPending}
            className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-95 transition-colors disabled:opacity-50"
          >
            {createRole.isPending ? "Creating..." : "Create Role"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function RolesSettings() {
  const [search, setSearch] = useState("");
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { showToast } = useToastStore();

  const { data: rolesData, isLoading } = useRoles();
  const { data: permissionsData } = usePermissions();
  const allRoles = useMemo(() => rolesData?.data || [], [rolesData]);
  const permissionOptions = useMemo(() => permissionsData?.data || [], [permissionsData]);
  const deleteRole = useDeleteRole();

  const filteredRoles = useMemo(() =>
    allRoles.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase())
    ),
    [allRoles, search]
  );

  const handleDelete = (roleId: string) => {
    deleteRole.mutate(roleId, {
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        if (code === "ROLE_HAS_PENDING_INVITATIONS") {
          showToast("This role has pending invitations. Resolve them before deleting.", "error");
        } else {
          showToast(err.message || "Failed to delete role.", "error");
        }
      },
    });
  };

  return (
    <div className="px-4 py-6 min-h-screen">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl">Roles</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Define roles and assign permissions to control what users can do.
          </p>
        </div>
        <Can I="create" a="Role">
          <button
            onClick={() => setCreatePanelOpen(true)}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Role
          </button>
        </Can>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>
      </div>

      {/* Roles grid */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12 text-neutral-400">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent" />
          Loading roles...
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-neutral-400">
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="font-medium">No roles found</p>
          <p className="text-sm mt-1">{search ? "Try a different search term" : "Create your first role to get started"}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 overflow-visible">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              permissionOptions={permissionOptions}
              onDelete={() => handleDelete(role.id)}
              onView={() => setSelectedRole(role)}
            />
          ))}
        </div>
      )}

      {/* Create Role slide-over */}
      {createPanelOpen && (
        <CreateRolePanel
          permissionOptions={permissionOptions}
          onClose={() => setCreatePanelOpen(false)}
        />
      )}

      {/* Role detail / edit slide-over */}
      {selectedRole && (
        <RoleDetailPanel
          role={selectedRole}
          permissionOptions={permissionOptions}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
}

export default RolesSettings;


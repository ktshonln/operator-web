import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useOrganizations,
  Organization,
  useApproveOrganization,
  useSuspendOrganization,
} from "../hooks/useOrganizations";
import { Can, useAbility } from "../contexts/AbilityContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: Organization["status"]) {
  const map: Record<Organization["status"], string> = {
    unverified: "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function typeBadge(type: Organization["org_type"]) {
  const map: Record<Organization["org_type"], string> = {
    company: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cooperative: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    coop_member: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  };
  return map[type] ?? "bg-gray-100 text-gray-600";
}

function typeLabel(type: Organization["org_type"]) {
  if (type === "coop_member") return "Coop Member";
  if (type === "cooperative") return "Cooperative";
  return "Company";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// ─── Reject dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  org,
  onConfirm,
  onCancel,
  isPending,
}: {
  org: Organization;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onCancel} />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-lg dark:text-white mb-1">Reject Organization</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Provide a reason for rejecting <span className="font-medium text-neutral-700 dark:text-neutral-200">{org.name}</span>.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Rejection reason..."
            className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-colors resize-none"
          />
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => reason.trim() && onConfirm(reason.trim())}
              disabled={!reason.trim() || isPending}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isPending ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Suspend dialog ───────────────────────────────────────────────────────────

function SuspendDialog({
  org,
  onConfirm,
  onCancel,
  isPending,
}: {
  org: Organization;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onCancel} />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-lg dark:text-white mb-1">Suspend Organization</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Are you sure you want to suspend <span className="font-medium text-neutral-700 dark:text-neutral-200">{org.name}</span>? Users in this org will lose access.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isPending ? "Suspending..." : "Suspend"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Card ⋯ menu ──────────────────────────────────────────────────────────────

function OrgCardMenu({
  org,
  isPlatformAdmin,
  onView,
  onSuspend,
  onReject,
}: {
  org: Organization;
  isPlatformAdmin: boolean;
  onView: () => void;
  onSuspend: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
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
        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 z-50 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          {isPlatformAdmin && org.status !== "suspended" && (
            <button
              onClick={(e) => { e.stopPropagation(); onSuspend(); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 text-orange-600 dark:text-orange-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspend
            </button>
          )}
          {isPlatformAdmin && org.status !== "rejected" && (
            <button
              onClick={(e) => { e.stopPropagation(); onReject(); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 text-red-600 dark:text-red-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Org card ─────────────────────────────────────────────────────────────────

function OrgCard({
  org,
  isPlatformAdmin,
  onView,
  onSuspend,
  onReject,
}: {
  org: Organization;
  isPlatformAdmin: boolean;
  onView: () => void;
  onSuspend: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
      onClick={onView}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 dark:text-white truncate">{org.name}</p>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">@{org.slug}</p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <OrgCardMenu
            org={org}
            isPlatformAdmin={isPlatformAdmin}
            onView={onView}
            onSuspend={onSuspend}
            onReject={onReject}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${typeBadge(org.org_type)}`}>
          {typeLabel(org.org_type)}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${statusBadge(org.status)}`}>
          {org.status}
        </span>
      </div>

      {/* Contact */}
      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        <p className="font-medium text-neutral-700 dark:text-neutral-300">
          {org.contact_first_name} {org.contact_last_name}
        </p>
        <p className="truncate">{org.contact_email}</p>
        {org.contact_phone && <p>{org.contact_phone}</p>}
      </div>

      {/* Coop approved date */}
      {org.org_type === "coop_member" && org.cooperative_approved_at && (
        <p className="text-[11px] text-purple-600 dark:text-purple-400">
          Coop approved: {formatDate(org.cooperative_approved_at)}
        </p>
      )}

      {/* Footer */}
      <p className="text-[11px] text-neutral-400 mt-auto pt-1 border-t border-gray-100 dark:border-neutral-800">
        Created {formatDate(org.created_at)}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const Organizations = () => {
  const navigate = useNavigate();
  const ability = useAbility();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Organization["status"] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<Organization["org_type"] | "all">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [suspendTarget, setSuspendTarget] = useState<Organization | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Organization | null>(null);

  const isPlatformAdmin = ability.can("manage", "all");

  const queryResult = useOrganizations({
    status: statusFilter !== "all" ? statusFilter : undefined,
    org_type: typeFilter !== "all" ? typeFilter : undefined,
    search: search || undefined,
    page,
    limit,
  });

  const orgsPage = queryResult.data as { data: Organization[]; total: number; page: number; limit: number } | undefined;
  const organizations: Organization[] = orgsPage?.data ?? [];
  const total = orgsPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const { isLoading, error } = queryResult;
  const approveOrg = useApproveOrganization();
  const suspendOrg = useSuspendOrganization();

  const handleReject = useCallback((reason: string) => {
    if (!rejectTarget) return;
    approveOrg.mutate(
      { id: rejectTarget.id, action: "reject", reason },
      { onSuccess: () => setRejectTarget(null) }
    );
  }, [rejectTarget, approveOrg]);

  const handleSuspend = useCallback(() => {
    if (!suspendTarget) return;
    suspendOrg.mutate(suspendTarget.id, { onSuccess: () => setSuspendTarget(null) });
  }, [suspendTarget, suspendOrg]);

  // Reset to page 1 when filters change
  const handleStatusChange = (v: string) => { setStatusFilter(v as any); setPage(1); };
  const handleTypeChange = (v: string) => { setTypeFilter(v as any); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleLimitChange = (v: number) => { setLimit(v); setPage(1); };

  const selectClass = "appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors cursor-pointer";

  return (
    <div className="px-4 py-6 min-h-screen">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl dark:text-white">Organizations</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {total > 0 ? `${total} organization${total !== 1 ? "s" : ""}` : "Manage organizations on the platform."}
          </p>
        </div>
        <Can I="create" a="Organization">
          <button
            onClick={() => navigate("/organizations/create")}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Organization
          </button>
        </Can>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} className={selectClass}>
            <option value="all">All Status</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Type filter */}
        <div className="relative">
          <select value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)} className={selectClass}>
            <option value="all">All Types</option>
            <option value="company">Company</option>
            <option value="cooperative">Cooperative</option>
            <option value="coop_member">Coop Member</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 py-16 text-neutral-400">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent" />
          Loading organizations...
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="py-12 text-center text-red-500 text-sm">Failed to load organizations.</div>
      )}

      {/* Empty state */}
      {!isLoading && !error && organizations.length === 0 && (
        <div className="flex flex-col items-center py-20 text-neutral-400">
          <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-medium text-lg">No organizations found</p>
          <p className="text-sm mt-1">
            {search || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "No organizations have been added yet."}
          </p>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && !error && organizations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {organizations.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              isPlatformAdmin={isPlatformAdmin}
              onView={() => navigate(`/organizations/${org.id}`)}
              onSuspend={() => setSuspendTarget(org)}
              onReject={() => setRejectTarget(org)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>Rows per page:</span>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="appearance-none pl-2 pr-6 py-1 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span>
              {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Suspend dialog */}
      {suspendTarget && (
        <SuspendDialog
          org={suspendTarget}
          onConfirm={handleSuspend}
          onCancel={() => setSuspendTarget(null)}
          isPending={suspendOrg.isPending}
        />
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <RejectDialog
          org={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          isPending={approveOrg.isPending}
        />
      )}
    </div>
  );
};

export default Organizations;

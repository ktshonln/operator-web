import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, buildCdnUrl } from "../services/apiClient";
import { useAbility } from "../contexts/AbilityContext";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffDriver {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  avatar_path: string | null;
  status: "active" | "pending_verification" | "suspended";
  roles: string[];
  org_id: string | null;
  last_login_at: string | null;
  created_at: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useDriversList(params: { q?: string; page: number; limit: number }) {
  return useQuery({
    queryKey: ["drivers-list", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users", {
        params: {
          role: "driver",
          q: params.q || undefined,
          page: params.page,
          limit: params.limit,
        },
      });
      // Normalise: { data: [], total, page, limit } or raw array
      if (Array.isArray(data)) {
        return { data: data as StaffDriver[], total: data.length, page: 1, limit: data.length };
      }
      return data as { data: StaffDriver[]; total: number; page: number; limit: number };
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";

function StatusBadge({ status }: { status: StaffDriver["status"] }) {
  const map: Record<StaffDriver["status"], string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending_verification: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const label: Record<StaffDriver["status"], string> = {
    active: "Active",
    pending_verification: "Pending",
    suspended: "Suspended",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// ─── Page ─────────────────────────────────────────────────────────────────────

function Drivers() {
  const navigate = useNavigate();
  const ability = useAbility();
  const canInvite = ability.can("invite", "User");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const params = useMemo(() => ({ q: search, page, limit }), [search, page, limit]);
  const { data, isLoading } = useDriversList(params);

  const drivers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="px-4 py-6 min-h-screen dark:text-white">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl">Drivers</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Staff members with the driver role.
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => navigate("/team/invitations")}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Driver
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email or phone..."
          className={inputClass + " max-w-sm"}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-950/90 rounded-2xl border border-gray-200 dark:border-neutral-800">
          <svg className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-300 mb-1">No drivers found</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search ? "Try a different search term" : "No drivers have been added yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => navigate(`/fleets/drivers/${driver.id}`)}
                className="bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {driver.avatar_path ? (
                    <img
                      src={buildCdnUrl(driver.avatar_path)}
                      alt={driver.first_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold text-sm">
                      {driver.first_name[0]}{driver.last_name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {driver.phone_number ?? driver.email ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={driver.status} />
                  {driver.last_login_at && (
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Last seen {format(new Date(driver.last_login_at), "MMM d")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <span>
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="appearance-none pl-2 pr-6 py-1 text-xs rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s} / page</option>
                  ))}
                </select>
                <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">First</button>
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">Previous</button>
              <span className="px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">Next</button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">Last</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Drivers;

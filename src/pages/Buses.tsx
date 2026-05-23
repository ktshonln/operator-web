import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAbility } from "../contexts/AbilityContext";
import {
  useFleetBusesPaginated,
  useCreateFleetBus,
  FleetBus,
} from "../hooks/useFleetBus";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosInstance, buildCdnUrl } from "../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useOrganizations } from "../hooks/useOrganizations";

// ─── Driver search hook (GET /users?role=driver&q=) ───────────────────────────
// Spec: param is "role" not "role_slug" (user-specs.json line 5736)

function useDriverSearch(q: string) {
  return useQuery({
    queryKey: ["driver-search", q],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users", {
        params: { role: "driver", q: q || undefined, limit: 20 },
      });
      return (data as any).data ?? [];
    },
    enabled: true,
  });
}

// ─── Create Bus form schema ───────────────────────────────────────────────────

const createSchema = z.object({
  plate: z.string().min(1, "Plate number is required").max(20),
  type: z.string().min(1, "Bus type is required").max(100),
  capacity: z.coerce.number().int().min(1, "Must have at least 1 seat"),
});
type CreateForm = z.infer<typeof createSchema>;

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";
const labelClass =
  "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// ─── Main page ────────────────────────────────────────────────────────────────

function Buses() {
  const navigate = useNavigate();
  const ability = useAbility();
  const isPlatformAdmin = ability.can("manage", "all");

  // ─── Filter state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<{ id: string; first_name: string; last_name: string } | null>(null);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // ─── Create panel state ──────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [inlineError, setInlineError] = useState("");

  // ─── Data ────────────────────────────────────────────────────────────────────
  const busParams = useMemo(() => ({
    q: search || undefined,
    status: statusFilter || undefined,
    driver_id: selectedDriver?.id || undefined,
    org_id: selectedOrgId || undefined,
    page,
    limit,
  }), [search, statusFilter, selectedDriver, selectedOrgId, page, limit]);

  const { data: busesData, isLoading } = useFleetBusesPaginated(busParams);
  const buses: FleetBus[] = busesData?.data ?? [];
  const total = busesData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const { data: driverResults = [] } = useDriverSearch(driverSearch);

  const orgQueryResult = useOrganizations({});
  const allOrgs = useMemo(() => {
    const result = orgQueryResult.data as { data: any[] } | any[] | undefined;
    if (Array.isArray(result)) return result;
    return result?.data ?? [];
  }, [orgQueryResult.data]);

  const createBus = useCreateFleetBus();

  const canCreate = ability.can("create", "Bus");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const handleClearDriver = useCallback(() => {
    setSelectedDriver(null);
    setDriverSearch("");
    setPage(1);
  }, []);

  const onSubmit = (data: CreateForm) => {
    setInlineError("");
    createBus.mutate(data, {
      onSuccess: () => {
        reset();
        setShowCreate(false);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        if (code === "PLATE_ALREADY_EXISTS") {
          setInlineError("A bus with this plate already exists.");
        } else {
          setInlineError(err?.response?.data?.error?.message || "Failed to register bus.");
        }
      },
    });
  };

  return (
    <div className="px-4 py-6 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl">Buses</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your fleet of buses.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Bus
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by plate or type..."
          className={inputClass + " max-w-xs"}
        />

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Driver filter */}
        <div className="relative">
          <div
            className="flex items-center gap-2 pl-3 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 cursor-pointer hover:border-brand transition-colors min-w-[180px]"
            onClick={() => setShowDriverDropdown(true)}
          >
            {selectedDriver ? (
              <>
                <span className="text-neutral-900 dark:text-white flex-1 truncate">
                  {selectedDriver.first_name} {selectedDriver.last_name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleClearDriver(); }}
                  className="text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <span className="text-neutral-500 dark:text-neutral-400">Filter by driver...</span>
            )}
          </div>

          {showDriverDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDriverDropdown(false)} />
              <div className="absolute top-full mt-1 left-0 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-20 overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-neutral-800">
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    placeholder="Search drivers..."
                    autoFocus
                    className={inputClass}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {driverResults.length === 0 ? (
                    <p className="text-sm text-neutral-500 p-3">No drivers found</p>
                  ) : (
                    driverResults.map((d: any) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDriver(d);
                          setShowDriverDropdown(false);
                          setDriverSearch("");
                          setPage(1);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
                      >
                        {d.avatar_path ? (
                          <img src={buildCdnUrl(d.avatar_path)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
                            {d.first_name?.[0]}{d.last_name?.[0]}
                          </div>
                        )}
                        <span className="text-sm text-neutral-900 dark:text-white">
                          {d.first_name} {d.last_name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Org filter — platform-admin only */}
        {isPlatformAdmin && (
          <div className="relative">
            <select
              value={selectedOrgId}
              onChange={(e) => { setSelectedOrgId(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors cursor-pointer"
            >
              <option value="">All Organizations</option>
              {allOrgs.map((org: any) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Bus cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
        </div>
      ) : buses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-950/90 rounded-2xl border border-gray-200 dark:border-neutral-800">
          <svg className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-300 mb-1">No buses found</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search || statusFilter || selectedDriver || selectedOrgId
              ? "Try adjusting your filters"
              : "Add your first bus to get started"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map((bus) => (
              <div
                key={bus.id}
                onClick={() => navigate(`/fleets/buses/${bus.id}`)}
                className={`bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 cursor-pointer hover:shadow-md transition-all ${
                  bus.status === "inactive" ? "opacity-60" : ""
                }`}
              >
                {/* Plate + status */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">{bus.plate}</h3>
                  {bus.status === "active" ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Type + capacity */}
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  <span>{bus.type}</span>
                  <span className="text-neutral-300 dark:text-neutral-600">·</span>
                  <span>{bus.capacity} seats</span>
                </div>

                {/* Driver */}
                {bus.driver ? (
                  <div className="flex items-center gap-2">
                    {bus.driver.avatar_path ? (
                      <img
                        src={buildCdnUrl(bus.driver.avatar_path)}
                        alt={bus.driver.first_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px] font-semibold">
                        {bus.driver.first_name[0]}{bus.driver.last_name[0]}
                      </div>
                    )}
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {bus.driver.first_name} {bus.driver.last_name}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">No driver assigned</p>
                )}

                {/* Org name — platform-admin only */}
                {isPlatformAdmin && bus.org && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 truncate">
                    {bus.org.name}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <span>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
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
              <span className="px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">Next</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">Last</button>
            </div>
          </div>
        </>
      )}

      {/* Create Bus slide-over */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCreate(false)} />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-neutral-950 shadow-2xl z-[60] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800 shrink-0">
              <div>
                <h2 className="font-bold text-lg dark:text-white">Register Bus</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Add a new bus to your fleet.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className={labelClass}>Plate Number *</label>
                  <input {...register("plate")} type="text" placeholder="e.g. RAB 123 A" className={inputClass} />
                  {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Bus Type *</label>
                  <input {...register("type")} type="text" placeholder="e.g. Coaster, Coach, Minibus" className={inputClass} />
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Capacity (seats) *</label>
                  <input {...register("capacity")} type="number" min={1} placeholder="30" className={inputClass} />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
                </div>

                {inlineError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {inlineError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createBus.isPending}
                  className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-50 transition-colors"
                >
                  {createBus.isPending ? "Registering..." : "Register Bus"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Buses;

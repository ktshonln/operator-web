import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInvitations } from "../hooks/useInvitations";
import { useResendInvitation } from "../hooks/useResendInvitation";
import { useRevokeInvitation } from "../hooks/useRevokeInvitation";
import { useToastStore } from "../stores/toastStore";
import { useOrganizations } from "../hooks/useOrganizations";
import useUser from "../hooks/useUser";
import { Can } from "../contexts/AbilityContext";
import Search from "../components/Search";
import AddAgent from "../components/AddAgent";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";

function Invitations() {
  const navigate = useNavigate();
  const { user } = useUser();
  const showToast = useToastStore((state) => state.showToast);
  const companyId = (user as any)?.org_id ?? "";
  const userId = user?.id ?? "";

  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const isSuperAdmin = user && "roles" in user && user.roles?.includes("platform-admin");

  const orgQueryResult = useOrganizations({});
  const allOrgs = useMemo(() => {
    const result = orgQueryResult.data as { data: any[] } | any[] | undefined;
    if (Array.isArray(result)) return result;
    return result?.data ?? [];
  }, [orgQueryResult.data]);

  const { data: rolesData } = useRoles();
  const { data: permissionsData } = usePermissions();
  const availableRoles = useMemo(() => rolesData?.data || [], [rolesData]);
  const permissionOptions = useMemo(() => permissionsData?.data || [], [permissionsData]);

  const { data: invitationsData, isLoading } = useInvitations({
    page,
    limit: 20,
    org_id: selectedOrgId || undefined,
    search: searchText || undefined,
  });

  const resendMutation = useResendInvitation();
  const revokeMutation = useRevokeInvitation();

  const handleResend = async (id: string) => {
    setResendingId(id);
    setMenuOpenId(null);
    try {
      await resendMutation.mutateAsync(id);
      showToast("Invitation resent successfully", "success");
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVITE_ALREADY_ACCEPTED") {
        showToast("This invitation has already been accepted", "error");
      } else {
        showToast("Failed to resend invitation", "error");
      }
    } finally {
      setResendingId(null);
    }
  };

  const handleRevoke = async (id: string) => {
    setMenuOpenId(null);
    try {
      await revokeMutation.mutateAsync(id);
      showToast("Invitation revoked successfully", "success");
      setRevokeConfirmId(null);
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "INVITE_ALREADY_ACCEPTED") {
        showToast("This invitation has already been accepted", "error");
      } else {
        showToast("Failed to revoke invitation", "error");
      }
      setRevokeConfirmId(null);
    }
  };

  const invitations = invitationsData?.data || [];
  const total = invitationsData?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="px-4 py-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl">Invitations</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage pending staff invitations.
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

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {isSuperAdmin && (
          <div className="relative">
            <select
              value={selectedOrgId || "all"}
              onChange={(e) => {
                setSelectedOrgId(e.target.value === "all" ? "" : e.target.value);
                setPage(1);
              }}
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

        <div className="w-full sm:w-64">
          <Search
            label="Search invitations..."
            onSearch={(text) => {
              setSearchText(text);
              setPage(1);
            }}
            alt
          />
        </div>
      </div>

      {/* Invitations grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-950/90 rounded-2xl border border-gray-200 dark:border-neutral-800">
          <svg className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-300 mb-1">No pending invitations</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {searchText || selectedOrgId ? "Try adjusting your filters" : "Invite users to get started"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => navigate(`/team/invitations/${invitation.id}`)}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  {invitation.expired ? (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                      Expired
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Valid
                    </span>
                  )}
                </div>

                {/* Resent badge */}
                {resendingId === invitation.id && (
                  <div className="absolute top-4 right-20">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      Invite resent
                    </span>
                  </div>
                )}

                {/* Name */}
                <h3 className="font-semibold text-base text-neutral-900 dark:text-white mb-1 pr-20">
                  {invitation.first_name} {invitation.last_name}
                </h3>

                {/* Contact info */}
                <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {invitation.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{invitation.email}</span>
                    </div>
                  )}
                  {invitation.phone_number && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{invitation.phone_number}</span>
                    </div>
                  )}
                </div>

                {/* Role */}
                {invitation.role_slugs?.[0] && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700">
                      {invitation.role_slugs[0]}
                    </span>
                  </div>
                )}

                {/* Expiry date */}
                <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-3 mt-3">
                  {invitation.expired ? "Expired" : "Expires"} {new Date(invitation.expires_at).toLocaleDateString()}
                </div>

                {/* Menu */}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === invitation.id ? null : invitation.id);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  {menuOpenId === invitation.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                        }}
                      />
                      <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResend(invitation.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          Resend
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevokeConfirmId(invitation.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Revoke
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} invitations
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Revoke confirmation dialog */}
      {revokeConfirmId && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setRevokeConfirmId(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md z-[60]">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">Revoke Invitation?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              This will permanently delete the invitation and prevent the invitee from using the link. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRevokeConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(revokeConfirmId)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </>
      )}

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

export default Invitations;

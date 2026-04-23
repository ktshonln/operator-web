import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useUsers from '../hooks/useUsers';
import { UserQuery } from '../hooks/useUsers';
import { useDeleteUser } from '../hooks/useDeleteUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useToastStore } from '../stores/toastStore';
import { camelCaseToTitle } from '../utils/helpers';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEY_USERS } from '../utils/constants';

const CDN_BASE_URL = import.meta.env.VITE_CDN_URL ?? '';

// ─── Avatar sub-component ────────────────────────────────────────────────────

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  avatarPath?: string | null;
  size: 'sm' | 'md';
}

function UserAvatar({ firstName, lastName, avatarPath, size }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';
  const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();

  if (avatarPath && !imgError) {
    return (
      <img
        src={`${CDN_BASE_URL}/${avatarPath}`}
        alt={`${firstName} ${lastName}`}
        onError={() => setImgError(true)}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dim} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white ${textSize} font-medium flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function roleBadgeClass(role: string): string {
  if (role === 'org-admin' || role === 'admin') {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700';
  }
  if (role === 'dispatcher') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
  }
  if (role === 'driver') {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700';
}

function statusBadgeClass(status: string): string {
  if (status === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (status === 'suspended') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
}

function userTypeBadgeClass(userType?: string): string {
  if (userType === 'staff') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  return 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300';
}

function formatLastLogin(lastLoginAt?: string | null): string {
  if (!lastLoginAt) return 'Never';
  return new Date(lastLoginAt).toLocaleString();
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface UsersTableProps {
  usersQuery: ReturnType<typeof useUsers>;
  rolesLoading: boolean;
  userQuery: UserQuery;
}

// ─── Row-level action menu ────────────────────────────────────────────────────

interface ActionMenuProps {
  userId: string;
  status: string;
  isPendingDelete: boolean;
  onEdit: () => void;
  onSuspendActivate: () => void;
  onDelete: () => void;
  rounded?: string;
}

function ActionMenuContent({
  userId: _userId,
  status,
  isPendingDelete,
  onEdit,
  onSuspendActivate,
  onDelete,
  rounded = 'rounded-lg',
}: ActionMenuProps) {
  return (
    <div className={`w-48 bg-white dark:bg-neutral-900 shadow-lg border border-gray-200 dark:border-neutral-800 ${rounded} overflow-hidden`}>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Edit User</span>
      </button>

      {status !== 'pending_verification' && (
        <button
          onClick={(e) => { e.stopPropagation(); onSuspendActivate(); }}
          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2"
        >
          {status === 'active' ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-yellow-700 dark:text-yellow-400">Suspend User</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 dark:text-green-400">Activate User</span>
            </>
          )}
        </button>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2 ${
          isPendingDelete ? 'bg-red-50 dark:bg-red-900/20' : ''
        } text-red-600 dark:text-red-400`}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>{isPendingDelete ? 'Confirm Delete?' : 'Delete User'}</span>
      </button>
    </div>
  );
}

// ─── Expanded row details ─────────────────────────────────────────────────────

interface ExpandedDetailsProps {
  email?: string;
  phoneNumber?: string | null;
  lastLoginAt?: string | null;
  userType?: 'passenger' | 'staff';
  userId: string;
  showEmail?: boolean;
}

function ExpandedDetails({ email, phoneNumber, lastLoginAt, userType, userId, showEmail }: ExpandedDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      {showEmail && email && (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-neutral-600 dark:text-neutral-400 w-24 shrink-0">Email:</span>
          <span className="text-neutral-900 dark:text-white break-all">{email}</span>
        </div>
      )}
      {phoneNumber && (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-neutral-600 dark:text-neutral-400 w-24 shrink-0">Phone:</span>
          <span className="text-neutral-900 dark:text-white">{phoneNumber}</span>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <span className="font-medium text-neutral-600 dark:text-neutral-400 w-24 shrink-0">Last Login:</span>
        <span className="text-neutral-900 dark:text-white">{formatLastLogin(lastLoginAt)}</span>
      </div>
      {userType && (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-neutral-600 dark:text-neutral-400 w-24 shrink-0">User Type:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${userTypeBadgeClass(userType)}`}>
            {userType === 'staff' ? 'Staff' : 'Passenger'}
          </span>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <span className="font-medium text-neutral-600 dark:text-neutral-400 w-24 shrink-0">User ID:</span>
        <span className="text-neutral-900 dark:text-white font-mono text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded break-all">{userId}</span>
      </div>
    </div>
  );
}

// ─── Self-contained row — owns ALL its own state ─────────────────────────────

interface SelfContainedRowProps {
  agent: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    role: string;
    status: string;
    avatarPath?: string | null;
    lastLoginAt?: string | null;
    userType?: 'passenger' | 'staff';
  };
  rowIndex: number;
  mobile?: boolean;
}

function SelfContainedRow({ agent, rowIndex, mobile = false }: SelfContainedRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser(agent.userId);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsPendingDelete(false);
  }, []);

  // Outside-click detection scoped to this row's menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isMenuOpen, closeMenu]);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleToggleExpand = () => setIsExpanded((prev) => !prev);

  const handleEdit = () => {
    navigate(`/team/user/${agent.userId}`);
    closeMenu();
  };

  const handleSuspendActivate = () => {
    const newStatus = agent.status === 'active' ? 'suspended' : 'active';
    updateUser.mutate({ status: newStatus }, {
      onSuccess: () => {
        closeMenu();
        queryClient.invalidateQueries({ queryKey: CACHE_KEY_USERS });
      },
      onError: (err: Error) => showToast(err.message, 'error'),
    });
  };

  const handleDelete = () => {
    if (!isPendingDelete) { setIsPendingDelete(true); return; }
    deleteUser.mutate(agent.userId, {
      onSuccess: () => {
        closeMenu();
        queryClient.invalidateQueries({ queryKey: CACHE_KEY_USERS });
      },
      onError: (err: Error) => showToast(err.message, 'error'),
    });
  };

  const { userId, firstName, lastName, email, phoneNumber, role, status, avatarPath, lastLoginAt, userType } = agent;

  if (mobile) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-all">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <UserAvatar firstName={firstName} lastName={lastName} avatarPath={avatarPath} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-900 dark:text-white text-base truncate">{firstName} {lastName}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{email}</div>
              </div>
            </div>
            <span className={`ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(status)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
              {camelCaseToTitle(status)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${roleBadgeClass(role)}`}>
              {camelCaseToTitle(role)}
            </span>
            <div className="flex items-center space-x-1">
              <button onClick={handleToggleExpand} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="relative" ref={menuRef}>
                <button onClick={handleToggleMenu} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50">
                    <ActionMenuContent userId={userId} status={status} isPendingDelete={isPendingDelete}
                      onEdit={handleEdit} onSuspendActivate={handleSuspendActivate} onDelete={handleDelete} rounded="rounded-xl" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-neutral-800 pt-4">
            <ExpandedDetails phoneNumber={phoneNumber} lastLoginAt={lastLoginAt} userType={userType} userId={userId} email={email} showEmail={true} />
          </div>
        )}
      </div>
    );
  }

  // Desktop row
  return (
    <React.Fragment>
      <tr className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
        <td className="px-3 py-4 text-sm text-neutral-500 dark:text-neutral-400 font-medium w-10">
          <div className="flex items-center gap-1">
            <button onClick={handleToggleExpand}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-colors">
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span>{rowIndex + 1}</span>
          </div>
        </td>
        <td className="px-3 py-4">
          <div className="flex items-center space-x-2 min-w-0">
            <UserAvatar firstName={firstName} lastName={lastName} avatarPath={avatarPath} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-neutral-900 dark:text-white truncate text-sm">{firstName} {lastName}</div>
            </div>
          </div>
        </td>
        <td className="px-3 py-4 hidden xl:table-cell">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{email}</div>
        </td>
        <td className="px-3 py-4 hidden md:table-cell">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${roleBadgeClass(role)}`}>
            {camelCaseToTitle(role)}
          </span>
        </td>
        <td className="px-3 py-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(status)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
            {camelCaseToTitle(status)}
          </span>
        </td>
        <td className="px-3 py-4 w-10">
          <div className="relative" ref={menuRef}>
            <button onClick={handleToggleMenu}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50">
                <ActionMenuContent userId={userId} status={status} isPendingDelete={isPendingDelete}
                  onEdit={handleEdit} onSuspendActivate={handleSuspendActivate} onDelete={handleDelete} />
              </div>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50 dark:bg-neutral-900/30">
          <td colSpan={6} className="px-3 py-3">
            <ExpandedDetails email={email} phoneNumber={phoneNumber} lastLoginAt={lastLoginAt} userType={userType} userId={userId} showEmail={true} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

// ─── Main UsersTable component ────────────────────────────────────────────────

export function UsersTable({ usersQuery, rolesLoading, userQuery }: UsersTableProps) {
  const { data: users, isLoading } = usersQuery;

  // Client-side search filter (fallback when API search isn't available)
  const searchText = userQuery.searchText?.toLowerCase() ?? '';
  const allUsers = (users?.pages?.flatMap((page) => page ?? []) ?? []).filter((u) => {
    if (!searchText) return true;
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = (u.email ?? '').toLowerCase();
    return fullName.includes(searchText) || email.includes(searchText);
  });

  const isEmpty = !isLoading && allUsers.length === 0;

  const loadingRow = (
    <tr>
      <td colSpan={6} className="px-4 py-12 text-center">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent"></div>
          <span className="text-neutral-600 dark:text-neutral-400">Loading users...</span>
        </div>
      </td>
    </tr>
  );

  const emptyRow = (
    <tr>
      <td colSpan={6} className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="font-medium">No users found</span>
          <span className="text-sm">Try adjusting your filters or search terms</span>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden lg:block min-w-0">
        <table className="w-full text-sm">
          <thead className="bg-white dark:bg-neutral-950/95 border-b border-gray-200 dark:border-neutral-800">
            <tr className="text-left text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <th className="px-3 py-3 w-10">#</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3 hidden xl:table-cell">Email</th>
              <th className="px-3 py-3 hidden md:table-cell">Role</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/50">
            {(isLoading || rolesLoading) && loadingRow}
            {isEmpty && emptyRow}
            {users?.pages.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {page?.filter((u) => {
                  if (!searchText) return true;
                  const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
                  const email = (u.email ?? '').toLowerCase();
                  return fullName.includes(searchText) || email.includes(searchText);
                }).map((agent, rowIndex) => (
                  <SelfContainedRow key={agent.userId} agent={agent} rowIndex={rowIndex} mobile={false} />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="lg:hidden space-y-3">
        {(isLoading || rolesLoading) && (
          <div className="flex items-center justify-center py-12 space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand border-t-transparent"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Loading users...</span>
          </div>
        )}
        {isEmpty && (
          <div className="flex flex-col items-center py-12 text-neutral-500 dark:text-neutral-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="font-medium">No users found</span>
            <span className="text-sm">Try adjusting your filters or search terms</span>
          </div>
        )}
        {users?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page?.filter((u) => {
              if (!searchText) return true;
              const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
              const email = (u.email ?? '').toLowerCase();
              return fullName.includes(searchText) || email.includes(searchText);
            }).map((agent) => (
              <SelfContainedRow key={agent.userId} agent={agent} rowIndex={0} mobile={true} />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ── Load more ── */}
      {allUsers.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => usersQuery.fetchNextPage()}
            disabled={!usersQuery.hasNextPage || usersQuery.isFetchingNextPage}
            className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-md hover:bg-brand hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {usersQuery.isFetchingNextPage ? 'Loading...' : usersQuery.hasNextPage ? 'Load More' : 'All users loaded'}
          </button>
        </div>
      )}
    </>
  );
}

export default UsersTable;

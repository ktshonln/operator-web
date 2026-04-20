import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Agent } from "./useAgent";
import APIClient from "../services/apiClient";
import { CACHE_KEY_USERS } from "../utils/constants";

const apiClient = new APIClient<any>("/users");

export interface UserQuery {
  branch: null;
  sortOrder: string;
  searchText: string;
  status?: 'active' | 'pending_verification' | 'suspended';
  userType?: 'passenger' | 'staff';
}

const useUsers = (orgId: string, userQuery: UserQuery) =>
  useInfiniteQuery<Agent[], Error, InfiniteData<Agent[], number>>({
    queryKey: [CACHE_KEY_USERS, userQuery, orgId],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = { page: pageParam, limit: 20 };
      if (orgId) params.org_id = orgId;
      if (userQuery.searchText) params.search = userQuery.searchText;
      if (userQuery.status) params.status = userQuery.status;
      if (userQuery.userType) params.user_type = userQuery.userType;
      const res = await apiClient.getAll({ params });
      const items = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return items.map((user: any) => ({
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: (user.roles && user.roles.length > 0) ? user.roles[0] : 'user',
        status: user.status || 'pending_verification',
        joinedDate: user.created_at,
        orgId: user.org_id,
        avatarPath: user.avatar_path,
        lastLoginAt: user.last_login_at,
        userType: user.user_type as 'passenger' | 'staff' | undefined,
      }));
    },
    initialPageParam: 1,
    staleTime: 10 * 1000,
    placeholderData: (previousData) => previousData || { pages: [], pageParams: [] },
    getNextPageParam: (_lastPage, allPages) => allPages.length + 1,
    enabled: true,
  });

export default useUsers;

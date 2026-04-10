import { useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { CACHE_KEY_DRIVERS } from "../utils/constants";
import { Branch } from "../components/Filter";

export interface DriverQuery {
  branch: Branch | null;
  sortOrder: string;
  searchText: string;
}

export interface Driver {
  driverId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  assignedBusId: string;
  status: string;
}

const apiClient = new APIClient<Driver[]>("/organizations");

const useDrivers = (orgId: string, busQuery: DriverQuery) =>
  useInfiniteQuery<Driver[], Error>({
    queryKey: [CACHE_KEY_DRIVERS, busQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllDrivers(orgId, {
        params: {
          branch: busQuery.branch?.name,
          ordering: busQuery.sortOrder,
          search: busQuery.searchText,
          page: pageParam,
        },
      }),
    initialPageParam: 1,
    staleTime: 10 * 1000,
    placeholderData: (previousData, _previousQuery) =>
      previousData || { pages: [], pageParams: [] },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has data, increment the page number
      // Adjust this logic based on how your API signals the "end" (e.g., lastPage.next)
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    enabled: !!orgId,
  });

export default useDrivers;

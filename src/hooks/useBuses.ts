import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Bus } from "./useBus";
import { CACHE_KEY_BUSES } from "../utils/constants";
import { Branch } from "../components/Filter";

export interface BusQuery {
  branch: Branch | null;
  sortOrder: string;
  searchText: string;
}

const apiClient = new APIClient<Bus[]>("/companies");

const useBuses = (companyId: string, busQuery: BusQuery) =>
  useInfiniteQuery<Bus[], Error, InfiniteData<Bus[], number>>({
    queryKey: [CACHE_KEY_BUSES, companyId, busQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllBuses(companyId, {
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
    enabled: !!companyId
  });

export default useBuses;

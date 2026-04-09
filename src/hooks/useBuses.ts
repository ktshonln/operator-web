import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
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

const useBuses = (companyId: string,busQuery: BusQuery) =>
  useInfiniteQuery<Bus[], Error>({
    queryKey: [CACHE_KEY_BUSES, busQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllBuses(companyId,{
        params: {
          branch: busQuery.branch?.name,
          ordering: busQuery.sortOrder,
          search: busQuery.searchText,
          page: pageParam,
        },
      }),
  });

export default useBuses;

import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
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

const apiClient = new APIClient<Driver[]>("/companies");

const useDrivers = (companyId: string, busQuery: DriverQuery) =>
  useInfiniteQuery<Driver[], Error>({
    queryKey: [CACHE_KEY_DRIVERS, busQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAllDrivers(companyId, {
        params: {
          branch: busQuery.branch?.name,
          ordering: busQuery.sortOrder,
          search: busQuery.searchText,
          page: pageParam,
        },
      }),
  });

export default useDrivers;

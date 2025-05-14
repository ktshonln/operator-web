import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
import { Branch } from "../pages/ProfileSettings";
import APIClient from "../services/apiClient";

export interface DriverQuery {
  branch: Branch | null;
  sortOrder: string;
  searchText: string;
}

export interface Driver {
  userId: string; // Seriously? for what?
  driverId: string; 
  firstName: string;
  lastName: string;
  licenseNumber: string;
  contactPhone: string;
  status: string;
}

const apiClient = new APIClient<Driver[]>("/companies");

const useDrivers = (companyId: string, busQuery: DriverQuery) =>
  useInfiniteQuery<Driver[], Error>({
    queryKey: ["drivers", busQuery],
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

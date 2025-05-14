import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface TripQuery {
  departureTime: string;
  searchText: string;
  branch?: string;
  status: string;
  busId?: string;
  driverId?: string;
}

export interface Trip {
  tripId: string;
  scheduleId: string;
  route: { startId: string, start: string, endId: string, end:string}; // origin stop id and destination id included
  departureTime: string;
  arrivalTime: string;
  price: string;
  busId: string;
  seats: string[];
  status: string;
  express: boolean;
  intermediateStops: string[];
}



const apiClient = new APIClient<Trip[]>("/search/trips");

const useTrips = (tripQuery: TripQuery) =>
  useInfiniteQuery<Trip[], Error>({
    queryKey: ["trips", tripQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAll({
        params: {
          departureTime: tripQuery.departureTime,
          branch: tripQuery.branch,
          search: tripQuery.searchText,
          busId: tripQuery.busId,
          driverId: tripQuery.driverId,
          page: pageParam,
        },
      }),
  });

export default useTrips;

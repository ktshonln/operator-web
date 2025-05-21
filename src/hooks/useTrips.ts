import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface TripQuery {
  departureTime: string;
  // The start time and the end time will be sent, if the departure time is within the range or equal in case they are both the same, it will be returned.
  startTime: string;
  endTime: string;
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
  departureDateAndTime: string;
  arrivalTime: string;
  price: number;
  busId: string;
  seats: string[];
  status: string;
  express: boolean;
  intermediateStops: string[]; // Fed in the backend after route determination
  plateNumber: string;
  departureTime?: string;
  autoScheduling?: boolean
  scheduleBlock?: string;
  dayRange?:{from:string, to:string}
  minuteInterval?:number; 
  timeRange?:{from:string, to:string}
}

const apiClient = new APIClient<Trip[]>("/search/trips");

const useTrips = (tripQuery: TripQuery) =>
  useInfiniteQuery<Trip[], Error>({
    queryKey: ["trips", tripQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAll({
        params: {
          departureTime: tripQuery.departureTime,
          startTime: tripQuery.startTime,
          endTime: tripQuery.endTime,
          branch: tripQuery.branch,
          search: tripQuery.searchText,
          busId: tripQuery.busId,
          driverId: tripQuery.driverId,
          page: pageParam,
        },
      }),
  });

export default useTrips;

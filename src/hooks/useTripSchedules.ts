import { useQuery as useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Trip, TripQuery } from "./useTrips";

const apiClient = new APIClient<Trip[]>("/search/trips");

const useTripSchedules = (tripQuery: TripQuery) =>
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
          scheduleId: tripQuery.scheduleId,
          driverId: tripQuery.driverId,
          page: pageParam,
        },
      }),
  });

export default useTripSchedules;

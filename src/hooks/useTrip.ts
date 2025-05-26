import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Trip } from "./useTrips";

const apiClient = new APIClient<Trip>("/trips");

const useTrip = (tripId:string) =>
  useQuery<Trip, Error>({
    queryKey: ["trip", tripId],
    queryFn: () =>
      apiClient.get(tripId),
    enabled: !!tripId, // This avoids running if tripId is undefined
  });

export default useTrip;

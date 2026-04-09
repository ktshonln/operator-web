import { useMutation, useQueryClient } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Trip } from "./useTrips";
import { CACHE_KEY_TRIPS } from "../utils/constants";
import { TripDetails } from "./useAddTrip";

interface EditTripContext {
  previousTrips: Trip[];
}

const apiClient = new APIClient<Trip>("/companies");
const useEditTrip = (companyId: string, tripId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Trip, Error, TripDetails, EditTripContext>({
    mutationFn: (tripDetails: TripDetails) =>
      apiClient.editTrip<TripDetails>(tripDetails,companyId, tripId),
    onMutate: (newData) => {
      // Optimistic updates
      const previousTrips =
        queryClient.getQueryData<Trip[]>(CACHE_KEY_TRIPS) || [];
      queryClient.setQueryData<Trip[]>(CACHE_KEY_TRIPS, (trips) =>
        trips?.map((trip) =>
          trip.tripId === tripId ? { ...trip,
          route: {
            ...trip.route, // preserve startId and endId
            start: newData.route.start,
            end: newData.route.end,
          }, } : trip
        )
      );
      return { previousTrips };
    },
    onSuccess: (savedData, _newData) => {
      // Invalidating cache for freshness
      queryClient.setQueryData<Trip[]>(CACHE_KEY_TRIPS, (trips) =>
        trips?.map((trip) => (trip.tripId === tripId ? savedData : trip))
      );
      queryClient.invalidateQueries({
        queryKey: ["trip", tripId],
      }); 
      showToast("Trip successfully updated!", "success");
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<TripDetails[]>(
        CACHE_KEY_TRIPS,
        context.previousTrips
      );
      showToast(error.message, "error");
    },
  });
};

export default useEditTrip;

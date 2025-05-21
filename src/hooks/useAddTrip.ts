import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Trip } from "./useTrips";

export interface TripDetails {
    route: { start: string, end: string};
    plateNumber: string;
    express?: boolean;
    departureDateAndTime: string;
    autoScheduling?: boolean
    departureTime?: string;
    scheduleBlock?: string;
    dayRange?:{from:string, to:string}
    minuteInterval?:number; 
    timeRange?:{from:string, to:string}
}

const apiClient = new APIClient<Trip>("/companies");
const useAddTrip = (companyId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<Trip, Error ,TripDetails>({
    mutationFn: (tripDetails: TripDetails)=> apiClient.addBus<TripDetails>(tripDetails,companyId),
    onSuccess: (savedData) => {
      showToast("Successfully created a new trip!", "success");
      navigate(`/trips/${savedData.tripId}`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useAddTrip;

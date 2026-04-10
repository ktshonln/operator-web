import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Trip } from "./useTrips";

export const scheduleBlocks = ["day", "week", "month"] as const;
export type ScheduleBlock = (typeof scheduleBlocks)[number];
export interface TripDetails {
  route: { start: string; end: string };
  busId: string;
  express?: boolean;
  departureDateAndTime: string;
  autoScheduling?: boolean;
  departureTime?: string;
  scheduleBlock?: ScheduleBlock;
  dayRange?: { from: string; to: string };
  minuteInterval?: number;
  timeRange?: { from: string; to: string };
}

const apiClient = new APIClient<Trip>("/organizations");
const useAddTrip = (orgId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<Trip, Error, TripDetails>({
    mutationFn: (tripDetails: TripDetails) =>
      apiClient.addTrip<TripDetails>(tripDetails, orgId),
    onSuccess: (savedData) => {
      showToast("Successfully created a new trip!", "success");
      navigate(`/trips/${savedData.tripId}`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useAddTrip;

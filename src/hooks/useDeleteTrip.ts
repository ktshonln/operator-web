import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

interface DeleteTripResponse {
  tripId: string;
}

const apiClient = new APIClient<DeleteTripResponse>("/organizations");
const useDeleteTrip = (orgId: string, tripId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<DeleteTripResponse, Error>({
    mutationFn: () => apiClient.deleteTrip(orgId, tripId),
    onSuccess: () => {
      showToast("Trip deleted successfully!", "success");
      navigate(`/trips`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useDeleteTrip;

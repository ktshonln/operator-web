import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

interface DeleteBusResponse {
  busId: string;
}

const apiClient = new APIClient<DeleteBusResponse>("/organizations");
const useDeleteBus = (orgId: string, busId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<DeleteBusResponse, Error>({
    mutationFn: () => apiClient.deleteBus(orgId, busId),
    onSuccess: () => {
      showToast("Bus deleted successfully!", "success");
      navigate(`/fleets/buses`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useDeleteBus;

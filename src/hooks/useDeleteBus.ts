import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface AddBusResponse {
  busId: string;
}

const apiClient = new APIClient<AddBusResponse>("/companies");
const useDeleteBus = (companyId: string, busId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<AddBusResponse, Error>({
    mutationFn: () => apiClient.deleteBus(companyId, busId),
    onSuccess: () => {
      showToast("Bus deleted successfully!", "success");
      navigate(`/fleets/buses`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useDeleteBus;

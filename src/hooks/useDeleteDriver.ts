import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

interface DeleteDriverResponse {
  busId: string;
}

const apiClient = new APIClient<DeleteDriverResponse>("/organizations");
const useDeleteDriver = (orgId: string, driverId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<DeleteDriverResponse, Error>({
    mutationFn: () => apiClient.deleteBus(orgId, driverId),
    onSuccess: () => {
      showToast("Driver deleted successfully!", "success");
      navigate(`/fleets/drivers`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useDeleteDriver;

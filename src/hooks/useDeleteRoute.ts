import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

interface DeleteRouteResponse {
  routeId: string;
}

const apiClient = new APIClient<DeleteRouteResponse>("/companies");
const useDeleteRoute = (companyId: string, routeId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<DeleteRouteResponse, Error>({
    mutationFn: () => apiClient.deleteRoute(companyId, routeId),
    onSuccess: () => {
      showToast("Route deleted successfully!", "success");
      navigate(`/trips`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useDeleteRoute;

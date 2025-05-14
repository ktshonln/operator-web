import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { BusDetails } from "./useAddBus";

interface EditBusResponse {
  busId: string;
}

const apiClient = new APIClient<EditBusResponse>("/companies");
const useEditBus = (companyId: string, busId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<EditBusResponse, Error, BusDetails>({
    mutationFn: (busDetails: BusDetails) =>
      apiClient.editBus<BusDetails>(busDetails, companyId, busId),
    onSuccess: () => {
      showToast("Bus successfully updated!", "success");
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useEditBus;

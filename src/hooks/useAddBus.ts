import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface BusDetails {
    plateNumber: string;
    brand: string;
    model: string;
    seatingCapacity: number;
    driver: string;
}

export interface AddBusResponse {
  busId: string;
}

const apiClient = new APIClient<AddBusResponse>("/companies");
const useAddBus = (companyId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<AddBusResponse, Error ,BusDetails>({
    mutationFn: (busDetails: BusDetails)=> apiClient.addBus<BusDetails>(busDetails,companyId),
    onSuccess: (savedData) => {
      showToast("Successfully added a new bus!", "success");
      navigate(`/fleets/buses/${savedData.busId}`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useAddBus;

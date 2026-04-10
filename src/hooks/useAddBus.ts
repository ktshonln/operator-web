import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Bus } from "./useBus";

export interface BusDetails {
  plateNumber: string;
  brand: string;
  model: string;
  seatingCapacity: number;
  assignedDriverId: string;
}

const apiClient = new APIClient<Bus>("/organizations");
const useAddBus = (orgId: string) => {
  // const queryClient = useQueryClient()
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<Bus, Error, BusDetails>({
    mutationFn: (busDetails: BusDetails) =>
      apiClient.addBus<BusDetails>(busDetails, orgId),
    onSuccess: (savedData) => {
      // queryClient.setQueriesData<Bus[]>({queryKey:['buses']},buses=>[savedData, ...(buses||[])])
      showToast("Successfully added a new bus!", "success");
      navigate(`/fleets/buses/${savedData.busId}`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useAddBus;

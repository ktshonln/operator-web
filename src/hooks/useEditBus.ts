import { useMutation, useQueryClient } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_BUSES } from "../utils/constants";
import { BusDetails } from "./useAddBus";
import { Bus } from "./useBus";

interface EditBusContext {
  previousBuses: Bus[];
}

const apiClient = new APIClient<Bus>("/companies");
const useEditBus = (companyId: string, busId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Bus, Error, BusDetails, EditBusContext>({
    mutationFn: (busDetails: BusDetails) =>
      apiClient.editBus<BusDetails>(busDetails, companyId, busId),
    onMutate: (newData) => {
      // Optimistic updates
      const previousBuses =
        queryClient.getQueryData<Bus[]>(CACHE_KEY_BUSES) || [];
      queryClient.setQueryData<Bus[]>(CACHE_KEY_BUSES, (buses) =>
        buses?.map((bus) =>
          bus.busId === busId ? { ...bus, ...newData } : bus
        )
      );
      return { previousBuses };
    },
    onSuccess: (savedData, _newData) => {
      // Invalidating cache for freshness
      queryClient.setQueryData<Bus[]>(CACHE_KEY_BUSES, (buses) =>
        buses?.map((bus) => (bus.busId === busId ? savedData : bus))
      );
      queryClient.invalidateQueries({
        queryKey: ["company", companyId, "bus", busId],
      }); // Invalidate single bus to get fresh data
      showToast("Bus successfully updated!", "success");
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<BusDetails[]>(
        CACHE_KEY_BUSES,
        context.previousBuses
      );
      showToast(error.message, "error");
    },
  });
};

export default useEditBus;

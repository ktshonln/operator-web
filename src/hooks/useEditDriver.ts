import { useMutation, useQueryClient } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_DRIVERS } from "../utils/constants";
import { Driver } from "./useDrivers";
import { DriverDetails } from "./useAddDriver";

interface EditDriverContext {
  previousDrivers: Driver[];
}

const apiClient = new APIClient<Driver>("/organizations");
const useEditDriver = (orgId: string, driverId: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  return useMutation<Driver, Error, DriverDetails, EditDriverContext>({
    mutationFn: (driverDetails: DriverDetails) =>
      apiClient.editBus<DriverDetails>(driverDetails, orgId, driverId),
    onMutate: (newData) => {
      // Optimistic updates
      const previousDrivers =
        queryClient.getQueryData<Driver[]>(CACHE_KEY_DRIVERS) || [];
      queryClient.setQueryData<Driver[]>(CACHE_KEY_DRIVERS, (drivers) =>
        drivers?.map((driver) =>
          driver.driverId === driverId ? { ...driver, ...newData } : driver,
        ),
      );
      return { previousDrivers };
    },
    onSuccess: (savedData, _newData) => {
      // Invalidating cache for freshness
      queryClient.setQueryData<Driver[]>(CACHE_KEY_DRIVERS, (drivers) =>
        drivers?.map((driver) =>
          driver.driverId === driverId ? savedData : driver,
        ),
      );
      queryClient.invalidateQueries({
        queryKey: ["organization", orgId, "driver", driverId],
      }); // Invalidate single driver to get fresh data
      showToast("Driver successfully updated!", "success");
    },
    onError: (error, _newData, context) => {
      if (!context) return;
      queryClient.setQueryData<DriverDetails[]>(
        CACHE_KEY_DRIVERS,
        context.previousDrivers,
      );
      showToast(error.message, "error");
    },
  });
};

export default useEditDriver;

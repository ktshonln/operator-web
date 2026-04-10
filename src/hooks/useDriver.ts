import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Driver } from "./useDrivers";

const apiClient = new APIClient<Driver>("/organizations");

const useDriver = (orgId: string, driverId: string) =>
  useQuery<Driver, Error>({
    queryKey: ["organization", orgId, "driver", driverId],
    queryFn: () => apiClient.getDriver(orgId, driverId),
  });

export default useDriver;

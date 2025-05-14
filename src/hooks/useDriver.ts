import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Driver } from "./useDrivers";


const apiClient = new APIClient<Driver>("/companies");

const useDriver = (companyId: string, driverId: string) =>
  useQuery<Driver, Error>({
    queryKey: ["company", companyId, "driver", driverId],
    queryFn: () => apiClient.getDriver(companyId, driverId),
  });

export default useDriver;

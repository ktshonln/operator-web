import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface Bus {
  plateNumber: string;
  brand: string;
  model: string;
  seatingCapacity: number;
  status: string;
}

const apiClient = new APIClient<Bus>("/companies");

const useBus = (companyId: string, busId: string) =>
  useQuery<Bus, Error>({
    queryKey: ["company", companyId, "bus", busId],
    queryFn: () => apiClient.getBus(companyId, busId),
  });

export default useBus;

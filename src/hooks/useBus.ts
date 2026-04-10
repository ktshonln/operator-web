import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface Bus {
  busId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  vin: string; // Vehicle id
  seatingCapacity: number;
  status: string;
  assignedDriverId: string;
  scheduleId: string; // schedules of the bus
}

const apiClient = new APIClient<Bus>("/organizations");

const useBus = (orgId: string, busId: string) =>
  useQuery<Bus, Error>({
    queryKey: ["organization", orgId, "bus", busId],
    queryFn: () => apiClient.getBus(orgId, busId),
  });

export default useBus;

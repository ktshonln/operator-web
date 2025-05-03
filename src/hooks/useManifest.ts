import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface Manifest {
  tripId: string;
  departureTime: string;
  route: string;
  busPlate: string;
  driverName: string;
  manifest: [
    {
      ticketId: string;
      passengerName: string;
      passengerPhone: string;
      seatNumber: string;
      origin: string;
      destination: string;
      timeTaken: string;
      status: string;
    }
  ];
}

const apiClient = new APIClient<Manifest>("/companies");

const useManifest = (companyId: string, tripId: string) =>
  useQuery<Manifest, Error>({
    queryKey: ["companies", companyId, "trip", tripId],
    queryFn: () => apiClient.getManifest(companyId, tripId),
  });

export default useManifest;

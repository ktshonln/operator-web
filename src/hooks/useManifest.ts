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
    },
  ];
}

const apiClient = new APIClient<Manifest>("/organizations");

const useManifest = (orgId: string, tripId: string) =>
  useQuery<Manifest, Error>({
    queryKey: ["organizations", orgId, "trip", tripId],
    queryFn: () => apiClient.getManifest(orgId, tripId),
  });

export default useManifest;

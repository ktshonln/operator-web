import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface Ticket {
  ticketId: string;
  tripId: string;
  passenger?: {
    passengerId?: string;
    firstName?: string;
    lastName?: string;
  };
  ticketQuantity: number;
  seatNumber: number | number[];
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busId: string;
  companyId: string;
  pricing: {
    basePrice: number;
    vatIncluded: number;
    serviceFee: number;
    totalCharged: number;
  };
  status: string;
  purchaseTime: string;
  invoice: {
    invoiceNumber: string;
    ebmStatus: string;
    timestamp: string;
  };
  printableTicketUrl: string;
  reminder: string;
  IssuedBy: string;
}

const apiClient = new APIClient<Ticket>("/tickets");

const useTicket = (ticketId: string) =>
  useQuery<Ticket, Error>({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiClient.get(ticketId),
    enabled: !!ticketId
  });

export default useTicket;

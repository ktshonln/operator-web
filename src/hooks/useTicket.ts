import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface Ticket {
  ticketId: string;
  tripId: string;
  passenger: {
    passengerId: string; // this is possible on the passenger client because they are logged in
    firstName: string;
    lastName: string;
  };
  ticketQuantity:number; // ticket quantity to be added
  seatNumber: number | number[];
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busId: string; // bus id not plate
  companyId:string; // company id is enough
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

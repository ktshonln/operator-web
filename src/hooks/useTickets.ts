import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Ticket } from "./useTicket";

export interface TicketQuery {
  startDate?: string;
  endDate?: string;
  tripId?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface TicketResponse {
  data?: Ticket[];
  tickets?: Ticket[];
  total?: number;
  page?: number;
  limit?: number;
}

const apiClient = new APIClient<TicketResponse>("/tickets");

const useTickets = (ticketQuery: TicketQuery, enabled: boolean = true) =>
  useQuery<TicketResponse, Error>({
    queryKey: ["tickets", ticketQuery],
    queryFn: () =>
      apiClient.getAll({
        params: {
          // Send just the date boundaries and let the API handle the TZ, or default to standard ISO representation
          // Appending Z caused it to be treated as UTC midnight rather than local midnight.
          from: ticketQuery.startDate ? `${ticketQuery.startDate}T00:00:00` : undefined,
          to: ticketQuery.endDate ? `${ticketQuery.endDate}T23:59:59` : undefined,
          status: ticketQuery.status,
          q: ticketQuery.q,
          page: ticketQuery.page,
          limit: ticketQuery.limit,
        },
      }),
    enabled,
  });

export default useTickets;

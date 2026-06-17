import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Ticket } from "./useTicket";

export interface TicketQuery {
  startDate?: string;
  endDate?: string;
  tripId?: string;
  status?: string;
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
          from: ticketQuery.startDate ? `${ticketQuery.startDate}T00:00:00Z` : undefined,
          to: ticketQuery.endDate ? `${ticketQuery.endDate}T23:59:59Z` : undefined,
          status: ticketQuery.status,
        },
      }),
    enabled,
  });

export default useTickets;

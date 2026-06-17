import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Ticket } from "./useTicket";
import { Branch } from "../components/Filter";

const apiClient = new APIClient<TicketResponse>("/tickets");

export interface TicketQuery {
  branch?: Branch;
  startDate?: string;
  endDate?: string;
  passengerId?: string;
  agentId?: string;
  tripId?: string;
  status?: string;
}


interface TicketResponse {
  query: { tripId: string };
  tickets: Ticket[];
}

const useTickets = (ticketQuery: TicketQuery) =>
  useQuery<TicketResponse, Error>({
    queryKey: ["tickets", ticketQuery],
    queryFn: () =>
      apiClient.getAll({
        params: {
          branchId: ticketQuery.branch,
          from: ticketQuery.startDate ? `${ticketQuery.startDate}T00:00:00Z` : undefined,
          to: ticketQuery.endDate ? `${ticketQuery.endDate}T23:59:59Z` : undefined,
          passengerId: ticketQuery.passengerId,
          agentId: ticketQuery.agentId,
          status: ticketQuery.status,
        },
      }),
  });

export default useTickets;

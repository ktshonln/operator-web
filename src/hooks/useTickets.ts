import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Branch } from "../pages/ProfileSettings";
import { Ticket } from "./useTicket";

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
          startDate: ticketQuery.startDate,
          endDate: ticketQuery.endDate,
          passengerId: ticketQuery.passengerId,
          agentId: ticketQuery.agentId,
          status: ticketQuery.status,
        },
      }),
  });

export default useTickets;

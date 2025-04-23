import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Branch } from "../pages/ProfileSettings";

const apiClient = new APIClient<TicketResponse>("/tickets");

interface TicketQuery {
  branch?: Branch;
  startDate?: string;
  endDate?: string;
  passengerId?: string;
  agenetId?: string;
  status?: string;
}

interface Ticket {
  ticketId: string;
  passenger: {
    passengerId: string;
    firstName: string;
    LastName: string;
  };
  seatNumber: number;
  origin: string;
  destination: string;
  status: string;
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
          agentId: ticketQuery.agenetId,
          status: ticketQuery.status,
        },
      }),
  });

export default useTickets;

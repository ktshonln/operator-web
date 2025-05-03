import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Branch } from "../pages/ProfileSettings";

const apiClient = new APIClient<TicketResponse>("/tickets");

export interface TicketQuery {
  branch?: Branch;
  startDate?: string;
  endDate?: string;
  passengerId?: string;
  agenetId?: string;
  status?: string;
}

export interface Ticket {
  ticketId?: string; // We only know it on response not on request
  passenger: {
    passengerId?: string; // this is possible on the passenger client because they are logged in
    firstName: string;
    LastName: string;
  };
  seatNumber: number;
  origin: string;
  destination: string;
  status: string;
  date: string; // what is this date? is it the time to leave or the time taken? - time to leave
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

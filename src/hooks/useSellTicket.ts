import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface TicketSaleDetails {
 passengerName?:string;
 passengerPhone?:string;
 tripId: string;
 originStopId: string;
 destinationStopId: string;
 ticketQuantity: number;
 seatNumber: string | string[];
 userId: string | null; // rename later to agentId or better operatorId
}

 interface TicketSaleResponse {
  ticketId: string;
}

const apiClient = new APIClient<TicketSaleResponse>("/tickets");
const useSellTicket = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<TicketSaleResponse, Error ,TicketSaleDetails>({
    mutationFn: apiClient.post<TicketSaleDetails>,
    onSuccess: (savedData) => {
      showToast("Successfully sold ticket", "success");
      navigate(`/ticketing/${savedData.ticketId}`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useSellTicket;

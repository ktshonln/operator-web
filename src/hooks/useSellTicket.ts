import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface TicketSaleDetails {
 passengerId?:string;
 tripId: string;
 originStopId: string;
 destinationStopId: string;
 ticketQuantity: number;
 seatNumber: string | string[];
 userId: string | null; 
}

export interface TicketResponse {
  token: string;
  userId: string;
}

const apiClient = new APIClient<TicketResponse>("/tickets");
const useSellTicket = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<TicketResponse, Error ,TicketSaleDetails>({
    mutationFn: apiClient.post<TicketSaleDetails>,
    onSuccess: (savedData) => {
      showToast("Successfully sold ticket", "success");
      navigate("/home");
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useSellTicket;

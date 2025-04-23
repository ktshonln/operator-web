import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

export interface Agent {
    agentId:string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: string;
    joinedDate: string
}

const apiClient = new APIClient<Agent>("/companies");


const useAgent = (companyId: string, agentId: string) =>
    useQuery<Agent, Error>({
      queryKey: ["companies", companyId, "agents", agentId],
      queryFn: () => apiClient.getAgent(companyId, agentId),
    });

    export default useAgent;
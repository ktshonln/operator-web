import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { Role } from "./useUser";


export interface Agent {
    userId:string;
    inviteUserId: string;
    companyId: string;
    branch: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: Role;
    status: string;
    joinedDate: string
}

const apiClient = new APIClient<Agent>("/companies");


const useAgent = (companyId: string, userId: string) =>
    useQuery<Agent, Error>({
      queryKey: ["companies", companyId, "agents", userId],
      queryFn: () => apiClient.getAgent(companyId, userId),
      enabled:!!userId
    });

    export default useAgent;
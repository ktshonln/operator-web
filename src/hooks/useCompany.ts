import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";


export interface Company {
  companyId: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  registrationDate: string;
  branches: string[];
  about: string;
}

const apiClient = new APIClient<Company>("/companies");
const useCompany = (companyId:string) =>
  useQuery<Company, Error>({
    queryKey: ["company", companyId],
    queryFn: () =>
      apiClient.get(companyId),
  });

export default useCompany;

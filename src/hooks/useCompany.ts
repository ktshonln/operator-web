import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";

// Updated Company interface to match Organization structure
export interface Company {
  id: string;
  name: string;
  slug: string;
  org_type: "company" | "cooperative";
  status: "pending" | "active" | "rejected" | "suspended";
  contact_email: string;
  contact_phone?: string;
  parent_org_id?: string | null;
  logo_path?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  companyId?: string; // Maps to id
  contactEmail?: string; // Maps to contact_email
  contactPhone?: string; // Maps to contact_phone
  registrationDate?: string; // Maps to created_at
  branches?: string[];
  about?: string;
}

const apiClient = new APIClient<Company>("/organizations");
const useCompany = (companyId: string) =>
  useQuery<Company, Error>({
    queryKey: ["organization", companyId],
    queryFn: () => apiClient.get(companyId),
  });

export default useCompany;

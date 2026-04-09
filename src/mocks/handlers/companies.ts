import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
export const handlers = [
  // Companies
  // Intercept "GET /companies/{companyId}" requests...
  http.get(
    `${baseUrl}/companies/:companyId`,
    ({params}) => {
      // ...and respond to them using this JSON response.
    if(params.companyId === 'comp_001')
      return HttpResponse.json(
        {
            companyId:"comp_001",
            name: "RITCO",
            address: "Nyabugogo Terminal, Kigali",
            contactEmail: "info@volcanoexpress.rw",
            contactPhone: "+250788999999",
            registrationDate: "2025-11-01T10:00:00Z",
            branches: ['Kigali - Nyabugogo', 'Kigali - Remera', 'Musanze', 'Rubavu'],
            about: "We are an awesome company"
            },
        { status: 200 }
      );
     else return HttpResponse.json(
        {
            companyId:"comp_001",
            name: "Volcano Express",
            address: "Nyabugogo Terminal, Kigali",
            contactEmail: "info@volcanoexpress.rw",
            contactPhone: "+250788999999",
            registrationDate: "2025-11-01T10:00:00Z",
            branches: ['Kigali - Nyabugogo', 'Kigali - Remera', 'Musanze', 'Rubavu'],
            about: "We are an awesome company"
            },
        { status: 200 }
      );
    }
  ),
];




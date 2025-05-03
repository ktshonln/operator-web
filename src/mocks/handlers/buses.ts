import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";

export const handlers = [
  // Intercept "GET /companies/{companyId}/buses/{busId}" requests...
  http.get(`${baseUrl}/companies/:companyId/buses/:busId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.busId && params.companyId)
      return HttpResponse.json(
        {
          plateNumber: "RAE678L",
          brand: "Yutong",
          model: "ZK6122H9",
          seatingCapacity: 65,
          status: "operational",
        },
        { status: 200 }
      );
  }),
];

import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";

export const handlers = [
    // Intercept "GET /tickets" requests...
  http.get(`${baseUrl}/tickets`, ({ request }) => {
    // ...and respond to them using this JSON response.
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const passengerId = url.searchParams.get("passengerId");
    const agentId = url.searchParams.get("agentId");
    const status = url.searchParams.get("status");

    return HttpResponse.json(
      {
        query: {
          tripId: "trip_4021",
        },
        tickets: [
          {
            ticketId: "tkt_91382",
            passenger: {
              passengerId: "p_87231",
              firstName: "Jane",
              LastName: "Doe",
            },
            seatNumber: 7,

            origin: "Kigali",
            destination: "Huye",
            status: "PAID",
            date: '2025-23-4',
          },
          {
            ticketId: "tkt_91382",
            passenger: {
              passengerId: "p_87231",
              firstName: "Jane",
              LastName: "Doe",
            },
            seatNumber: 7,

            origin: "Kigali",
            destination: "Huye",
            status: "PAID",
            date: '2025-23-4',
          },
          {
            ticketId: "tkt_91382",
            passenger: {
              passengerId: "p_87231",
              firstName: "Jane",
              LastName: "Doe",
            },
            seatNumber: 7,

            origin: "Kigali",
            destination: "Huye",
            status: "PAID",
            date: '2025-23-4',
          },
        ],
      },
      { status: 200 }
    );
  }),
]
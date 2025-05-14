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
            date: "2025-23-4",
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
            date: "2025-23-4",
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
            date: "2025-23-4",
          },
        ],
      },
      { status: 200 }
    );
  }),
  // Intercept "GET /tickets/{ticketId}" requests...
  http.get(`${baseUrl}/tickets/:ticketId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.ticketId === "tkt_91382")
      return HttpResponse.json(
        {
          ticketId: "tkt 91382",
          tripId: "trip_4021",
          passenger: {
            // Passenger details included**
            passengerId: "p_87231",
            firstName: "Jane", // Fetched from Passenger Service
            LastName: "Doe", // Fetched From Passenger Service
          },
          ticketQuantity: 1,
          seatNumber: 7,
          origin: "Kigali",
          destination: "Huye",
          departureTime: "2025-04-10T08:30:00+02:00",
          arrivalTime: "2025-04-10T10:30:00+02:00",
          busId: "bus_001",
          company: {
            id: "comp 001",
            name: "Volcano Express",
          },
          pricing: {
            basePrice: 3800,
            vatIncluded: 540,
            serviceFee: 65,
            totalCharged: 3065,
          },
          status: "PAID",
          purchaseTime: "2025-04-16T10:35:00+02:00", // Updated time
          invoice: {
            invoiceNumber: "EBM-INV-129383",
            ebmStatus: "SUCCESS",
            timestamp: "2025-04-16T10:35:02+02:00",
          },
          printableTicketUrl: "https://katisha-online.com/print/tkt_91382",
          reminder:
            "Please arrive at the station at least 15 minutes before departure",
          IssuedBy: "Katisha Online",
        },
        { status: 200 }
      );
  }),
  // Intercept "POST /tickets" requests...
  http.post(`${baseUrl}/tickets`, () => {
    // ...and respond to them using this JSON response.

    return HttpResponse.json(
      {
        ticketId: "tkt_91382",
      },
      { status: 201 }
    );
  }),
];

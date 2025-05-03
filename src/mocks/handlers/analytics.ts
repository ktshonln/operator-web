import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";

export const handlers = [
  // Analytics
  // Intercept "GET /companies/{companyId}/analytics" requests...
  http.get(`${baseUrl}/companies/:companyId/analytics`, ({ request }) => {
    // ...and respond to them using this JSON response.
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const branch = url.searchParams.get("branch");
    console.log('MSW start branch',branch)
    console.log('MSW start date',startDate)
    console.log('MSW enddate date',endDate)
    if (startDate === "2025-04-23" && endDate === "2025-04-23")
      return HttpResponse.json(
        {
          companyId: "comp_001",
          timeRange: { start: "2025-01-01", end: "2025-04-1" },
          totalTripsRun: 250,
          totalTicketsSold: 8500,
          totalRevenue: { amount: 500000, currency: "RWF" },
          averageOccupacy: 0.75,
        },
        { status: 200 }
      );
      else if(branch?.toLocaleLowerCase() === 'rubavu'){
        return HttpResponse.json(
            {
              companyId: "comp_001",
              timeRange: { start: "2025-01-01", end: "2025-04-1" },
              totalTripsRun: 223353550,
              totalTicketsSold: 823234500,
              totalRevenue: { amount: 934523000000023000000, currency: "RWF" },
              averageOccupacy: 0.75,
            },
            { status: 200 }
          );
      }
      else if(branch?.toLocaleLowerCase() === 'musanze'){
        return HttpResponse.json(
            {
              companyId: "comp_001",
              timeRange: { start: "2025-01-01", end: "2025-04-1" },
              totalTripsRun: 2,
              totalTicketsSold: 12,
              totalRevenue: { amount: 7000, currency: "RWF" },
              averageOccupacy: 0.75,
            },
            { status: 200 }
          );
      }
    else
      return HttpResponse.json(
        {
          companyId: "comp_001",
          timeRange: { start: "2025-04-01", end: "2025-04-15" },
          totalTripsRun: 150,
          totalTicketsSold: 4500,
          totalRevenue: { amount: 135000000, currency: "RWF" },
          averageOccupacy: 0.75,
        },
        { status: 200 }
      );
  }),
  // Intercept "GET /companies/{companyId}/analytics/ticket-sales" requests...
  http.get(
    `${baseUrl}/companies/:companyId/analytics/ticket-sales`,
    ({ request }) => {
      // ...and respond to them using this JSON response.
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const groupBy = url.searchParams.get("groupBy");
      return HttpResponse.json(
        [
          {
            period: "2025-04-14",
            ticketsSold: "310",
            revenue: "930000",
          },
          {
            period: "2025-04-14",
            ticketsSold: "310",
            revenue: "930000",
          },
          {
            period: "2025-04-14",
            ticketsSold: "310",
            revenue: "930000",
          },
        ],
        { status: 200 }
      );
    }
  ),
  // Intercept "GET /companies/{companyId}/analytics/revenue" requests...
  http.get(
    `${baseUrl}/companies/:companyId/analytics/revenue`,
    ({ request }) => {
      // ...and respond to them using this JSON response.
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const groupBy = url.searchParams.get("groupBy");
      return HttpResponse.json(
        [
          {
            routeId: "route-001",
            routeName: "Kigali - Nyanza",
            revenue: "320000",
          },
          {
            routeId: "route-002",
            routeName: "Kigali - Musanze",
            revenue: "843200",
          },
          {
            routeId: "route-003",
            routeName: "Kigali - Nyamasheke",
            revenue: "70000",
          },
        ],
        { status: 200 }
      );
    }
  ),
  // Intercept "GET /companies/{companyId}/analytics/popular-routes" requests...
  http.get(
    `${baseUrl}/companies/:companyId/analytics/popular-routes`,
    ({ request }) => {
      // ...and respond to them using this JSON response.
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const groupBy = url.searchParams.get("groupBy");
      return HttpResponse.json(
        [
          {
            routeId: "route-001",
            routeName: "Kigali - Musanze",
            ticketsSold: 1800,
            rank: 1,
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Huye",
            ticketsSold: 1900,
            rank: 2,
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Nyanza",
            ticketsSold: 1800,
            rank: 3,
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Nyagatare",
            ticketsSold: 1900,
            rank: 4,
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Rubavu",
            ticketsSold: 1800,
            rank: 5,
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Rusizi",
            ticketsSold: 1900,
            rank: 6,
          },
        ],
        { status: 200 }
      );
    }
  ),

  // Intercept "GET /companies/{companyId}/analytics/peak-times" requests...
  http.get(
    `${baseUrl}/companies/:companyId/analytics/peak-times`,
    ({ request }) => {
      // ...and respond to them using this JSON response.
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const branch = url.searchParams.get("branch");
      return HttpResponse.json(
        {
          peakHours: [
            { hour: 7, averageTickets: 55 },
            { hour: 16, averageTickets: 60 },
          ],
          peakDaysOfWeek: [
            { day: 5, dayName: "Friday", averageTickets: 450 },
            { day: 0, dayName: "Sunday", averageTickets: 120 },
          ],
        },
        { status: 200 }
      );
    }
  ),
];

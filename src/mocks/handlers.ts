import { http, HttpResponse } from "msw";
import { loginResponse } from "../hooks/useLogin";
import { User } from "../hooks/useRegister";
import { LoggedInUser } from "../hooks/useUser";
import { generateFakeJWT } from "../utils/helpers";

interface InvalidCredentialsError {
  error: "INVALID_CREDENTIALS";
  message: string;
}

interface UserNotFoundError {
  error: "USER_NOT_FOUND";
  message: string;
}

export type AuthErrorResponse = InvalidCredentialsError | UserNotFoundError;

export const baseUrl = "https://example.com";

const allUsers = new Map();
allUsers.set("user_auth_456", {
  firstName: "Alicia",
  lastName: "Kunda",
  email: "user@example.com",
  password: "12345678Aa!",
  userType: "operator",
  companyName: "RITCO",
  companyRegNo: "12345678",
  companyAddress: "Kigali KN234",
  companyContact: "0788833423",
});

function findUserByCredentials(email: string, password: string) {
  for (const [id, user] of allUsers.entries()) {
    if (user.email === email && user.password === password) {
      return { id, ...user };
    }
  }
  return null; // No matching user found
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handlers = [
  http.options("*", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),

  // Auth
  // Intercept "POST /users/auth/register" requests...
  http.post<never, User, loginResponse>(
    `${baseUrl}/users/auth/register`,
    async ({ request }) => {
      const newUser = await request.json();
      const userId = crypto.randomUUID();

      allUsers.set(userId, newUser);
      const tokenData: LoggedInUser = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
      };

      return HttpResponse.json(
        { userId: userId, token: generateFakeJWT(tokenData) },
        { status: 201 }
      );
    }
  ),
  // Intercept "POST /users/auth/login" requests...
  http.post<never, User, loginResponse | AuthErrorResponse>(
    `${baseUrl}/users/auth/login`,
    async ({ request }) => {
      const { email, password } = await request.json();
      const result = findUserByCredentials(email, password);

      if (!result) {
        const errorResponse: InvalidCredentialsError = {
          error: "INVALID_CREDENTIALS",
          message: "Incorrect email or password.",
        };

        return HttpResponse.json(errorResponse, { status: 401 });
      }
      const tokenData: LoggedInUser = {
        firstName: result.firstName,
        lastName: result.lastName,
        userType: result.userType,
      };
      return HttpResponse.json(
        { userId: result.id, token: generateFakeJWT(tokenData) },
        { status: 200 }
      );
    }
  ),
  // Intercept "POST /users/auth/logout" requests...
  http.post<never>(`${baseUrl}/users/auth/logout`, async ({ request }) => {
    const token = await request.json();

    if (!token) {
      const errorResponse: InvalidCredentialsError = {
        error: "INVALID_CREDENTIALS",
        message: "Error logging out.",
      };

      return HttpResponse.json(errorResponse, { status: 401 });
    }

    return HttpResponse.json(
      {
        message: "You have been successfully logged out.",
        status: "Logged out.",
      },
      { status: 200 }
    );
  }),

  // Analytics
  // Intercept "GET /companies/{companyId}/analytics" requests...
  http.get(`${baseUrl}/companies/:companyId/analytics`, ({ request }) => {
    // ...and respond to them using this JSON response.
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (startDate === "1/1/2025" && endDate === "1/4/2025")
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
        { status: 200, headers: corsHeaders }
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
            routeName: "Kigali - Huye",
            revenue: "930000",
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Huye",
            revenue: "930000",
          },
          {
            routeId: "route-001",
            routeName: "Kigali - Huye",
            revenue: "930000",
          },
        ],
        { status: 200, headers: corsHeaders }
      );
    }
  ),
  // Intercept "GET /companies/{companyId}/analytics/popular-routes" requests...
  http.get(`${baseUrl}/companies/:companyId/analytics/popular-routes`, ({ request }) => {
    // ...and respond to them using this JSON response.
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const groupBy = url.searchParams.get("groupBy");
    return HttpResponse.json(
      [
        {
          routeId: "route-001",
          routeName: "Kigali - Huye",
          ticketsSold: 1800,
          rank: 1,
        },
        {
          routeId: "route-001",
          routeName: "Kigali - Huye",
          ticketsSold: 1900,
          rank: 2,
        },
      ],
      { status: 200, headers: corsHeaders }
    );
  }),

  // Intercept "GET /companies/{companyId}/analytics/popular-routes" requests...
  http.get(
    `${baseUrl}/companies/:companyId/analytics/peak-times`,
    ({ request }) => {
      // ...and respond to them using this JSON response.
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const branch = url.searchParams.get('branch')
      return HttpResponse.json(
        {
          peakHours: [
            { hour: 7, averageTickets: 55 },
            { hour: 16, averageTickets: 60 },
          ],
          peakDaysOfWeek: [
            { day: 5, dayName: "Friday", averageTickets: 450 },
            { day: 0, dayName: "Sunday", averageTickets: 420 },
          ],
        },
        { status: 200, headers: corsHeaders }
      );
    }
  ),
  // Intercept "GET /companies/{companyId}/analytics/popular-routes" requests...
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
          },
        ],
      },
      { status: 200, headers: corsHeaders }
    );
  }),
];

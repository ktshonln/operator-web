import { http, HttpResponse } from "msw";
import { handlers as authHandlers } from "./auth";
import { handlers as analyticsHandlers } from "./analytics";
import { handlers as ticketingHandlers } from "./ticketing";
import { handlers as companyHandlers } from "./companies";
import { handlers as tripHandlers } from "./trips";
import { handlers as routeHandlers } from "./routes";
import { handlers as busHandlers } from "./buses";
import { handlers as driverHandlers } from "./drivers";
import { handlers as agentHandlers } from "./agents";
import { corsHeaders } from "./utils";

export const handlers = [
  http.options("*", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
  ...authHandlers,
  ...analyticsHandlers,
  ...ticketingHandlers,
  ...companyHandlers,
  ...tripHandlers,
  ...routeHandlers,
  ...busHandlers,
  ...driverHandlers,
  ...agentHandlers,
];

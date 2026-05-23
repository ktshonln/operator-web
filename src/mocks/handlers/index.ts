import { http, HttpResponse } from "msw";
import { handlers as authHandlers } from "./auth";
import { handlers as analyticsHandlers } from "./analytics";
import { handlers as ticketingHandlers } from "./ticketing";
import { handlers as organizationHandlers } from "./organizations";
import { handlers as tripHandlers } from "./trips";
import { handlers as routeHandlers } from "./routes";
import { handlers as busHandlers } from "./buses";
import { handlers as driverHandlers } from "./drivers";
import { handlers as agentHandlers } from "./agents";
import { handlers as locationHandlers } from "./locations";
import { handlers as routesV2Handlers } from "./routesV2";
import { handlers as pricesHandlers } from "./prices";
import { tripCalendarHandlers } from "./tripCalendar";
import { corsHeaders } from "./utils";

export const handlers = [
  http.options("*", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
  // Trip calendar handlers first — they override the old-shape trip/route/bus handlers
  ...tripCalendarHandlers,
  ...authHandlers,
  ...analyticsHandlers,
  ...ticketingHandlers,
  ...organizationHandlers,
  ...tripHandlers,
  ...routeHandlers,
  ...busHandlers,
  ...driverHandlers,
  ...agentHandlers,
  ...locationHandlers,
  ...routesV2Handlers,
  ...pricesHandlers,
];

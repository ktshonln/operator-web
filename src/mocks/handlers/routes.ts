import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";
import { Route } from "../../hooks/useRoutes";

let routes =  [
  {
     routeId: 'route_001',
      route: { startId: "start_001", start: "kigali", endId: "end_001", end: "huye" }, // origin stop id and destination id included
      price: 3235,
      intermediateStops: [{stopId: 'stop_001', name: 'muhanga', price: 1305}, {stopId: 'stop_002', name: 'ruhango', price: 1505}, {stopId: 'stop_003', name: 'nyanza', price: 2405}]
  },
  {
     routeId: 'route_002',
      route: { startId: "start_001", start: "rubavu", endId: "end_001", end: "kigali" }, // origin stop id and destination id included
      price: 3235,
      intermediateStops: [{stopId: 'stop_003', name: 'ruhengeri', price: 1305}, {stopId: 'stop_004', name: 'nyabihu', price: 1505}, {stopId: 'stop_003', name: 'nyanza', price: 2405}]
  },
  {
     routeId: 'route_003',
      route: { startId: "start_001", start: "kigali", endId: "end_001", end: "huye" }, // origin stop id and destination id included
      price: 3235,
      intermediateStops: [{stopId: 'stop_001', name: 'muhanga', price: 1305}, {stopId: 'stop_002', name: 'ruhango', price: 1505}, {stopId: 'stop_003', name: 'nyanza', price: 2405}]
  },
]

export const handlers = [
  // Intercept "GET /companies/{companyId}/routes" requests...
  http.get(`${baseUrl}/companies/:companyId/routes`, () => {
    console.log('HiT')
    // ...and respond to them using this JSON response.
      return HttpResponse.json(
        routes,
        { status: 200 }
      );
  }),
  // Intercept "GET /companies/{companyId}/routes/{routeId}" requests...
  http.get(`${baseUrl}/companies/:companyId/routes/:routeId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.routeId && params.companyId)
      return HttpResponse.json(
        routes.filter((route)=> route.routeId === params.routeId)[0],
        { status: 200 }
      );
  }),
  
  // Intercept "PUT /companies/{companyId}/routes/{routeId}" requests...
  http.put<{routeId: string;companyId: string},Route>(`${baseUrl}/companies/:companyId/routes/:routeId`,async ({ params, request }) => {
    // ...and respond to them using this JSON response.
    if (params.routeId && params.companyId){
      const updatedRoute = await request.json()
      const index = routes.findIndex(route => route.routeId === params.routeId);
      if (index !== -1) {
        routes[index] = {
          ...routes[index],
          ...updatedRoute, // Merge old + new to be safe
        };
        return HttpResponse.json(
          routes[index],
            { status: 200 }
          );
      } else {
        return HttpResponse.json(routes[index], {status: 404});
      } 
      
    }
    return HttpResponse.json({ message: "Invalid request" }, { status: 400 });
  }), 

  // Intercept "DELETE /companies/{companyId}/routes/{routeId}" requests...
  http.delete(`${baseUrl}/companies/:companyId/routes/:routeId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.routeId && params.companyId){
      routes = routes.filter((bus)=> bus.routeId !== params.routeId)
      return HttpResponse.json(
        routes,
        { status: 204 }
      );
    }

  }),
  // Intercept "POST /companies/{companyId}/routes" requests...
  http.post<never,Route>(`${baseUrl}/companies/:companyId/routes`, async ({request}) => {
    // ...and respond to them using this JSON response.
    const newRoute = await request.json()
    const newId = crypto.randomUUID();
    newRoute.routeId = newId
    routes.push(newRoute)
      return HttpResponse.json(
       newRoute,
        { status: 201 }
      );
  }),
];

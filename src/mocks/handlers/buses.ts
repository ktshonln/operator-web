import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";
import { Bus } from "../../hooks/useBus";

let buses =  [
  {
    busId: "bus_001",
    plateNumber: "RAD345K",
    brand: "Toyota",
    model: "Coaster",
    seatingCapacity: 50,
    status: "operational",
    vin: '5Y57AF2AFIAI792F',
    assignedDriverId: "driver_001",
  },
  {
    busId: "bus_002",
    plateNumber: "RAD245K",
    brand: "Yutong",
    model: "Large",
    seatingCapacity: 50,
    status: "operational",
    vin: '5Y57AF2AFIAI792F',
    assignedDriverId: "driver_001",
  },
  {
    busId: "bus_003",
    plateNumber: "RAD145K",
    brand: "Toyota",
    model: "Coaster",
    seatingCapacity: 50,
    status: "operational",
    vin: '5Y57AF2AFIAI792F',
    assignedDriverId: "driver_001",
  },
]

export const handlers = [
  // Intercept "GET /companies/{companyId}/buses" requests...
  http.get(`${baseUrl}/companies/:companyId/buses`, () => {
    // ...and respond to them using this JSON response.
      return HttpResponse.json(
        buses,
        { status: 200 }
      );
  }),
  // Intercept "GET /companies/{companyId}/buses/{busId}" requests...
  http.get(`${baseUrl}/companies/:companyId/buses/:busId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.busId && params.companyId)
      return HttpResponse.json(
        buses.filter((bus)=> bus.busId === params.busId)[0],
        { status: 200 }
      );
  }),
  
  // Intercept "PUT /companies/{companyId}/buses/{busId}" requests...
  http.put<{busId: string;companyId: string}, Bus>(`${baseUrl}/companies/:companyId/buses/:busId`,async ({ params, request }) => {
    // ...and respond to them using this JSON response.
    if (params.busId && params.companyId){
      const updatedBus = await request.json()
      const index = buses.findIndex(bus => bus.busId === params.busId);
      if (index !== -1) {
        buses[index] = {
          ...buses[index],
          ...updatedBus, // Merge old + new to be safe
        };
        return HttpResponse.json(
          buses[index],
            { status: 200 }
          );
      } else {
        return HttpResponse.json(buses[index], {status: 404});
      } 
      
    }
    return HttpResponse.json({ message: "Invalid request" }, { status: 400 });
  }), 

  // Intercept "DELETE /companies/{companyId}/buses/{busId}" requests...
  http.delete(`${baseUrl}/companies/:companyId/buses/:busId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.busId && params.companyId){
      buses = buses.filter((bus)=> bus.busId !== params.busId)
      return HttpResponse.json(
        buses,
        { status: 204 }
      );
    }

  }),
  // Intercept "POST /companies/{companyId}/buses" requests...
  http.post<never,Bus>(`${baseUrl}/companies/:companyId/buses`, async ({request}) => {
    // ...and respond to them using this JSON response.
    const newBus = await request.json()
    const newId = crypto.randomUUID();
    newBus.busId = newId
    newBus.status = 'operational'
    buses.push(newBus)
      return HttpResponse.json(
       newBus,
        { status: 201 }
      );
  }),
];

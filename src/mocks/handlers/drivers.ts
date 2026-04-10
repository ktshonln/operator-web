import { http, HttpResponse } from "msw";
import { Driver } from "../../hooks/useDrivers";
import { baseUrl } from "../../services/apiClient";

let drivers = [
  {
    driverId: "driver_001",
    firstName: "Gasana",
    lastName: "Innocent",
    licenseNumber: "DL123456",
    phoneNumber: "+250788886662",
    status: "available",
    assignedBusId: "bus_001",
  },
  {
    driverId: "driver_002",
    firstName: "John",
    lastName: "Driver",
    licenseNumber: "DL123456",
    phoneNumber: "+250788886662",
    status: "available",
    assignedBusId: "bus_001",
  },
  {
    driverId: "driver_003",
    firstName: "John",
    lastName: "Driver again",
    licenseNumber: "DL123456",
    phoneNumber: "+250788886662",
    status: "available",
    assignedBusId: "bus_001",
  },
];

export const handlers = [
  // Intercept "GET /organizations/{orgId}/drivers" requests...
  http.get(`${baseUrl}/organizations/:orgId/drivers`, () => {
    // ...and respond to them using this JSON response.
    return HttpResponse.json(drivers, { status: 200 });
  }),
  // Intercept "GET /organizations/{orgId}/drivers/{driverId}" requests...
  http.get(
    `${baseUrl}/organizations/:orgId/drivers/:driverId`,
    ({ params }) => {
      // ...and respond to them using this JSON response.
      if (params.driverId && params.orgId)
        return HttpResponse.json(
          drivers.find((driver) => driver.driverId === params.driverId),
          { status: 200 },
        );
    },
  ),
  // Intercept "POST /organizations/{orgId}/drivers" requests...
  http.post<never, Driver>(
    `${baseUrl}/organizations/:orgId/drivers`,
    async ({ request }) => {
      // ...and respond to them using this JSON response.
      const newDriver = await request.json();
      const newId = crypto.randomUUID();
      newDriver.driverId = newId;
      newDriver.status = "Available";
      drivers.push(newDriver);
      return HttpResponse.json(newDriver, { status: 201 });
    },
  ),
];

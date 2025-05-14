import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";

let drivers = [
    {
      driverId: "driver_001",
      userId: "user_op_201",
      firstName: "Gasana",
      lastName: "Innocent",
      licenseNumber: "DL123456",
      contactPhone: "+250788886662",
      status: "available",
      assignedBusId: "bus_001",
    },
    {
      driverId: "driver_002",
      userId: "user_op_202",
      firstName: "John",
      lastName: "Driver",
      licenseNumber: "DL123456",
      contactPhone: "+250788886662",
      status: "available",
      assignedBusId: "bus_001",
    },
    {
      driverId: "driver_003",
      userId: "user_op_201",
      firstName: "John",
      lastName: "Driver",
      licenseNumber: "DL123456",
      contactPhone: "+250788886662",
      status: "available",
      assignedBusId: "bus_001",
    },
  ]

export const handlers = [
  // Intercept "GET /companies/{companyId}/drivers" requests...
  http.get(`${baseUrl}/companies/:companyId/drivers`, () => {
    // ...and respond to them using this JSON response.
    return HttpResponse.json(
      drivers,
      { status: 200 }
    );
  }),
  // Intercept "GET /companies/{companyId}/drivers/{driverId}" requests...
  http.get(
    `${baseUrl}/companies/:companyId/drivers/:driverId`,
    ({ params }) => {
      // ...and respond to them using this JSON response.
      if (params.driverId && params.companyId)
        return HttpResponse.json(
          {
            driverId: "driver_001",
            userId: "user_op_201",
            firstName: "Gasana",
            lastName: "Innocent",
            licenseNumber: "DL123456",
            contactPhone: "+250788886662",
            status: "available",
            assignedBusId: "bus_001",
          },
          { status: 200 }
        );
    }
  ),
  // Intercept "POST /companies/{companyId}/drivers" requests...
  http.post(`${baseUrl}/companies/:companyId/drivers`, () => {
    // ...and respond to them using this JSON response.
    return HttpResponse.json(
      {
        driverId: "driver_001",
      },
      { status: 201 }
    );
  }),
];

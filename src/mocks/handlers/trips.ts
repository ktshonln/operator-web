import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";

export const handlers = [
  // Trips
  // Intercept "GET /search/trips" requests...
  http.get(`${baseUrl}/search/trips`, ({ request }) => {
    // ...and respond to them using this JSON response.
    const url = new URL(request.url);
    const departureTime = url.searchParams.get("departureTime");
    const branch = url.searchParams.get("branch");
    const search = url.searchParams.get("search");
    console.log("DEPARTURE", departureTime);

    const status = url.searchParams.get("status");

    if (departureTime === "1/5/2025 15H00")
      return HttpResponse.json(
        [
          {
            tripId: "trip_4021",
            scheduleId: "schedule_001",
            route: { start: "Huye", end: "Nyamagabe" },
            departureTime: "2025-05-01T15:00:00Z",
            arrivalTime: "2025-05-01T16:30:00Z",
            price: "3530",
            busId: "bus_001",
            status: "booked",
            express: true,
            intermediateStops: [],
          },
        ],
        { status: 200 }
      );
    if (search?.toLocaleLowerCase().includes("huye"))
      return HttpResponse.json(
        [
          {
            tripId: "trip_4021",
            scheduleId: "schedule_001",
            route: { start: "Huye", end: "Nyamagabe" },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "3530",
            busId: "bus_001",
            status: "booked",
            express: true,
            intermediateStops: [],
          },
          {
            tripId: "trip_4022",
            scheduleId: "schedule_002",
            route: { start: "Kigali", end: "Huye" },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "4530",
            busId: "bus_002",
            status: "unbooked",
            express: true,
            intermediateStops: ["Muhanga", "Nyanza"],
          },
        ],
        { status: 200 }
      );
    if (branch?.toLocaleLowerCase() === "rubavu")
      return HttpResponse.json(
        [
          {
            tripId: "trip_4021",
            scheduleId: "schedule_001",
            route: { start: "Rubavu", end: "Nyamagabe" },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "3530",
            busId: "bus_001",
            status: "booked",
            express: true,
            intermediateStops: [],
          },
          {
            tripId: "trip_4022",
            scheduleId: "schedule_002",
            route: { start: "Rubavu", end: "Huye" },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "4530",
            busId: "bus_002",
            status: "unbooked",
            express: true,
            intermediateStops: ["Musanze", "Kigali", "Muhanga", "Nyanza"],
          },
        ],
        { status: 200 }
      );
    else
      return HttpResponse.json(
        [
          {
            tripId: "trip_4021",
            scheduleId: "schedule_001",
            route: {
              start: "Kigali",
              startId: "stopKgl",
              end: "Nyamagabe",
              endId: "stopNyam",
            },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "3530",
            busId: "bus_001",
            status: "unbooked",
            express: true,
            intermediateStops: [],
          },
          {
            tripId: "trip_4022",
            scheduleId: "schedule_002",
            route: { start: "Kigali", end: "Huye" },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "4530",
            busId: "bus_002",
            status: "booked",
            express: true,
            intermediateStops: ["Muhanga", "Nyanza"],
          },
          {
            tripId: "trip_4023",
            scheduleId: "schedule_002",
            route: { start: "Kigali", end: "Huye" },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "4530",
            busId: "bus_002",
            status: "unbooked",
            express: false,
            intermediateStops: ["Muhanga", "Nyanza"],
          },
        ],
        { status: 200 }
      );
  }),
  // Intercept "GET /companies/{companyId}/trips/{tripId}/manifest" requests...
  http.get(
    `${baseUrl}/companies/:companyId/trips/:tripId/manifest`,
    ({ params }) => {
      // ...and respond to them using this JSON response.
      if (params.tripId === "trip_4022")
        return HttpResponse.json(
          {
            tripId: "trip_4021",
            departureTime: "2025-04-10T08:30:00+02:00",
            route: "Kigali - Huye",
            busPlate: "RAD 102 B",
            driverName: "John Driver",
            manifest: [
              {
                ticketId: "UCH-VST-H5P-3GN",
                passengerName: "Jane Smith",
                passengerPhone: "073234219",
                seatNumber: "13A",
                origin: "Kigali",
                destination: "Huye",
                status: "PAID",
                timeTaken: "2025-04-10T08:30:00+02:00",
              },
              {
                ticketId: "tkt_91382",
                passengerName: "Jane Smith",
                passengerPhone: "073234219",
                seatNumber: 7,
                origin: "Kigali",
                destination: "Huye",
                status: "PAID",
                timeTaken: "2025-04-10T08:30:00+02:00",
              },
              {
                ticketId: "tkt_91382",
                passengerName: "Jane Smith",
                passengerPhone: "073234219",
                seatNumber: 7,
                origin: "Kigali",
                destination: "Huye",
                status: "PAID",
                timeTaken: "2025-04-10T08:30:00+02:00",
              },
              {
                ticketId: "tkt_91382",
                passengerName: "Jane Smith",
                passengerPhone: "073234219",
                seatNumber: 7,
                origin: "Kigali",
                destination: "Huye",
                status: "PAID",
                timeTaken: "2025-04-10T08:30:00+02:00",
              },
            ],
          },
          { status: 200 }
        );
      else
        return HttpResponse.json(
          {
            tripId: "trip_4021",
            departureTime: "2025-04-10T08:30:00+02:00",
            route: "Kigali - Huye",
            busPlate: "RAD 102 B",
            driverName: "John Driver",
            manifest: [
              {
                ticketId: "tkt_91382",
                passengerName: "Jane Smith",
                passengerPhone: "073234219",
                seatNumber: 7,
                origin: "Kigali",
                destination: "Huye",
                status: "PAID",
                timeTaken: "2025-04-10T08:30:00+02:00",
              },
            ],
          },
          { status: 200 }
        );
    }
  ),
  // Intercept "GET /trips/{tripId}" requests...
  http.get(`${baseUrl}/trips/:tripId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.tripId === "trip_4021")
      return HttpResponse.json(
        {
            tripId: "trip_4021",
            scheduleId: "schedule_001",
            route: {
              start: "Kigali",
              startId: "stopKgl",
              end: "Nyamagabe",
              endId: "stopNyam",
            },
            departureTime: "2025-04-30T14:30:00Z",
            arrivalTime: "2025-04-30T14:30:00Z",
            price: "3530",
            busId: "bus_001",
            seats: ["1", "2", "3", "5"],
            status: "unbooked",
            express: true,
            intermediateStops: ["Muhanga", "Nyanza", "Huye"],
          },
        { status: 200 }
      );
    if (params.tripId === "trip_4022")
      return HttpResponse.json(
        {
          tripId: "trip_4022",
          scheduleId: "schedule_002",
          route: { start: "Kigali", end: "Nyagatare" },
          departureTime: "2025-04-30T14:30:00Z",
          arrivalTime: "2025-04-30T14:30:00Z",
          price: "4530",
          busId: "bus_002",
          seats: ["1", "2", "3", "5"],
          status: "booked",
          express: true,
          intermediateStops: [],
        },
        { status: 200 }
      );
  }),
  // Intercept "GET /trip-schedules/{scheduleId}" requests...
  http.get(`${baseUrl}/trip-schedules/:scheduleId`, ({ params }) => {
    // ...and respond to them using this JSON response.
      return HttpResponse.json(
        [{
          tripId: "trip_4021",
          scheduleId: "schedule_002",
          route: { start: "Kigali", end: "Nyagatare" },
          departureTime: "2025-04-30T14:30:00Z",
          arrivalTime: "2025-04-30T14:30:00Z",
          price: "4530",
          busId: "bus_002",
          seats: ["1", "2", "3", "5"],
          status: "booked",
          express: true,
          intermediateStops: [],
        },
        {
          tripId: "trip_4022",
          scheduleId: "schedule_002",
          route: { start: "Kigali", end: "Nyagatare" },
          departureTime: "2025-04-30T14:30:00Z",
          arrivalTime: "2025-04-30T14:30:00Z",
          price: "4530",
          busId: "bus_002",
          seats: ["1", "2", "3", "5"],
          status: "booked",
          express: true,
          intermediateStops: [],
        },
      ],
        { status: 200 }
      );
  }),
];

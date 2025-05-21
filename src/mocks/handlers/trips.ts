import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";
import { Trip } from "../../hooks/useTrips";
import { TripDetails } from "../../hooks/useAddTrip";

let trips = [
  {
    tripId: "trip_4021",
    scheduleId: "schedule_001",
    route: {
      start: "Kigali",
      startId: "stopKgl",
      end: "Nyamagabe",
      endId: "stopNyam",
    },
    departureDateAndTime: "2025-04-30T14:30:00Z",
    arrivalTime: "2025-04-30T14:30:00Z",
    seats: ['1', '2', '3', '4'],
    price: 3530,
    busId: "bus_001",
    status: "unbooked",
    express: true,
    intermediateStops: [],
  },
  {
    tripId: "trip_4022",
    scheduleId: "schedule_002",
    route: {
      start: "Kigali",
      startId: "stopKgl",
      end: "Huye",
      endId: "stopHuy",
    },
    departureDateAndTime: "2025-04-30T14:30:00Z",
    arrivalTime: "2025-04-30T14:30:00Z",
    seats: ['1', '2', '3', '4'],
    price: 4530,
    busId: "bus_002",
    status: "booked",
    express: true,
    intermediateStops: ["Muhanga", "Ruhango","Nyanza"],
  },
  {
    tripId: "trip_4023",
    scheduleId: "schedule_002",
     route: {
      start: "Rubavu",
      startId: "stopRub",
      end: "Kigali",
      endId: "stopKgl",
    },
    departureDateAndTime: "2025-04-30T14:30:00Z",
    arrivalTime: "2025-04-30T14:30:00Z",
    seats: ['1', '2', '3', '4'],
    price: 4530,
    busId: "bus_002",
    status: "unbooked",
    express: false,
    intermediateStops: ["Ruhengeri", "Nyabihu"],
  },
];

export const handlers = [
  // Trips
  // Intercept "GET /search/trips" requests...
  http.get(`${baseUrl}/search/trips`, ({ request }) => {
    // ...and respond to them using this JSON response.
    const url = new URL(request.url);
    const departureTime = url.searchParams.get("departureTime");
    const branch = url.searchParams.get("branch");
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");

    if (branch) {
      if(branch==='All branches') return HttpResponse.json(trips, { status: 200 });
      if (departureTime)
        return HttpResponse.json(
      trips.filter(trip=>trip.departureDateAndTime===departureTime),
      { status: 200 }
    );
    {
      if (search)
        return HttpResponse.json(
      trips.filter(trip=>trip.route.end.toLowerCase() ===search.toLowerCase()),
      { status: 200 }
    );
  }
  return HttpResponse.json(
    trips.filter(trip=>trip.route.start.toLowerCase()===branch.toLowerCase()),
    { status: 200 }
  );
}
    else return HttpResponse.json(trips, { status: 200 });
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
    if (params.tripId) {
      const trip = trips.find((trip) => trip.tripId === params.tripId);
      if (trip) {
        return HttpResponse.json(trip);
      } else {
        return HttpResponse.json(trip, { status: 404 });
      }
    }
    return HttpResponse.json({ message: "Invalid request" }, { status: 400 });
  }),
  // Intercept "GET /trip-schedules/{scheduleId}" requests...
  http.get(`${baseUrl}/trip-schedules/:scheduleId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    return HttpResponse.json(
      trips,
      { status: 200 }
    );
  }),
   // Intercept "POST /companies/trips" requests...
    http.post<never,TripDetails,Trip>(`${baseUrl}/companies/:companyId/trips`, async ({request}) => {
      // ...and respond to them using this JSON response.
      const newTrip = await request.json()
      const newId = crypto.randomUUID();
      const fullTrip = {...newTrip, tripId: `${newId}`, scheduleId: '', price: 12, arrivalTime:'', departureTime: '',
  busId: '',
  seats: [],
  status: '',
  express: false,
  intermediateStops:[],
  route: {...newTrip.route, startId: '', endId: ''}
}
      trips.push(fullTrip)
        return HttpResponse.json(
         fullTrip,
          { status: 201 }
        );
    }),
];

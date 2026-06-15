/**
 * MSW handlers for the Trip Calendar feature.
 * These mock the new /api/v1/trips endpoints as described in the feature description.
 * Shape matches the feature description (first priority), not the OpenAPI spec.
 */

import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
import { addDays, format, startOfWeek } from "date-fns";

// ─── Mock ticket store ────────────────────────────────────────────────────────

const MOCK_STOPS_KGL_GIS = [
  { id: "stop-kgl", name: "Kigali" },
  { id: "stop-mus", name: "Musanze" },
  { id: "stop-gis", name: "Gisenyi" },
];

const MOCK_STOPS_KGL_HUY = [
  { id: "stop-kgl", name: "Kigali" },
  { id: "stop-huy", name: "Huye" },
];

const MOCK_PRICES: Record<string, { amount: number; currency: string }> = {
  "stop-kgl|stop-mus": { amount: 2000, currency: "RWF" },
  "stop-kgl|stop-gis": { amount: 3500, currency: "RWF" },
  "stop-mus|stop-gis": { amount: 1500, currency: "RWF" },
  "stop-kgl|stop-huy": { amount: 2500, currency: "RWF" },
};

let mockTickets: Record<string, any[]> = {};

function getTicketsForTrip(tripId: string): any[] {
  if (!mockTickets[tripId]) {
    // Generate some seed tickets for the trip
    const trip = mockTrips.find((t) => t.id === tripId);
    if (!trip) return [];
    const stops = trip.route_id === "route-kgl-gis" ? MOCK_STOPS_KGL_GIS : MOCK_STOPS_KGL_HUY;
    const methods = ["mtn", "airtel", "wallet", "cash"] as const;
    const statuses = ["confirmed", "confirmed", "confirmed", "pending", "cancelled"] as const;
    const names = ["Kalisa Nkusi", "Uwimana Jean", "Mukamana Alice", "Habimana Eric", "Niyonzima Paul"];
    const phones = ["+250788111111", "+250788222222", "+250788333333", "+250788444444", "+250788555555"];
    const count = Math.min(trip.booked_seats, 5);
    mockTickets[tripId] = Array.from({ length: count }, (_, i) => ({
      id: `ticket-${tripId}-${i}`,
      passenger_name: names[i % names.length],
      phone: phones[i % phones.length],
      boarding_stop: stops[0],
      alighting_stop: stops[stops.length - 1],
      seats_count: 1,
      amount: 2000,
      currency: "RWF",
      payment_method: methods[i % methods.length],
      status: statuses[i % statuses.length],
      created_by: i % 2 === 0 ? "passenger" : "staff",
      booked_at: new Date(Date.now() - i * 3600000).toISOString(),
    }));
  }
  return mockTickets[tripId];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const MOCK_ROUTES = [
  {
    id: "route-kgl-gis",
    name: "Kigali — Gisenyi",
    route_stops: [
      { order: 1, stop: { id: "stop-kgl", name: "Kigali" } },
      { order: 2, stop: { id: "stop-mus", name: "Musanze" } },
      { order: 3, stop: { id: "stop-gis", name: "Gisenyi" } },
    ],
  },
  {
    id: "route-kgl-huy",
    name: "Kigali — Huye",
    route_stops: [
      { order: 1, stop: { id: "stop-kgl", name: "Kigali" } },
      { order: 2, stop: { id: "stop-huy", name: "Huye" } },
    ],
  },
  {
    id: "route-kgl-mus",
    name: "Kigali — Musanze",
    route_stops: [
      { order: 1, stop: { id: "stop-kgl", name: "Kigali" } },
      { order: 2, stop: { id: "stop-mus", name: "Musanze" } },
    ],
  },
];

const MOCK_BUSES = [
  {
    id: "bus-001",
    plate: "RAA 001 A",
    type: "Coach",
    capacity: 45,
    total_seats: 45,
    status: "active",
    routes: [{ id: "route-kgl-gis", name: "Kigali — Gisenyi" }],
    driver: null,
    org: null,
    org_id: "org-001",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "bus-002",
    plate: "RAB 002 B",
    type: "Coaster",
    capacity: 30,
    total_seats: 30,
    status: "active",
    routes: [{ id: "route-kgl-huy", name: "Kigali — Huye" }],
    driver: null,
    org: null,
    org_id: "org-001",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "bus-003",
    plate: "RAC 003 C",
    type: "Yutong",
    capacity: 54,
    total_seats: 54,
    status: "active",
    routes: [],
    driver: null,
    org: null,
    org_id: "org-001",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

const MOCK_DRIVERS = [
  {
    id: "driver-001",
    first_name: "Jean",
    last_name: "Uwimana",
    avatar_path: null,
    email: "jean@katisha.rw",
    phone_number: "+250780000001",
    user_type: "staff",
    status: "active",
    roles: ["driver"],
    org_id: "org-001",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "driver-002",
    first_name: "Marie",
    last_name: "Kalisa",
    avatar_path: null,
    email: "marie@katisha.rw",
    phone_number: "+250780000002",
    user_type: "staff",
    status: "active",
    roles: ["driver"],
    org_id: "org-001",
    created_at: "2026-01-01T00:00:00Z",
  },
];

// ─── Trip store (mutable for create/edit/delete) ──────────────────────────────

function buildTrips() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const trips: any[] = [];

  const routeKglGis = MOCK_ROUTES[0];
  const routeKglHuy = MOCK_ROUTES[1];

  // Series 1: Kigali—Gisenyi, daily, every 60 min from 06:00 to 10:00
  const series1Id = "series-001";
  const hours1 = [6, 7, 8, 9, 10];
  for (let day = 0; day < 7; day++) {
    const date = addDays(weekStart, day);
    for (const hour of hours1) {
      const departure = new Date(date);
      departure.setHours(hour, 0, 0, 0);
      const booked = Math.floor(Math.random() * 40);
      trips.push({
        id: `trip-s1-d${day}-h${hour}`,
        series_id: series1Id,
        route_id: routeKglGis.id,
        org_id: "org-001",
        bus_id: hour < 9 ? "bus-001" : null,
        driver_id: hour < 9 ? "driver-001" : null,
        departure_at: departure.toISOString(),
        total_seats: 45,
        booked_seats: booked,
        remaining_seats: 45 - booked,
        status: "scheduled",
        is_express: hour === 8,
        cancellation_allowed: true,
        series: {
          id: series1Id,
          frequency_minutes: 60,
          repeat_daily: true,
          starts_on: format(weekStart, "yyyy-MM-dd"),
          ends_on: format(addDays(weekStart, 13), "yyyy-MM-dd"),
          is_only_in_series: false,
        },
        bus: hour < 9 ? { id: "bus-001", plate: "RAA 001 A", type: "Coach" } : null,
        driver: hour < 9 ? { id: "driver-001", first_name: "Jean", last_name: "Uwimana", avatar_path: null } : null,
        route: routeKglGis,
      });
    }
  }

  // Series 2: Kigali—Huye, one-off trips on Mon/Wed/Fri at 07:30
  const series2Id = "series-002";
  for (const dayOffset of [0, 2, 4]) {
    const date = addDays(weekStart, dayOffset);
    const departure = new Date(date);
    departure.setHours(7, 30, 0, 0);
    const booked = Math.floor(Math.random() * 25);
    trips.push({
      id: `trip-s2-d${dayOffset}`,
      series_id: series2Id,
      route_id: routeKglHuy.id,
      org_id: "org-001",
      bus_id: "bus-002",
      driver_id: "driver-002",
      departure_at: departure.toISOString(),
      total_seats: 30,
      booked_seats: booked,
      remaining_seats: 30 - booked,
      status: "scheduled",
      is_express: false,
      cancellation_allowed: true,
      series: {
        id: series2Id,
        frequency_minutes: null,
        repeat_daily: false,
        starts_on: format(addDays(weekStart, dayOffset), "yyyy-MM-dd"),
        ends_on: null,
        is_only_in_series: true,
      },
      bus: { id: "bus-002", plate: "RAB 002 B", type: "Coaster" },
      driver: { id: "driver-002", first_name: "Marie", last_name: "Kalisa", avatar_path: null },
      route: routeKglHuy,
    });
  }

  return trips;
}

let mockTrips = buildTrips();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterTrips(params: URLSearchParams) {
  const routeId = params.get("route_id");
  const from = params.get("from");
  const to = params.get("to");
  const unassignedOnly = params.get("unassigned_only") === "true";

  let result = [...mockTrips];

  if (routeId) {
    result = result.filter((t) => t.route_id === routeId);
  }
  if (from) {
    result = result.filter((t) => t.departure_at >= new Date(from).toISOString());
  }
  if (to) {
    // to is end of day
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter((t) => t.departure_at <= toDate.toISOString());
  }
  if (unassignedOnly) {
    result = result.filter((t) => !t.bus || !t.driver);
  }

  return result;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const tripCalendarHandlers = [

  // ── GET /trips/:id ──────────────────────────────────────────────────────────
  http.get(`${baseUrl}/trips/:id`, ({ params }) => {
    const { id } = params as { id: string };
    const trip = mockTrips.find((t) => t.id === id);
    if (!trip) {
      return HttpResponse.json(
        { error: { code: "TRIP_NOT_FOUND", message: "Trip not found" } },
        { status: 404 }
      );
    }
    // Enrich with full route (including route_stops) and flat stops array
    const fullRoute = MOCK_ROUTES.find((r) => r.id === trip.route_id) ?? trip.route;
    const stops = (fullRoute?.route_stops ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((rs: any) => ({ ...rs.stop, order: rs.order }));

    return HttpResponse.json({
      ...trip,
      route: fullRoute,
      stops,
      created_at: trip.departure_at,
      updated_at: trip.departure_at,
    });
  }),

  // ── GET /trips/:id/tickets ──────────────────────────────────────────────────
  http.get(`${baseUrl}/trips/:id/tickets`, ({ params, request }) => {
    const { id } = params as { id: string };
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const status = url.searchParams.get("status") ?? "";

    let tickets = getTicketsForTrip(id);
    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }

    const start = (page - 1) * limit;
    const paged = tickets.slice(start, start + limit);

    return HttpResponse.json({
      data: paged,
      total: tickets.length,
      page,
      limit,
    });
  }),

  // ── GET /prices ─────────────────────────────────────────────────────────────
  http.get(`${baseUrl}/prices`, ({ request }) => {
    const url = new URL(request.url);
    const boardingId = url.searchParams.get("boarding_stop_id") ?? "";
    const alightingId = url.searchParams.get("alighting_stop_id") ?? "";
    const key = `${boardingId}|${alightingId}`;
    const price = MOCK_PRICES[key];
    if (!price) {
      return HttpResponse.json(
        { error: { code: "PRICE_NOT_FOUND", message: "Price not found for this stop combination" } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      boarding_stop_id: boardingId,
      alighting_stop_id: alightingId,
      amount: price.amount,
      currency: price.currency,
    });
  }),

  // ── GET /trips ──────────────────────────────────────────────────────────────
  http.get(`${baseUrl}/trips`, ({ request }) => {
    const url = new URL(request.url);
    const trips = filterTrips(url.searchParams);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "100");

    return HttpResponse.json({
      data: trips,
      total: trips.length,
      page,
      limit,
    });
  }),

  // ── POST /trips ─────────────────────────────────────────────────────────────
  http.post(`${baseUrl}/trips`, async ({ request }) => {
    const body = await request.json() as any;

    const {
      route_id,
      bus_id,
      driver_id,
      total_seats,
      is_express = false,
      departure_time,
      starts_on,
      ends_on,
      repeat_daily = false,
      frequency_minutes = null,
    } = body;

    // Validate
    if (!repeat_daily && !bus_id && !total_seats) {
      return HttpResponse.json(
        { error: { code: "TOTAL_SEATS_REQUIRED", message: "Total seats is required when no bus is assigned for a one-off trip" } },
        { status: 422 }
      );
    }
    if (repeat_daily && ends_on && ends_on <= starts_on) {
      return HttpResponse.json(
        { error: { code: "INVALID_DATE_RANGE", message: "ends_on must be after starts_on" } },
        { status: 422 }
      );
    }

    const route = MOCK_ROUTES.find((r) => r.id === route_id);
    const bus = bus_id ? MOCK_BUSES.find((b) => b.id === bus_id) : null;
    const driver = driver_id ? MOCK_DRIVERS.find((d) => d.id === driver_id) : null;
    const seats = total_seats ?? (bus?.capacity ?? 30);
    const seriesId = crypto.randomUUID();

    // Generate trip instances
    const newTrips: any[] = [];
    const [hh, mm] = (departure_time as string).split(":").map(Number);

    const startDate = new Date(starts_on);
    const endDate = repeat_daily && ends_on ? new Date(ends_on) : startDate;

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (frequency_minutes) {
        // Multiple trips per day
        let currentHour = hh;
        let currentMin = mm;
        while (currentHour < 22) {
          const dep = new Date(currentDate);
          dep.setHours(currentHour, currentMin, 0, 0);
          newTrips.push(makeTripInstance(dep, seriesId, route, bus, driver, seats, is_express, repeat_daily, frequency_minutes, starts_on, ends_on));
          currentMin += frequency_minutes;
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      } else {
        const dep = new Date(currentDate);
        dep.setHours(hh, mm, 0, 0);
        newTrips.push(makeTripInstance(dep, seriesId, route, bus, driver, seats, is_express, repeat_daily, frequency_minutes, starts_on, ends_on));
      }
      currentDate = addDays(currentDate, 1);
    }

    // For repeating series, strip bus/driver per description
    const finalTrips = newTrips.map((t) =>
      repeat_daily
        ? { ...t, bus_id: null, driver_id: null, bus: null, driver: null }
        : t
    );

    mockTrips = [...mockTrips, ...finalTrips];

    return HttpResponse.json(
      { trips_created: finalTrips.length, trips: finalTrips },
      { status: 201 }
    );
  }),

  // ── PATCH /trips/:id ────────────────────────────────────────────────────────
  http.patch(`${baseUrl}/trips/:id`, async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = await request.json() as any;
    const { scope, departure_time, bus_id, driver_id, total_seats, is_express } = body;

    const tripIndex = mockTrips.findIndex((t) => t.id === id);
    if (tripIndex === -1) {
      return HttpResponse.json(
        { error: { code: "TRIP_NOT_FOUND", message: "Trip not found" } },
        { status: 404 }
      );
    }

    const trip = mockTrips[tripIndex];

    // Check bookings for scope:"this"
    if (scope === "this" && trip.booked_seats > 0) {
      return HttpResponse.json(
        { error: { code: "HAS_BOOKINGS", message: "This trip cannot be changed because passengers have already booked it" } },
        { status: 400 }
      );
    }

    const bus = bus_id ? MOCK_BUSES.find((b) => b.id === bus_id) ?? null : null;
    const driver = driver_id ? MOCK_DRIVERS.find((d) => d.id === driver_id) ?? null : null;

    const applyUpdate = (t: any) => {
      const dep = new Date(t.departure_at);
      if (departure_time) {
        const [hh, mm] = departure_time.split(":").map(Number);
        dep.setHours(hh, mm, 0, 0);
      }
      return {
        ...t,
        departure_at: dep.toISOString(),
        bus_id: bus_id !== undefined ? (bus_id || null) : t.bus_id,
        driver_id: driver_id !== undefined ? (driver_id || null) : t.driver_id,
        total_seats: total_seats ?? t.total_seats,
        remaining_seats: (total_seats ?? t.total_seats) - t.booked_seats,
        is_express: is_express !== undefined ? is_express : t.is_express,
        bus: bus_id !== undefined ? (bus ? { id: bus.id, plate: bus.plate, type: bus.type } : null) : t.bus,
        driver: driver_id !== undefined ? (driver ? { id: driver.id, first_name: driver.first_name, last_name: driver.last_name, avatar_path: driver.avatar_path } : null) : t.driver,
      };
    };

    if (scope === "this") {
      const updated = applyUpdate(trip);
      mockTrips[tripIndex] = updated;
      return HttpResponse.json(updated, { status: 200 });
    }

    // scope === "future"
    const skipped: any[] = [];
    let updatedCount = 0;

    mockTrips = mockTrips.map((t) => {
      const isFutureSibling =
        t.series_id === trip.series_id &&
        new Date(t.departure_at) >= new Date(trip.departure_at);

      if (!isFutureSibling) return t;

      if (t.booked_seats > 0) {
        skipped.push({ trip_id: t.id, departure_at: t.departure_at, reason: "HAS_BOOKINGS" });
        return t;
      }

      updatedCount++;
      return applyUpdate(t);
    });

    return HttpResponse.json({ updated: updatedCount, skipped }, { status: 200 });
  }),

  // ── DELETE /trips/:id ───────────────────────────────────────────────────────
  http.delete(`${baseUrl}/trips/:id`, async ({ params, request }) => {
    const { id } = params as { id: string };
    let body: any = {};
    try { body = await request.json() as any; } catch { /* no body */ }
    const scope = body?.scope ?? "this";

    const trip = mockTrips.find((t) => t.id === id);
    if (!trip) {
      return HttpResponse.json(
        { error: { code: "TRIP_NOT_FOUND", message: "Trip not found" } },
        { status: 404 }
      );
    }

    if (scope === "this") {
      if (trip.booked_seats > 0) {
        return HttpResponse.json(
          { error: { code: "HAS_BOOKINGS", message: "This trip cannot be deleted because passengers have already booked it" } },
          { status: 400 }
        );
      }
      mockTrips = mockTrips.filter((t) => t.id !== id);
      return new HttpResponse(null, { status: 204 });
    }

    // scope === "future"
    const skipped: any[] = [];
    let deletedCount = 0;

    mockTrips = mockTrips.filter((t) => {
      const isFutureSibling =
        t.series_id === trip.series_id &&
        new Date(t.departure_at) >= new Date(trip.departure_at);

      if (!isFutureSibling) return true;

      if (t.booked_seats > 0) {
        skipped.push({ trip_id: t.id, departure_at: t.departure_at, reason: "HAS_BOOKINGS" });
        return true;
      }

      deletedCount++;
      return false;
    });

    return HttpResponse.json({ deleted: deletedCount, skipped }, { status: 200 });
  }),

  // ── GET /routes (with q search support) ─────────────────────────────────────
  // Override the existing routes handler to return the new shape
  http.get(`${baseUrl}/routes`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const routes = q
      ? MOCK_ROUTES.filter((r) => r.name.toLowerCase().includes(q))
      : MOCK_ROUTES;
    return HttpResponse.json({ routes });
  }),

  // ── GET /buses (with q search support) ──────────────────────────────────────
  // Override the existing buses handler to return the new shape
  http.get(`${baseUrl}/buses`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const buses = q
      ? MOCK_BUSES.filter(
          (b) =>
            b.plate.toLowerCase().includes(q) ||
            b.type.toLowerCase().includes(q)
        )
      : MOCK_BUSES;
    return HttpResponse.json({ data: buses, total: buses.length, page: 1, limit: buses.length });
  }),

  // ── GET /users (driver search) ───────────────────────────────────────────────
  http.get(`${baseUrl}/users`, ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";

    if (role === "driver") {
      const drivers = q
        ? MOCK_DRIVERS.filter(
            (d) =>
              d.first_name.toLowerCase().includes(q) ||
              d.last_name.toLowerCase().includes(q)
          )
        : MOCK_DRIVERS;
      return HttpResponse.json({ data: drivers, total: drivers.length, page: 1, limit: drivers.length });
    }

    // Fall through for non-driver user requests
    return HttpResponse.json({ data: [], total: 0, page: 1, limit: 20 });
  }),

  // ── POST /tickets (cash ticket creation) ────────────────────────────────────
  http.post(`${baseUrl}/tickets`, async ({ request }) => {
    const body = await request.json() as any;
    const {
      trip_id,
      boarding_stop_id,
      alighting_stop_id,
      seats_count = 1,
      payment_method = "cash",
      phone,
      passenger_name,
    } = body;

    const trip = mockTrips.find((t) => t.id === trip_id);
    if (!trip) {
      return HttpResponse.json(
        { error: { code: "TRIP_NOT_FOUND", message: "Trip not found" } },
        { status: 404 }
      );
    }

    if (trip.remaining_seats < seats_count) {
      return HttpResponse.json(
        { error: { code: "NO_SEATS_AVAILABLE", available: trip.remaining_seats } },
        { status: 400 }
      );
    }

    const priceKey = `${boarding_stop_id}|${alighting_stop_id}`;
    const price = MOCK_PRICES[priceKey];
    if (!price) {
      return HttpResponse.json(
        { error: { code: "PRICE_NOT_FOUND", message: "Price not found for this stop combination" } },
        { status: 404 }
      );
    }

    // Find stop names
    const allStops = [
      ...MOCK_STOPS_KGL_GIS,
      ...MOCK_STOPS_KGL_HUY,
    ];
    const boardingStop = allStops.find((s) => s.id === boarding_stop_id) ?? { id: boarding_stop_id, name: boarding_stop_id };
    const alightingStop = allStops.find((s) => s.id === alighting_stop_id) ?? { id: alighting_stop_id, name: alighting_stop_id };

    // Update trip seat counts
    const tripIndex = mockTrips.findIndex((t) => t.id === trip_id);
    if (tripIndex !== -1) {
      mockTrips[tripIndex] = {
        ...mockTrips[tripIndex],
        booked_seats: mockTrips[tripIndex].booked_seats + seats_count,
        remaining_seats: mockTrips[tripIndex].remaining_seats - seats_count,
      };
    }

    const newTicket = {
      id: crypto.randomUUID(),
      status: "confirmed",
      passenger_name,
      phone,
      seats_count,
      amount: price.amount * seats_count,
      currency: price.currency,
      payment_method,
      boarding_stop: boardingStop,
      alighting_stop: alightingStop,
    };

    // Store in ticket store
    if (!mockTickets[trip_id]) mockTickets[trip_id] = [];
    mockTickets[trip_id].unshift({
      ...newTicket,
      created_by: "staff",
      booked_at: new Date().toISOString(),
    });

    return HttpResponse.json(newTicket, { status: 201 });
  }),
];

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeTripInstance(
  departure: Date,
  seriesId: string,
  route: any,
  bus: any,
  driver: any,
  seats: number,
  isExpress: boolean,
  repeatDaily: boolean,
  frequencyMinutes: number | null,
  startsOn: string,
  endsOn: string | null,
) {
  return {
    id: crypto.randomUUID(),
    series_id: seriesId,
    route_id: route?.id ?? "",
    org_id: "org-001",
    bus_id: bus?.id ?? null,
    driver_id: driver?.id ?? null,
    departure_at: departure.toISOString(),
    total_seats: seats,
    booked_seats: 0,
    remaining_seats: seats,
    status: "scheduled",
    is_express: isExpress,
    cancellation_allowed: true,
    series: {
      id: seriesId,
      frequency_minutes: frequencyMinutes,
      repeat_daily: repeatDaily,
      starts_on: startsOn,
      ends_on: endsOn,
      is_only_in_series: !repeatDaily && !frequencyMinutes,
    },
    bus: bus ? { id: bus.id, plate: bus.plate, type: bus.type } : null,
    driver: driver ? { id: driver.id, first_name: driver.first_name, last_name: driver.last_name, avatar_path: driver.avatar_path } : null,
    route: route ? { id: route.id, name: route.name } : null,
  };
}

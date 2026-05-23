import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
import type { RouteDetail, RouteListItem } from "../../hooks/useRoutesV2";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedRoutes: RouteDetail[] = [
  {
    id: "route_001",
    name: "Kigali — Musanze",
    status: "active",
    org: { id: "org_001", name: "RITCO" },
    prices_complete: true,
    stops: [
      { id: "stop_001", location_id: "loc_001", name: "Nyabugogo Terminal", lat: -1.9355, lng: 30.0566, order: 0 },
      { id: "stop_002", location_id: "loc_002", name: "Musanze Bus Park", lat: -1.4994, lng: 29.634, order: 1 },
    ],
    created_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z",
  },
  {
    id: "route_002",
    name: "Kigali — Huye",
    status: "inactive",
    org: { id: "org_001", name: "RITCO" },
    prices_complete: false,
    stops: [
      { id: "stop_003", location_id: "loc_001", name: "Nyabugogo Terminal", lat: -1.9355, lng: 30.0566, order: 0 },
      { id: "stop_004", location_id: "loc_003", name: "Huye Bus Terminal", lat: -2.5967, lng: 29.7394, order: 1 },
    ],
    created_at: "2025-01-11T09:00:00Z",
    updated_at: "2025-01-11T09:00:00Z",
  },
  {
    id: "route_003",
    name: "Musanze — Huye",
    status: "inactive",
    org: { id: "org_002", name: "Volcano Express" },
    prices_complete: false,
    stops: [
      { id: "stop_005", location_id: "loc_002", name: "Musanze Bus Park", lat: -1.4994, lng: 29.634, order: 0 },
      { id: "stop_006", location_id: "loc_003", name: "Huye Bus Terminal", lat: -2.5967, lng: 29.7394, order: 1 },
    ],
    created_at: "2025-01-12T10:00:00Z",
    updated_at: "2025-01-12T10:00:00Z",
  },
];

function toListItem(r: RouteDetail): RouteListItem {
  return {
    id: r.id,
    name: r.name,
    status: r.status,
    stops_count: r.stops.length,
    origin: r.stops[0] ? { id: r.stops[0].location_id, name: r.stops[0].name } : { id: "", name: "" },
    destination: r.stops[r.stops.length - 1]
      ? { id: r.stops[r.stops.length - 1].location_id, name: r.stops[r.stops.length - 1].name }
      : { id: "", name: "" },
    created_at: r.created_at,
  };
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // GET /routes — paginated list
  http.get(`${baseUrl}/routes`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const status = url.searchParams.get("status") ?? "";

    let filtered = seedRoutes;
    if (q) filtered = filtered.filter((r) => r.name.toLowerCase().includes(q));
    if (status === "active" || status === "inactive") {
      filtered = filtered.filter((r) => r.status === status);
    }

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit).map(toListItem);

    return HttpResponse.json({ data, total: filtered.length, page, limit }, { status: 200 });
  }),

  // POST /routes — create
  http.post(`${baseUrl}/routes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const stops = (body.stops as { location_id: string; order: number }[]) ?? [];
    const newRoute: RouteDetail = {
      id: `route_${Date.now()}`,
      name: (body.name as string) || `Route ${Date.now()}`,
      status: "inactive",
      org: { id: "org_001", name: "RITCO" },
      prices_complete: false,
      stops: stops.map((s, i) => ({
        id: `stop_new_${i}`,
        location_id: s.location_id,
        name: `Stop ${i + 1}`,
        lat: 0,
        lng: 0,
        order: s.order,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newRoute, { status: 201 });
  }),

  // GET /routes/:id — single route
  http.get(`${baseUrl}/routes/:id`, ({ params }) => {
    const found = seedRoutes.find((r) => r.id === params.id) ?? seedRoutes[0];
    return HttpResponse.json(found, { status: 200 });
  }),

  // PATCH /routes/:id — update
  http.patch(`${baseUrl}/routes/:id`, async ({ request, params }) => {
    const updates = (await request.json()) as Record<string, unknown>;
    const existing = seedRoutes.find((r) => r.id === params.id) ?? seedRoutes[0];
    const updated: RouteDetail = {
      ...existing,
      ...(updates as Partial<RouteDetail>),
      id: existing.id,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(updated, { status: 200 });
  }),

  // DELETE /routes/:id
  http.delete(`${baseUrl}/routes/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

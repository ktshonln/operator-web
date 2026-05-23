import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
import type { Location } from "../../hooks/useLocations";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedLocations: Location[] = [
  {
    id: "loc_001",
    name: "Nyabugogo Terminal",
    province: "Kigali City",
    lat: -1.9355,
    lng: 30.0566,
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "loc_002",
    name: "Musanze Bus Park",
    province: "Northern Province",
    lat: -1.4994,
    lng: 29.634,
    created_at: "2025-01-02T08:00:00Z",
    updated_at: "2025-01-02T08:00:00Z",
  },
  {
    id: "loc_003",
    name: "Huye Bus Terminal",
    province: "Southern Province",
    lat: -2.5967,
    lng: 29.7394,
    created_at: "2025-01-03T08:00:00Z",
    updated_at: "2025-01-03T08:00:00Z",
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // GET /locations — paginated list
  http.get(`${baseUrl}/locations`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";

    const filtered = q
      ? seedLocations.filter(
          (loc) =>
            loc.name.toLowerCase().includes(q) ||
            loc.province.toLowerCase().includes(q),
        )
      : seedLocations;

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json(
      { data, total: filtered.length, page, limit },
      { status: 200 },
    );
  }),

  // GET /locations/:id — single location
  http.get(`${baseUrl}/locations/:id`, ({ params }) => {
    const found =
      seedLocations.find((loc) => loc.id === params.id) ?? seedLocations[0];
    return HttpResponse.json(found, { status: 200 });
  }),

  // POST /locations — create location
  http.post(`${baseUrl}/locations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newLocation: Location = {
      ...(body as Omit<Location, "id" | "created_at">),
      id: `loc_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newLocation, { status: 201 });
  }),

  // PATCH /locations/:id — update location
  http.patch(`${baseUrl}/locations/:id`, async ({ request, params }) => {
    const updates = (await request.json()) as Record<string, unknown>;
    const existing =
      seedLocations.find((loc) => loc.id === params.id) ?? seedLocations[0];
    const updated: Location = {
      ...existing,
      ...(updates as Partial<Location>),
      id: existing.id,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(updated, { status: 200 });
  }),

  // DELETE /locations/:id — delete location
  http.delete(`${baseUrl}/locations/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

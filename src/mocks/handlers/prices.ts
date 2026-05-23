import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
import type { Price } from "../../hooks/usePrices";

// ─── Seed Data ────────────────────────────────────────────────────────────────

let seedPrices: Price[] = [
  {
    id: "price_001",
    boarding_stop: { id: "loc_001", name: "Nyabugogo Terminal" },
    alighting_stop: { id: "loc_002", name: "Musanze Bus Park" },
    amount: 2000,
    currency: "RWF",
  },
  {
    id: "price_002",
    boarding_stop: { id: "loc_001", name: "Nyabugogo Terminal" },
    alighting_stop: { id: "loc_003", name: "Huye Bus Terminal" },
    amount: 3500,
    currency: "RWF",
  },
  {
    id: "price_003",
    boarding_stop: { id: "loc_002", name: "Musanze Bus Park" },
    alighting_stop: { id: "loc_003", name: "Huye Bus Terminal" },
    amount: 2500,
    currency: "RWF",
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // GET /prices — filtered list
  http.get(`${baseUrl}/prices`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
    const boardingId = url.searchParams.get("boarding_stop_id") ?? "";
    const alightingId = url.searchParams.get("alighting_stop_id") ?? "";

    let filtered = seedPrices;
    if (boardingId) filtered = filtered.filter((p) => p.boarding_stop.id === boardingId);
    if (alightingId) filtered = filtered.filter((p) => p.alighting_stop.id === alightingId);

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({ data, total: filtered.length, page, limit }, { status: 200 });
  }),

  // PUT /prices — upsert
  http.put(`${baseUrl}/prices`, async ({ request }) => {
    const body = (await request.json()) as {
      boarding_stop_id: string;
      alighting_stop_id: string;
      amount: number;
      currency: string;
    };

    const existing = seedPrices.find(
      (p) =>
        p.boarding_stop.id === body.boarding_stop_id &&
        p.alighting_stop.id === body.alighting_stop_id
    );

    if (existing) {
      existing.amount = body.amount;
      existing.currency = body.currency;
      return HttpResponse.json(existing, { status: 200 });
    }

    const newPrice: Price = {
      id: `price_${Date.now()}`,
      boarding_stop: { id: body.boarding_stop_id, name: body.boarding_stop_id },
      alighting_stop: { id: body.alighting_stop_id, name: body.alighting_stop_id },
      amount: body.amount,
      currency: body.currency,
    };
    seedPrices.push(newPrice);
    return HttpResponse.json(newPrice, { status: 200 });
  }),

  // DELETE /prices/:id
  http.delete(`${baseUrl}/prices/:id`, ({ params }) => {
    seedPrices = seedPrices.filter((p) => p.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";

export const handlers = [
  // Organizations
  // Intercept "GET /organizations/{orgId}" requests...
  http.get(`${baseUrl}/organizations/:orgId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.orgId === "org_001")
      return HttpResponse.json(
        {
          id: "org_001",
          name: "RITCO",
          org_type: "transport",
          status: "active",
          address: "Nyabugogo Terminal, Kigali",
          contact_email: "info@ritco.rw",
          contact_phone: "+250788999999",
          registration_date: "2025-11-01T10:00:00Z",
          branches: [
            "Kigali - Nyabugogo",
            "Kigali - Remera",
            "Musanze",
            "Rubavu",
          ],
          description: "We are an awesome transport company",
          created_at: "2025-11-01T10:00:00Z",
          updated_at: "2025-11-01T10:00:00Z",
        },
        { status: 200 },
      );
    else
      return HttpResponse.json(
        {
          id: "org_002",
          name: "Volcano Express",
          org_type: "transport",
          status: "active",
          address: "Nyabugogo Terminal, Kigali",
          contact_email: "info@volcanoexpress.rw",
          contact_phone: "+250788999999",
          registration_date: "2025-11-01T10:00:00Z",
          branches: [
            "Kigali - Nyabugogo",
            "Kigali - Remera",
            "Musanze",
            "Rubavu",
          ],
          description: "We are an awesome transport company",
          created_at: "2025-11-01T10:00:00Z",
          updated_at: "2025-11-01T10:00:00Z",
        },
        { status: 200 },
      );
  }),

  // Intercept "GET /organizations" requests...
  http.get(`${baseUrl}/organizations`, () => {
    return HttpResponse.json(
      [
        {
          id: "org_001",
          name: "RITCO",
          org_type: "transport",
          status: "active",
          address: "Nyabugogo Terminal, Kigali",
          contact_email: "info@ritco.rw",
          contact_phone: "+250788999999",
          registration_date: "2025-11-01T10:00:00Z",
          branches: [
            "Kigali - Nyabugogo",
            "Kigali - Remera",
            "Musanze",
            "Rubavu",
          ],
          description: "We are an awesome transport company",
          created_at: "2025-11-01T10:00:00Z",
          updated_at: "2025-11-01T10:00:00Z",
        },
        {
          id: "org_002",
          name: "Volcano Express",
          org_type: "transport",
          status: "pending",
          address: "Nyabugogo Terminal, Kigali",
          contact_email: "info@volcanoexpress.rw",
          contact_phone: "+250788999999",
          registration_date: "2025-11-01T10:00:00Z",
          branches: [
            "Kigali - Nyabugogo",
            "Kigali - Remera",
            "Musanze",
            "Rubavu",
          ],
          description: "We are an awesome transport company",
          created_at: "2025-11-01T10:00:00Z",
          updated_at: "2025-11-01T10:00:00Z",
        },
      ],
      { status: 200 },
    );
  }),

  // Intercept "POST /organizations" requests...
  http.post(`${baseUrl}/organizations`, async ({ request }) => {
    const newOrg = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        ...newOrg,
        id: `org_${Date.now()}`,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // Intercept "PUT /organizations/{orgId}" requests...
  http.put(`${baseUrl}/organizations/:orgId`, async ({ request, params }) => {
    const updates = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        ...updates,
        id: params.orgId,
        updated_at: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // Intercept "DELETE /organizations/{orgId}" requests...
  http.delete(`${baseUrl}/organizations/:orgId`, () => {
    return HttpResponse.json(
      { message: "Organization deleted successfully" },
      { status: 200 },
    );
  }),

  // Intercept "POST /organizations/{orgId}/approve" requests...
  http.post(`${baseUrl}/organizations/:orgId/approve`, ({ params }) => {
    return HttpResponse.json(
      {
        id: params.orgId,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),
];

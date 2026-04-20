import { http, HttpResponse } from "msw";
import { Agent } from "../../hooks/useAgent";
import { baseUrl } from "../../services/apiClient";

// ─── MockUser (Tasks 2.1–2.4) ────────────────────────────────────────────────

export interface MockUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar_path: string | null;
  user_type: "staff" | "passenger";
  status: "active" | "suspended" | "pending_verification";
  roles: string[];
  org_id: string | null;
  last_login_at: string | null;
  created_at: string;
}

let mockUsers: MockUser[] = [
  {
    id: "usr_001",
    first_name: "Alice",
    last_name: "Kamau",
    email: "alice.kamau@example.com",
    phone_number: "0712345678",
    avatar_path: "avatars/alice.jpg",
    user_type: "staff",
    status: "active",
    roles: ["org-admin", "dispatcher"],
    org_id: "org_001",
    last_login_at: "2025-06-10T08:30:00Z",
    created_at: "2024-01-15T09:00:00Z",
  },
  {
    id: "usr_002",
    first_name: "Brian",
    last_name: "Otieno",
    email: "brian.otieno@example.com",
    phone_number: "0723456789",
    avatar_path: null,
    user_type: "staff",
    status: "suspended",
    roles: ["driver"],
    org_id: "org_001",
    last_login_at: "2025-05-20T14:00:00Z",
    created_at: "2024-03-10T11:00:00Z",
  },
  {
    id: "usr_003",
    first_name: "Carol",
    last_name: "Wanjiku",
    email: "carol.wanjiku@example.com",
    phone_number: "0734567890",
    avatar_path: "avatars/carol.jpg",
    user_type: "passenger",
    status: "active",
    roles: ["passenger"],
    org_id: null,
    last_login_at: "2025-06-12T10:15:00Z",
    created_at: "2024-05-01T07:30:00Z",
  },
  {
    id: "usr_004",
    first_name: "David",
    last_name: "Mwangi",
    email: "david.mwangi@example.com",
    phone_number: "0745678901",
    avatar_path: null,
    user_type: "passenger",
    status: "pending_verification",
    roles: ["passenger"],
    org_id: null,
    last_login_at: null,
    created_at: "2025-06-13T16:45:00Z",
  },
  {
    id: "usr_005",
    first_name: "Esther",
    last_name: "Njeri",
    email: "esther.njeri@example.com",
    phone_number: "0756789012",
    avatar_path: "avatars/esther.jpg",
    user_type: "staff",
    status: "pending_verification",
    roles: ["dispatcher"],
    org_id: "org_002",
    last_login_at: null,
    created_at: "2025-06-14T08:00:00Z",
  },
  {
    id: "usr_006",
    first_name: "Felix",
    last_name: "Odhiambo",
    email: "felix.odhiambo@example.com",
    phone_number: "0767890123",
    avatar_path: null,
    user_type: "staff",
    status: "active",
    roles: ["driver"],
    org_id: "org_002",
    last_login_at: "2025-06-11T06:00:00Z",
    created_at: "2024-07-20T10:00:00Z",
  },
];

// ─── Legacy agents (Task 2.5) ─────────────────────────────────────────────────

let agents = [
  {
    userId: "user_op_101",
    firstName: "John doe",
    lastName: "User",
    email: "user@email.com",
    phoneNumber: "0789234556",
    role: "agent",
    status: "active",
    joinedDate: "2025-11-01T10:00:00Z",
  },
  {
    userId: "user_op_102",
    firstName: "John doenna",
    lastName: "Userria",
    email: "user@email.com",
    phoneNumber: "0789234556",
    role: "agent",
    status: "active",
    joinedDate: "2025-11-01T10:00:00Z",
  },
];

export const handlers = [
  // ── GET /users (Task 2.2) ──────────────────────────────────────────────────
  http.get(`${baseUrl}/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const statusFilter = url.searchParams.get("status");
    const userTypeFilter = url.searchParams.get("user_type");

    let filtered = mockUsers;
    if (statusFilter) {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }
    if (userTypeFilter) {
      filtered = filtered.filter((u) => u.user_type === userTypeFilter);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({ data, total, page, limit }, { status: 200 });
  }),

  // ── DELETE /users/:id (Task 2.3) ───────────────────────────────────────────
  http.delete(`${baseUrl}/users/:id`, ({ params }) => {
    const index = mockUsers.findIndex((u) => u.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: "User not found" }, { status: 404 });
    }
    mockUsers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── PATCH /users/:id (Task 2.4) ────────────────────────────────────────────
  http.patch(`${baseUrl}/users/:id`, async ({ params, request }) => {
    const index = mockUsers.findIndex((u) => u.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: "User not found" }, { status: 404 });
    }
    const body = await request.json() as Partial<MockUser>;
    mockUsers[index] = { ...mockUsers[index], ...body };
    return HttpResponse.json(mockUsers[index], { status: 200 });
  }),

  // ── Legacy: GET /organizations/:orgId/agents (Task 2.5) ───────────────────
  http.get(`${baseUrl}/organizations/:orgId/agents`, () => {
    return HttpResponse.json(agents, { status: 200 });
  }),

  // ── Legacy: GET /organizations/:orgId/agents/:userId (Task 2.5) ───────────
  http.get(`${baseUrl}/organizations/:orgId/agents/:userId`, ({ params }) => {
    if (params.userId && params.orgId)
      return HttpResponse.json(
        agents.filter((agent) => agent.userId === params.userId)[0],
        { status: 200 },
      );
  }),

  // ── Legacy: PUT /organizations/:orgId/agents/:userId (Task 2.5) ───────────
  http.put<{ userId: string; orgId: string }, Agent>(
    `${baseUrl}/organizations/:orgId/agents/:userId`,
    async ({ params, request }) => {
      if (params.userId && params.orgId) {
        const updatedAgent = await request.json();
        const index = agents.findIndex(
          (agent) => agent.userId === params.userId,
        );
        if (index !== -1) {
          agents[index] = {
            ...agents[index],
            ...updatedAgent,
          };
          return HttpResponse.json(agents[index], { status: 200 });
        } else {
          return HttpResponse.json(agents[index], { status: 404 });
        }
      }
      return HttpResponse.json({ message: "Invalid request" }, { status: 400 });
    },
  ),

  // ── Legacy: DELETE /organizations/:orgId/agents/:userId (Task 2.5) ────────
  http.delete(
    `${baseUrl}/organizations/:orgId/agents/:userId`,
    ({ params }) => {
      if (params.userId && params.orgId) {
        agents = agents.filter((agent) => agent.userId !== params.userId);
        return HttpResponse.json(agents, { status: 204 });
      }
    },
  ),

  // ── Legacy: POST /organizations/:orgId/agents (Task 2.5) ──────────────────
  http.post<never, Agent>(
    `${baseUrl}/organizations/:orgId/agents`,
    async ({ request }) => {
      const newAgent = await request.json();
      const newId = crypto.randomUUID();
      newAgent.userId = newId;
      newAgent.status = "notActive";
      agents.push(newAgent);
      return HttpResponse.json(newAgent, { status: 201 });
    },
  ),
];

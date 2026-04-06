import { http, HttpResponse } from "msw";
import { LoginDetails, LoginResponse, LoginUser } from "../../hooks/useLogin";
import {
  OrganizationRegistrationPayload,
  OrganizationResponse,
} from "../../hooks/useRegister";
import {
  AdminActivationPayload,
  AdminActivationResponse,
} from "../../hooks/useActivateOrganization";
import { Role, LegacyUser, StaffUser } from "../../hooks/useUser";
import { baseUrl } from "./utils";

interface AuthErrorResponse {
  error: "INVALID_CREDENTIALS" | "USER_NOT_FOUND";
  message: string;
}

const allUsers = new Map<string, any>([
  [
    "user_auth_456",
    {
      firstName: "Alicia",
      lastName: "Kunda",
      email: "user@example.com",
      password: "12345678Aa!",
      userType: "operator",
      role: "admin",
      branch: "main",
      companyId: "comp_001",
    },
  ],
]);

const organizations = new Map<string, OrganizationResponse>();
const activationTokens = new Map<string, string>();

function findUserByCredentials(identifier: string, password: string) {
  for (const [id, user] of allUsers.entries()) {
    if (
      (user.email === identifier || user.phone === identifier) &&
      user.password === password
    ) {
      return { id, ...user };
    }
  }
  return null;
}

type ActivationErrorResponse = {
  error: "INVALID_CREDENTIALS" | "USER_NOT_FOUND";
  message: string;
};

export const handlers = [
  // Organization registration
  http.post<never, OrganizationRegistrationPayload, OrganizationResponse>(
    `${baseUrl}/api/v1/organizations`,
    async ({ request }) => {
      const newOrg = await request.json();
      const orgId = crypto.randomUUID();
      const slug = newOrg.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const createdAt = new Date().toISOString();

      const createdOrg: OrganizationResponse = {
        id: orgId,
        name: newOrg.name,
        slug,
        org_type: newOrg.org_type,
        status: "pending",
        contact_email: newOrg.contact_email,
        contact_phone: newOrg.contact_phone,
        parent_org_id: newOrg.parent_org_id || null,
        created_at: createdAt,
        logo_url: newOrg.logo_url,
      };

      organizations.set(orgId, createdOrg);

      const token = crypto.randomUUID();
      activationTokens.set(token, orgId);

      return HttpResponse.json(createdOrg, { status: 201 });
    },
  ),

  // Organization admin activation
  http.post<
    never,
    AdminActivationPayload,
    AdminActivationResponse | ActivationErrorResponse
  >(`${baseUrl}/api/v1/organizations/activate`, async ({ request }) => {
    const payload = await request.json();
    const orgId = activationTokens.get(payload.token);
    if (!orgId) {
      return HttpResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Invalid activation token.",
        } as ActivationErrorResponse,
        { status: 401 },
      );
    }

    const userId = crypto.randomUUID();
    allUsers.set(userId, {
      firstName: payload.first_name || "Admin",
      lastName: payload.last_name || "User",
      email: payload.email,
      password: payload.password,
      userType: "operator",
      role: "admin",
      branch: "main",
      companyId: orgId,
    });

    return HttpResponse.json(
      {
        id: userId,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        organization_id: orgId,
      } as AdminActivationResponse,
      { status: 200 },
    );
  }),

  // Login
  http.post<never, LoginDetails, LoginResponse | AuthErrorResponse>(
    `${baseUrl}/auth/login`,
    async ({ request }) => {
      const { identifier, password } = await request.json();
      const result = findUserByCredentials(identifier, password);
      if (!result) {
        return HttpResponse.json(
          {
            error: "INVALID_CREDENTIALS",
            message: "Incorrect credentials.",
          },
          { status: 401 },
        );
      }

      const user: LoginUser = {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        userType: result.userType,
        companyId: result.companyId,
        role: result.role as Role,
        branch: result.branch,
      };

      return HttpResponse.json(
        { user },
        {
          status: 200,
          headers: {
            "Set-Cookie":
              "access_token=fake-jwt; HttpOnly; Secure; SameSite=Strict; Path=/;",
          },
        },
      );
    },
  ),

  // GET current user profile
  http.get<never, StaffUser>(`${baseUrl}/api/v1/users/me`, () => {
    const firstUser = Array.from(allUsers.values())[0] as any;
    if (!firstUser) {
      return HttpResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const user: StaffUser = {
      id: "user_auth_456",
      first_name: firstUser.firstName,
      last_name: firstUser.lastName,
      phone_number: firstUser.phone || null,
      email: firstUser.email,
      avatar_url: null,
      user_type: "staff",
      status: "active",
      org_id: firstUser.companyId,
      roles: [firstUser.role],
      permissions: [
        { action: "manage", subject: "all" }, // Admin permissions
      ],
      driver_license_number: null,
      driver_license_verified_at: null,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(user, { status: 200 });
  }),

  // Upload presigned URL
  http.post<
    never,
    { file_name: string; content_type: string },
    { uploadUrl: string; fileUrl: string }
  >(`${baseUrl}/api/v1/uploads/presigned-url`, async ({ request }) => {
    const requestData = await request.json();
    const filePath = `uploads/${crypto.randomUUID()}-${requestData.file_name}`;
    const uploadUrl = `${baseUrl}/uploads/${filePath}`;
    const fileUrl = `${baseUrl}/${filePath}`;
    return HttpResponse.json({ uploadUrl, fileUrl }, { status: 200 });
  }),

  // PUT upload location (optional, for transport simulation)
  http.put(`${baseUrl}/uploads/:filePath`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // Logout endpoint for cookie-based auth
  http.post(`${baseUrl}/auth/logout`, () => {
    return HttpResponse.json(
      {
        status: "Logged out.",
        message: "You have been successfully logged out.",
      },
      { status: 200 },
    );
  }),
];

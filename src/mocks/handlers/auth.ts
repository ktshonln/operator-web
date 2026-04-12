import { http, HttpResponse } from "msw";
import {
  LoginDetails,
  LoginResponse,
  Login2FAResponse,
  AuthUser,
} from "../../hooks/useLogin";
import {
  OrganizationRegistrationPayload,
  OrganizationResponse,
} from "../../hooks/useRegister";
import {
  AdminActivationPayload,
  AdminActivationResponse,
} from "../../hooks/useActivateOrganization";
import { StaffUser } from "../../hooks/useUser";
import { baseUrl } from "../../services/apiClient";
import { Verify2FAPayload } from "../../services/authService";
import { VerifyLoginPayload } from "../../hooks/useVerifyLogin";

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
      twoFactorEnabled: false,
    },
  ],
]);

const organizations = new Map<string, OrganizationResponse>();
const activationTokens = new Map<string, string>();
const organizationApplicationOtps = new Map<string, string>();

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
        logo_path: newOrg.logo_path,
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

  // Get current user's organization
  http.get(`${baseUrl}/organizations/me`, () => {
    // Mock: return the first organization or create a default one
    const firstOrg = Array.from(organizations.values())[0];
    if (firstOrg) {
      return HttpResponse.json(firstOrg, { status: 200 });
    }

    // Create a default organization if none exists
    const defaultOrg: OrganizationResponse = {
      id: "org_default",
      name: "Default Organization",
      slug: "default-org",
      org_type: "company",
      status: "active",
      contact_email: "admin@default.com",
      contact_phone: "+250780000001",
      parent_org_id: null,
      created_at: new Date().toISOString(),
      logo_path: "",
    };

    return HttpResponse.json(defaultOrg, { status: 200 });
  }),

  // Get all organizations (admin only)
  http.get(`${baseUrl}/organizations`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as any;
    const org_type = url.searchParams.get("org_type") as any;

    let orgs = Array.from(organizations.values());

    if (status) {
      orgs = orgs.filter((org) => org.status === status);
    }
    if (org_type) {
      orgs = orgs.filter((org) => org.org_type === org_type);
    }

    return HttpResponse.json(orgs, { status: 200 });
  }),

  // Get organization by ID
  http.get(`${baseUrl}/organizations/:id`, ({ params }) => {
    const id = String(params.id);
    const org = organizations.get(id);

    if (!org) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "Organization not found" } },
        { status: 404 },
      );
    }

    return HttpResponse.json(org, { status: 200 });
  }),

  // Update organization
  http.patch(`${baseUrl}/organizations/:id`, async ({ params, request }) => {
    const id = String(params.id);
    const updates = (await request.json()) as Record<string, unknown>;

    const org = organizations.get(id);
    if (!org) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "Organization not found" } },
        { status: 404 },
      );
    }

    const updatedOrg = {
      ...org,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    organizations.set(id, updatedOrg as OrganizationResponse);

    return HttpResponse.json(updatedOrg, { status: 200 });
  }),

  // Delete organization
  http.delete(`${baseUrl}/organizations/:id`, ({ params }) => {
    const id = String(params.id);
    const org = organizations.get(id);

    if (!org) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "Organization not found" } },
        { status: 404 },
      );
    }

    organizations.delete(id);
    return HttpResponse.json(
      { message: "Organization deleted" },
      { status: 204 },
    );
  }),

  // Approve/reject organization
  http.post(
    `${baseUrl}/organizations/:id/approve`,
    async ({ params, request }) => {
      const id = String(params.id);
      const body = (await request.json()) as Record<string, unknown>;
      const action = String(body.action ?? "");

      const org = organizations.get(id);
      if (!org) {
        return HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Organization not found" } },
          { status: 404 },
        );
      }

      if (action === "approve") {
        org.status = "active";
      } else if (action === "reject") {
        org.status = "suspended";
      }

      org.updated_at = new Date().toISOString();

      return HttpResponse.json(
        {
          message: `Organization ${action}d successfully`,
          organization: org,
        },
        { status: 200 },
      );
    },
  ),

  // Login
  http.post<never, LoginDetails, LoginResponse | Login2FAResponse>(
    `${baseUrl}/auth/login`,
    async ({ request }) => {
      const { identifier, password } = await request.json();
      const result = findUserByCredentials(identifier, password);
      if (!result) {
        return HttpResponse.json(
          {
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Incorrect credentials.",
            },
          } as any,
          { status: 401 },
        );
      }

      const requires2FA = Boolean(result.twoFactorEnabled);
      if (requires2FA) {
        return HttpResponse.json(
          {
            requires_2fa: true,
            user_id: result.id,
            expires_in: 60,
          },
          { status: 200 },
        );
      }

      const user: AuthUser = {
        id: result.id,
        first_name: result.firstName,
        last_name: result.lastName,
        user_type: "staff",
        avatar_path: null,
        org_id: result.companyId,
        roles: [result.role],
        status: "active",
        two_factor_enabled: false,
        permissions: [{ action: "manage", subject: "all", conditions: null }],
      };

      return HttpResponse.json(
        {
          user,
          tokens: {
            access_token: "fake-jwt-access-token-ttl-15min",
            refresh_token: "fake-jwt-refresh-token-ttl-long",
          },
        },
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

  // Resend OTP for 2FA or recovery flows
  http.post<
    never,
    { user_id?: string; phone_number?: string },
    { message: string }
  >(`${baseUrl}/auth/resend-otp`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const userId = body.user_id ? String(body.user_id) : undefined;
    const phoneNumber = body.phone_number
      ? String(body.phone_number)
      : undefined;

    let userData = null;
    if (userId) {
      userData = allUsers.get(userId);
    } else if (phoneNumber) {
      for (const user of allUsers.values()) {
        if (user.phone === phoneNumber || user.email === phoneNumber) {
          userData = user;
          break;
        }
      }
    }

    if (!userData) {
      return HttpResponse.json(
        {
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        } as any,
        { status: 404 },
      );
    }

    return HttpResponse.json(
      { message: "OTP resent successfully" },
      { status: 200 },
    );
  }),

  // Verify 2FA OTP
  http.post<never, Verify2FAPayload>(
    `${baseUrl}/auth/verify-2fa`,
    async ({ request }) => {
      const { user_id, otp } = await request.json();

      // Validate OTP (mock: accept "123456")
      if (otp !== "123456") {
        return HttpResponse.json(
          {
            error: {
              code: "OTP_INVALID",
              message: "The OTP you entered is invalid",
            },
          } as any,
          { status: 400 },
        );
      }

      // Mock user lookup by ID
      let user: AuthUser | null = null;
      for (const [id, userData] of allUsers.entries()) {
        if (id === user_id) {
          user = {
            id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_type: "staff",
            avatar_path: null,
            org_id: userData.companyId,
            roles: [userData.role],
            status: "active",
            two_factor_enabled: true,
            permissions: [
              { action: "manage", subject: "all", conditions: null },
            ],
          };
          break;
        }
      }

      if (!user) {
        return HttpResponse.json(
          {
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          } as any,
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          user,
          tokens: {
            access_token: "fake-jwt-access-token-ttl-15min",
            refresh_token: "fake-jwt-refresh-token-ttl-long",
          },
        },
        { status: 200 },
      );
    },
  ),

  // Verify account (for pending verification accounts)
  http.post<never, VerifyLoginPayload>(
    `${baseUrl}/auth/verify-login`,
    async ({ request }) => {
      const { user_id, otp } = await request.json();

      // Validate OTP (mock: accept "123456")
      if (otp !== "123456") {
        return HttpResponse.json(
          {
            error: {
              code: "OTP_INVALID",
              message: "The OTP you entered is invalid",
            },
          } as any,
          { status: 400 },
        );
      }

      // Mock user lookup by ID
      let user: AuthUser | null = null;
      for (const [id, userData] of allUsers.entries()) {
        if (id === user_id) {
          user = {
            id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_type: "staff",
            avatar_path: null,
            org_id: userData.companyId,
            roles: [userData.role],
            status: "active",
            two_factor_enabled: false,
            permissions: [
              { action: "manage", subject: "all", conditions: null },
            ],
          };
          break;
        }
      }

      if (!user) {
        return HttpResponse.json(
          {
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          } as any,
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          user,
          tokens: {
            access_token: "fake-jwt-access-token-ttl-15min",
            refresh_token: "fake-jwt-refresh-token-ttl-long",
          },
        },
        { status: 200 },
      );
    },
  ),

  // Refresh token
  http.post(`${baseUrl}/auth/refresh`, () => {
    const firstUser = Array.from(allUsers.values())[0] as any;
    if (!firstUser) {
      return HttpResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
          },
        } as any,
        { status: 401 },
      );
    }

    const user: AuthUser = {
      id: "user_auth_456",
      first_name: firstUser.firstName,
      last_name: firstUser.lastName,
      user_type: "staff",
      avatar_path: null,
      org_id: firstUser.companyId,
      roles: [firstUser.role],
      status: "active",
      two_factor_enabled: false,
      permissions: [{ action: "manage", subject: "all", conditions: null }],
    };

    return HttpResponse.json(
      {
        user,
        tokens: {
          access_token: "fake-jwt-access-token-ttl-15min-refreshed",
          refresh_token: "fake-jwt-refresh-token-ttl-long-refreshed",
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie":
            "access_token=fake-jwt-refreshed; HttpOnly; Secure; SameSite=Strict; Path=/;",
        },
      },
    );
  }),

  // Forgot password - sends OTP
  http.post<never, { identifier: string }>(
    `${baseUrl}/auth/forgot-password`,
    async ({ request }) => {
      const { identifier: _identifier } = await request.json();

      // Always return 204 to prevent user enumeration, as per spec
      return HttpResponse.json(
        {
          message: "If an account exists, a verification code has been sent",
          expires_in: 300,
        },
        { status: 204 },
      );
    },
  ),

  // Reset password - verifies OTP and sets new password
  http.post<never, { identifier: string; otp: string; new_password: string }>(
    `${baseUrl}/auth/reset-password`,
    async ({ request }) => {
      const { identifier, otp, new_password } = await request.json();

      // Validate OTP (mock: accept "123456")
      if (otp !== "123456") {
        return HttpResponse.json(
          {
            error: {
              code: "OTP_INVALID",
              message: "The verification code you entered is invalid",
            },
          } as any,
          { status: 400 },
        );
      }

      // Validate password strength (mock validation)
      if (new_password.length < 8) {
        return HttpResponse.json(
          {
            error: {
              code: "PASSWORD_TOO_WEAK",
              message: "Password must be at least 8 characters long",
            },
          } as any,
          { status: 400 },
        );
      }

      // Find user and update password
      let updated = false;
      for (const [, user] of allUsers.entries()) {
        if (user.email === identifier || user.phone === identifier) {
          user.password = new_password;
          updated = true;
          break;
        }
      }

      if (!updated) {
        return HttpResponse.json(
          {
            error: {
              code: "USER_NOT_FOUND",
              message: "No account found with this email or phone number",
            },
          } as any,
          { status: 404 },
        );
      }

      return HttpResponse.json(
        { message: "Password reset successfully" },
        { status: 204 },
      );
    },
  ),

  // PUBLIC: Organization registration (creates pending organization)
  http.post<never, OrganizationRegistrationPayload, OrganizationResponse>(
    `${baseUrl}/organizations`,
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
        status: "pending", // Public registration always creates pending
        contact_email: newOrg.contact_email,
        contact_phone: newOrg.contact_phone,
        parent_org_id: newOrg.parent_org_id || null,
        created_at: createdAt,
        logo_path: newOrg.logo_path,
      };

      organizations.set(orgId, createdOrg);

      const token = crypto.randomUUID();
      activationTokens.set(token, orgId);

      return HttpResponse.json(createdOrg, { status: 201 });
    },
  ),

  // PUBLIC: Organization applications (self-service registration)
  http.post<never, OrganizationRegistrationPayload, OrganizationResponse>(
    `${baseUrl}/organization-applications`,
    async ({ request }) => {
      const newApp = await request.json();
      const orgId = crypto.randomUUID();
      const slug = newApp.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const createdAt = new Date().toISOString();

      const createdOrg: OrganizationResponse = {
        id: orgId,
        name: newApp.name,
        slug,
        org_type: newApp.org_type,
        status: "pending",
        contact_email: newApp.contact_email,
        contact_phone: newApp.contact_phone,
        parent_org_id: newApp.parent_org_id || null,
        created_at: createdAt,
        logo_path: newApp.logo_path,
      };

      organizations.set(orgId, createdOrg);
      organizationApplicationOtps.set(orgId, "123456");

      return HttpResponse.json(createdOrg, { status: 201 });
    },
  ),

  // PUBLIC: Get presigned URLs for application documents
  http.get(
    `${baseUrl}/organizations/apply/documents/presigned-url`,
    ({ request }) => {
      const url = new URL(request.url, "http://localhost");
      const docType = url.searchParams.get("doc_type");
      const contentType = url.searchParams.get("content_type");

      if (!docType || !contentType) {
        return HttpResponse.json(
          {
            error: {
              code: "INVALID_PARAMETERS",
              message: "doc_type and content_type are required.",
            },
          },
          { status: 400 },
        );
      }

      const key = `org-app-docs/pending/${docType}/${crypto.randomUUID()}`;
      const uploadUrl = `${baseUrl}/uploads/${key}`;
      const path = key;

      return HttpResponse.json(
        { upload_url: uploadUrl, key, path },
        { status: 200 },
      );
    },
  ),

  // PUBLIC: Submit organization application
  http.post(`${baseUrl}/organizations/apply`, async ({ request }) => {
    const newApp = (await request.json()) as any;
    const orgId = crypto.randomUUID();
    const slug = newApp.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const createdAt = new Date().toISOString();

    const createdOrg: OrganizationResponse = {
      id: orgId,
      name: newApp.name,
      slug,
      org_type: newApp.org_type,
      status: "pending",
      contact_email: newApp.contact_email,
      contact_phone: newApp.contact_phone,
      parent_org_id: newApp.parent_org_id || null,
      created_at: createdAt,
      logo_path: newApp.logo_path,
    };

    organizations.set(orgId, createdOrg);
    organizationApplicationOtps.set(orgId, "123456");

    return HttpResponse.json(
      {
        org_id: orgId,
        message:
          "Application received. Please check your email for a verification code.",
      },
      { status: 202 },
    );
  }),

  // PUBLIC: Verify organization contact email
  http.post(`${baseUrl}/organizations/verify-contact`, async ({ request }) => {
    const payload = (await request.json()) as any;
    const expectedOtp = organizationApplicationOtps.get(payload.org_id);

    if (!expectedOtp || payload.otp !== expectedOtp) {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_OTP",
            message: "Invalid OTP.",
          },
        },
        { status: 400 },
      );
    }

    const organization = organizations.get(payload.org_id);
    if (!organization) {
      return HttpResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Organization not found.",
          },
        },
        { status: 404 },
      );
    }

    (organization as any).contact_email_verified_at = new Date().toISOString();
    organizationApplicationOtps.delete(payload.org_id);

    return HttpResponse.json({}, { status: 204 });
  }),

  // PUBLIC: Resend organization application OTP
  http.post<never, { org_id: string }, any>(
    `${baseUrl}/organizations/resend-otp`,
    async ({ request }) => {
      const payload = (await request.json()) as any;
      const orgId = payload.org_id;
      const organization = organizations.get(orgId);

      if (!organization) {
        return HttpResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Organization not found.",
            },
          },
          { status: 404 },
        );
      }

      organizationApplicationOtps.set(orgId, "123456");

      return HttpResponse.json(
        {
          message: "Verification code resent successfully.",
        },
        { status: 200 },
      );
    },
  ),

  // ADMIN: Create organization
  http.post<
    never,
    Omit<OrganizationResponse, "id" | "created_at" | "slug">,
    OrganizationResponse
  >(`${baseUrl}/organizations`, async ({ request }) => {
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
      status: newOrg.status || "active", // Admin creation defaults to active
      contact_email: newOrg.contact_email,
      contact_phone: newOrg.contact_phone,
      parent_org_id: newOrg.parent_org_id || null,
      created_at: createdAt,
      logo_path: newOrg.logo_path,
    };

    organizations.set(orgId, createdOrg);

    return HttpResponse.json(createdOrg, { status: 201 });
  }),

  // Media uploads: User avatar presigned URL
  http.get(`${baseUrl}/users/me/avatar/presigned-url`, ({ request }) => {
    const url = new URL(request.url, "http://localhost");
    const contentType = url.searchParams.get("content_type");

    if (
      !contentType ||
      !["image/jpeg", "image/png", "image/webp"].includes(contentType)
    ) {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_CONTENT_TYPE",
            message:
              "Content type must be image/jpeg, image/png, or image/webp",
          },
        },
        { status: 400 },
      );
    }

    const userId = "user_auth_456"; // Mock current user
    const path = `avatars/${userId}/${crypto.randomUUID()}.jpg`;
    const uploadUrl = `${baseUrl}/uploads/${path}`;

    return HttpResponse.json({ upload_url: uploadUrl, path }, { status: 200 });
  }),

  // Media uploads: Org logo presigned URL (by ID)
  http.get(
    `${baseUrl}/organizations/:id/logo/presigned-url`,
    ({ request, params }) => {
      const url = new URL(request.url, "http://localhost");
      const contentType = url.searchParams.get("content_type");
      const orgId = params.id as string;

      if (
        !contentType ||
        !["image/jpeg", "image/png", "image/webp"].includes(contentType)
      ) {
        return HttpResponse.json(
          {
            error: {
              code: "INVALID_CONTENT_TYPE",
              message:
                "Content type must be image/jpeg, image/png, or image/webp",
            },
          },
          { status: 400 },
        );
      }

      const organization = organizations.get(orgId);
      if (!organization) {
        return HttpResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Organization not found",
            },
          },
          { status: 404 },
        );
      }

      const path = `logos/${orgId}/${crypto.randomUUID()}.jpg`;
      const uploadUrl = `${baseUrl}/uploads/${path}`;

      return HttpResponse.json(
        { upload_url: uploadUrl, path },
        { status: 200 },
      );
    },
  ),

  // Media uploads: My org logo presigned URL
  http.get(`${baseUrl}/organizations/me/logo/presigned-url`, ({ request }) => {
    const url = new URL(request.url, "http://localhost");
    const contentType = url.searchParams.get("content_type");

    if (
      !contentType ||
      !["image/jpeg", "image/png", "image/webp"].includes(contentType)
    ) {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_CONTENT_TYPE",
            message:
              "Content type must be image/jpeg, image/png, or image/webp",
          },
        },
        { status: 400 },
      );
    }

    // Mock current user's org
    const orgId = "org_123";
    const path = `logos/${orgId}/${crypto.randomUUID()}.jpg`;
    const uploadUrl = `${baseUrl}/uploads/${path}`;

    return HttpResponse.json({ upload_url: uploadUrl, path }, { status: 200 });
  }),
];

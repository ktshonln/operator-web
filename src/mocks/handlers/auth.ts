import { http, HttpResponse } from "msw";
import { loginResponse } from "../../hooks/useLogin";
import { User } from "../../hooks/useRegister";
import { LoggedInUser, Role } from "../../hooks/useUser";
import { baseUrl, generateFakeJWT } from "./utils";

export type AuthErrorResponse = InvalidCredentialsError | UserNotFoundError;

interface InvalidCredentialsError {
  error: "INVALID_CREDENTIALS";
  message: string;
}

interface UserNotFoundError {
  error: "USER_NOT_FOUND";
  message: string;
}

const allUsers = new Map();
allUsers.set("user_auth_456", {
  firstName: "Alicia",
  lastName: "Kunda",
  email: "user@example.com",
  password: "12345678Aa!",
  userType: "operator",
  role: 'admin',
  branch: 'main',
  companyId: "comp_001",
  companyName: "RITCO",
  companyRegNo: "12345678",
  companyAddress: "Kigali KN234st",
  companyContact: "0788833423",
});
allUsers.set("user_auth_123", {
  firstName: "Loic",
  lastName: "Andy Karangwa",
  email: "agentuser@example.com",
  password: "12345678Aa!",
  userType: "operator",
  role: 'agent',
  branch: 'Kigali',
  companyId: 'comp_002',
  companyName: "Volcano Express",
  companyRegNo: "99311178",
  companyAddress: "Nyabugogo Terminal, Kigali",
  companyContact: "0792233418",
});

function findUserByCredentials(email: string, password: string) {
  for (const [id, user] of allUsers.entries()) {
    if (user.email === email && user.password === password) {
      return { id, ...user };
    }
  }
  return null; // No matching user found
}

export const handlers = [
  // Auth
  // Intercept "POST /users/auth/register" requests...
  http.post<never, User, loginResponse>(
    `${baseUrl}/users/auth/register`,
    async ({ request }) => {
      const newUser = await request.json();
      const userId = crypto.randomUUID();

      allUsers.set(userId, newUser);
      const tokenData: LoggedInUser = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
        role: newUser.role as Role,
        branch: newUser.branch,
        companyId: 'comp_001'
      };

      return HttpResponse.json(
        { userId: userId, token: generateFakeJWT(tokenData) },
        { status: 201 }
      );
    }
  ),
  // Intercept "POST /users/auth/login" requests...
  http.post<never, User, loginResponse | AuthErrorResponse>(
    `${baseUrl}/users/auth/login`,
    async ({ request }) => {
      const { email, password } = await request.json();
      const result = findUserByCredentials(email, password);

      if (!result) {
        const errorResponse: InvalidCredentialsError = {
          error: "INVALID_CREDENTIALS",
          message: "Incorrect email or password.",
        };

        return HttpResponse.json(errorResponse, { status: 401 });
      }
      const tokenData: LoggedInUser = {
        firstName: result.firstName,
        lastName: result.lastName,
        userType: result.userType,
        role: result.role,
        branch: result.branch,
        companyId: result.companyId
      };

      return HttpResponse.json(
        { userId: result.id, token: generateFakeJWT(tokenData) },
        { status: 200 }
      );
    }
  ),
  // Intercept "POST /users/auth/logout" requests...
  http.post<never>(`${baseUrl}/users/auth/logout`, async ({ request }) => {
    const token = await request.json();

    if (!token) {
      const errorResponse: InvalidCredentialsError = {
        error: "INVALID_CREDENTIALS",
        message: "Error logging out.",
      };

      return HttpResponse.json(errorResponse, { status: 401 });
    }

    return HttpResponse.json(
      {
        message: "You have been successfully logged out.",
        status: "Logged out.",
      },
      { status: 200 }
    );
  }),
];

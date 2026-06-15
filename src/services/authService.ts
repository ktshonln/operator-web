import { axiosInstance } from "./apiClient";

// Map raw API error codes to user-friendly messages
export function friendlyAuthError(error: any): string {
  const code = error?.response?.data?.error?.code ?? error?.response?.data?.code;
  const serverMessage = error?.response?.data?.error?.message ?? error?.response?.data?.message;

  switch (code) {
    case "VALIDATION_ERROR": return "Please check your input and try again.";
    case "INVALID_CREDENTIALS": return "Incorrect email/phone or password.";
    case "INVALID_OTP": return "The verification code is incorrect.";
    case "OTP_EXPIRED": return "The verification code has expired. Please request a new one.";
    case "USER_NOT_FOUND": return "No account found with these details.";
    case "PHONE_ALREADY_REGISTERED": return "This phone number is already registered.";
    case "EMAIL_ALREADY_REGISTERED": return "This email address is already registered.";
    case "ACCOUNT_SUSPENDED": return "Your account has been suspended. Please contact support.";
    case "RATE_LIMIT_EXCEEDED": return "Too many attempts. Please wait a few minutes and try again.";
    case "TOKEN_EXPIRED": return "This link has expired. Please request a new one.";
    case "INVALID_TOKEN": return "This link is invalid or has already been used.";
    case "NO_PENDING_RESET": return "No password reset was requested. Please start over.";
    case "PASSWORD_TOO_WEAK": return "Password is too weak. Use at least 8 characters with a mix of letters and numbers.";
    default:
      return serverMessage || error?.message || "Something went wrong. Please try again.";
  }
}

// Helper function to extract error message from axios error
const extractErrorMessage = (error: any): string => {
  return friendlyAuthError(error);
};

// Wrapper function for auth requests with proper error handling
const authRequest = async <T>(request: Promise<T>): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export interface LoginPayload {
  identifier: string; // phone or email
  password?: string;
  device_name?: string;
}

export interface Verify2FAPayload {
  user_id: string;
  otp: string;
  device_name?: string;
}

export interface VerifyLoginPayload {
  user_id: string;
  otp: string;
  channel: "phone" | "email";
  device_name?: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  password?: string;
  email?: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface ResendOtpPayload {
  user_id: string;
  channel: "phone" | "email";
}

export interface ResendOtp2FAPayload {
  user_id: string;
}

export interface ResetPasswordPayload {
  identifier: string;
  otp: string;
  new_password: string;
}

export default {
  verify2FA: (data: Verify2FAPayload) =>
    authRequest(
      axiosInstance.post("/auth/verify-2fa", data).then((res) => res.data),
    ),
  verifyLogin: (data: VerifyLoginPayload) =>
    authRequest(
      axiosInstance.post("/auth/verify-login", data).then((res) => res.data),
    ),
  refresh: () =>
    authRequest(
      axiosInstance.post("/auth/refresh", {}).then((res) => res.data),
    ),
  logout: () =>
    authRequest(axiosInstance.post("/auth/logout", {}).then((res) => res.data)),
  resendOtp: (data: ResendOtpPayload) =>
    authRequest(
      axiosInstance.post("/auth/resend-otp", data).then((res) => res.data),
    ),
  resendOtp2FA: (data: ResendOtp2FAPayload) =>
    authRequest(
      axiosInstance.post("/auth/resend-otp", data).then((res) => res.data),
    ),
  forgotPassword: (data: ForgotPasswordPayload) =>
    authRequest(
      axiosInstance.post("/auth/forgot-password", data).then((res) => res.data),
    ),
  resetPassword: (data: ResetPasswordPayload) =>
    authRequest(
      axiosInstance.post("/auth/reset-password", data).then((res) => res.data),
    ),
};

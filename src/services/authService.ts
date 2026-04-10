import { axiosInstance } from "./apiClient";

// Helper function to extract error message from axios error
const extractErrorMessage = (error: any): string => {
  if (error.response && error.response.data) {
    // Check for nested error structure first (like { error: { message: "..." } })
    if (error.response.data.error && error.response.data.error.message) {
      return error.response.data.error.message;
    }
    // Check for direct message
    else if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  // Fallback to axios default message or generic message
  return error.message || "An error occurred";
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
  phone_number: string;
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

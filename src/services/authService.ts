import { axiosInstance } from "./apiClient";

export interface LoginPayload {
    identifier: string; // phone or email
    password?: string;
}

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    email?: string;
}

export interface VerifyPhonePayload {
    user_id: string;
    otp: string;
}

export interface ForgotPasswordPayload {
    identifier: string;
}

export interface ResendOtpPayload {
    phone_number: string;
}

export interface ResetPasswordPayload {
    token: string;
    new_password: string;
}

export default {
    verifyPhone: (data: VerifyPhonePayload) => axiosInstance.post("/auth/verify-phone", data).then(res => res.data),
    resendOtp: (data: ResendOtpPayload) => axiosInstance.post("/auth/resend-otp", data).then(res => res.data),
    forgotPassword: (data: ForgotPasswordPayload) => axiosInstance.post("/auth/forgot-password", data).then(res => res.data),
    resetPassword: (data: ResetPasswordPayload) => axiosInstance.post("/auth/reset-password", data).then(res => res.data),
};

import { useToastStore } from "../stores/toastStore";
import { useMutation } from "@tanstack/react-query";
import {
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../services/authService";
import authService from "../services/authService";

export const useResendOtp = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation({
    mutationFn: (data: ResendOtpPayload) => authService.resendOtp(data),
    onSuccess: () => showToast("A new OTP has been sent.", "success"),
    onError: () => showToast("Failed to resend OTP.", "error"),
  });
};

export const useForgotPassword = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) =>
      authService.forgotPassword(data),
    onSuccess: () =>
      showToast(
        "If an account exists, a recovery link has been sent.",
        "success",
      ),
    onError: () => showToast("Failed to request password reset.", "error"),
  });
};

export const useResetPassword = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data),
    onSuccess: () =>
      showToast("Password updated. Please log in again.", "success"),
    onError: (err: any) =>
      showToast(err?.response?.data?.message || "Reset failed", "error"),
  });
};

// Re-export the new auth hooks
export { default as useVerify2FA } from "./useVerify2FA";
export { default as useVerifyLogin } from "./useVerifyLogin";
export { default as useRefreshToken } from "./useRefreshToken";
export { default as useLogout } from "./useLogout";

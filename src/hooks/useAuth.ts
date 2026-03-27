import { useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "../stores/toastStore";
import { useMutation } from "@tanstack/react-query";
import { VerifyPhonePayload, ResendOtpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "../services/authService";
import authService from "../services/authService";
import { CACHE_KEY_USER } from "../utils/constants";

export const useVerifyPhone = () => {
    const queryClient = useQueryClient();
    const showToast = useToastStore(s => s.showToast);
    return useMutation({
        mutationFn: (data: VerifyPhonePayload) => authService.verifyPhone(data),
        onSuccess: (user) => {
            queryClient.setQueryData(CACHE_KEY_USER, user);
            showToast("Phone verified! You are now logged in.", "success");
        },
        onError: (err: any) => showToast(err?.response?.data?.message || "Verification failed", "error")
    });
};

export const useResendOtp = () => {
    const showToast = useToastStore(s => s.showToast);
    return useMutation({
        mutationFn: (data: ResendOtpPayload) => authService.resendOtp(data),
        onSuccess: () => showToast("A new OTP has been sent.", "success"),
        onError: () => showToast("Failed to resend OTP.", "error")
    });
};

export const useForgotPassword = () => {
    const showToast = useToastStore(s => s.showToast);
    return useMutation({
        mutationFn: (data: ForgotPasswordPayload) => authService.forgotPassword(data),
        onSuccess: () => showToast("If an account exists, a recovery link has been sent.", "success"),
        onError: () => showToast("Failed to request password reset.", "error")
    });
};

export const useResetPassword = () => {
    const showToast = useToastStore(s => s.showToast);
    return useMutation({
        mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data),
        onSuccess: () => showToast("Password updated. Please log in again.", "success"),
        onError: (err: any) => showToast(err?.response?.data?.message || "Reset failed", "error")
    });
};

import { create } from "zustand";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  message: string | null;
  type: ToastType;
  show: boolean;
  timestamp: number;
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "info",
  show: false,
  timestamp: 0,
  showToast: (message, type = "info") => {
    set({
      message,
      type,
      show: true,
      timestamp: Date.now(), // Update timestamp on every call
    });
    //   setTimeout(() => set({ show: false }), duration);
  },
  hideToast: () => set({ show: false }),
}));

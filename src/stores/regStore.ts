import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RegistrationData } from '../pages/Register';

// 1. Ensure your interface matches exactly
interface RegState {
    // Use Partial so we can update bits and pieces
    formData: Partial<RegistrationData> & { userId?: string }; // Partial allows {}
    setFormData: (data: Partial<RegistrationData & { userId?: string }>) => void;
    clearData: () => void;
}

// 2. Add the extra () after <RegState>
export const useRegStore = create<RegState>()(
    persist(
        (set) => ({
            formData: {},
            setFormData: (data) => set((state) => ({
                formData: { ...state.formData, ...data }
            })),
            clearData: () => set({ formData: {} }),
        }),
        {
            name: 'registration-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

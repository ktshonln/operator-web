import { create } from "zustand";

interface MenuState {
  show: boolean;
  show2: boolean;
  showMenu: () => void;
  hideMenu: () => void;
  showMenu2: () => void;
  hideMenu2: () => void;
}
export const useMenuStore = create<MenuState>((set) => ({
  show: false,
  show2: true,
  showMenu: () => set({ show: true }),
  hideMenu: () => set({ show: false }),
  showMenu2: () => set({ show2: true }),
  hideMenu2: () => set({ show2: false }),
}));

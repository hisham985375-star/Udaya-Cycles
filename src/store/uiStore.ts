import { create } from "zustand";

interface UiState {
  isSearchOpen: boolean;
  toggleSearch: (isOpen?: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSearchOpen: false,
  toggleSearch: (isOpen) =>
    set((state) => ({ isSearchOpen: isOpen !== undefined ? isOpen : !state.isSearchOpen })),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.find((i) => i.productId === item.productId)) {
            return state; // Already exists
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "udaya-wishlist-storage",
    }
  )
);

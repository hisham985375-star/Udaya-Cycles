import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Unique ID for the cart item (usually productId_variantId)
  productId: string;
  variantId?: string; // Optional because accessories might not have variants
  name: string;
  sku: string;
  price: number; // in paise
  image: string;
  quantity: number;
  stock: number;
  attributes?: {
    color?: string;
    size?: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const id = item.variantId ? `${item.productId}_${item.variantId}` : item.productId;
        
        set((state) => {
          const existingItemIndex = state.items.findIndex((i) => i.id === id);
          
          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            const newItems = [...state.items];
            const newQuantity = newItems[existingItemIndex]!.quantity + item.quantity;
            
            // Check stock limits
            if (newQuantity <= item.stock) {
              newItems[existingItemIndex]!.quantity = newQuantity;
            } else {
              newItems[existingItemIndex]!.quantity = item.stock; // Max out at stock
            }
            
            return { items: newItems, isOpen: true }; // Open cart when adding
          }
          
          // New item
          return {
            items: [...state.items, { ...item, id }],
            isOpen: true // Open cart when adding
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                quantity: Math.min(quantity, item.stock), // Never exceed stock
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: (isOpen) => {
        set((state) => ({
          isOpen: isOpen !== undefined ? isOpen : !state.isOpen,
        }));
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "udaya-cart-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state (isOpen)
    }
  )
);

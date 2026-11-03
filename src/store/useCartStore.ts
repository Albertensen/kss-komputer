import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, SelectedBuildItem } from '../lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

// Memory fallback storage untuk SSR / Node.js
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface CartState {
  // State
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, qty?: number) => void;
  addBulkFromBuilder: (items: SelectedBuildItem[]) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Helpers & Computed
  getTotalPrice: () => number;
  getTotalItemsCount: () => number;
  getUniqueItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, qty = 1) => {
        const safeQty = Math.max(1, Math.round(qty));
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + safeQty,
            };
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { product, quantity: safeQty }],
          };
        });
      },

      addBulkFromBuilder: (buildItems: SelectedBuildItem[]) => {
        if (!buildItems || buildItems.length === 0) return;

        set((state) => {
          const updatedItems = [...state.items];

          for (const buildItem of buildItems) {
            const safeQty = Math.max(1, Math.round(buildItem.quantity));
            const existingIndex = updatedItems.findIndex(
              (item) => item.product.id === buildItem.product.id
            );

            if (existingIndex >= 0) {
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: updatedItems[existingIndex].quantity + safeQty,
              };
            } else {
              updatedItems.push({
                product: buildItem.product,
                quantity: safeQty,
              });
            }
          }

          return { items: updatedItems, isOpen: true };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const targetIndex = state.items.findIndex(
            (item) => item.product.id === productId
          );
          if (targetIndex < 0) return state;

          const updatedItems = [...state.items];
          updatedItems[targetIndex] = {
            ...updatedItems[targetIndex],
            quantity: Math.max(1, Math.round(qty)),
          };

          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getTotalPrice: (): number => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getTotalItemsCount: (): number => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getUniqueItemsCount: (): number => {
        return get().items.length;
      },
    }),
    {
      name: 'kss-cart-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../lib/types';

export const MAX_COMPARE_LIMIT = 4;

// Memory fallback storage untuk SSR / Node.js
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface CompareState {
  // State
  products: Product[];

  // Actions
  toggleCompareProduct: (product: Product) => { added: boolean; reason?: string };
  removeCompareProduct: (productId: string) => void;
  clearCompare: () => void;

  // Helpers
  isComparing: (productId: string) => boolean;
  canAdd: () => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      products: [],

      toggleCompareProduct: (product: Product) => {
        const currentProducts = get().products;
        const exists = currentProducts.some((p) => p.id === product.id);

        if (exists) {
          set({
            products: currentProducts.filter((p) => p.id !== product.id),
          });
          return { added: false, reason: 'Dihapus dari daftar perbandingan' };
        }

        if (currentProducts.length >= MAX_COMPARE_LIMIT) {
          return {
            added: false,
            reason: `Maksimal hanya dapat membandingkan ${MAX_COMPARE_LIMIT} produk sekaligus.`,
          };
        }

        set({
          products: [...currentProducts, product],
        });
        return { added: true };
      },

      removeCompareProduct: (productId: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      clearCompare: () => {
        set({ products: [] });
      },

      isComparing: (productId: string): boolean => {
        return get().products.some((p) => p.id === productId);
      },

      canAdd: (): boolean => {
        return get().products.length < MAX_COMPARE_LIMIT;
      },
    }),
    {
      name: 'kss-compare-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
      partialize: (state) => ({
        products: state.products,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BuildSelections,
  ProductCategory,
  Product,
  SelectedBuildItem,
  PrebuiltTemplate,
} from '../lib/types';
import { MOCK_PRODUCTS } from '../lib/mock-data';

export const ASSEMBLE_SERVICE_FEE = 100000;

// Memory fallback storage untuk SSR / Node.js
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Kategori yang mendukung multiple items (bukan pengganti tunggal)
export const MULTI_ITEM_CATEGORIES: ReadonlyArray<ProductCategory> = [
  'ram',
  'ssd',
  'hdd',
  'peripheral',
  'monitor',
];

export interface EncodedBuildPayload {
  v: number;
  name?: string;
  assemble?: boolean;
  parts: {
    c: ProductCategory;
    id: string;
    q: number;
  }[];
}

/**
 * Encode payload build ke format string URL-safe Base64
 */
export function encodeBuildPayload(payload: EncodedBuildPayload): string {
  const json = JSON.stringify(payload);
  if (typeof window !== 'undefined') {
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window
      .btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(json, 'utf-8').toString('base64url');
}

/**
 * Decode format string Base64 kembali ke struktur payload build
 */
export function decodeBuildPayload(str: string): EncodedBuildPayload {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  if (typeof window !== 'undefined') {
    const binary = window.atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as EncodedBuildPayload;
  }
  const json = Buffer.from(padded, 'base64').toString('utf-8');
  return JSON.parse(json) as EncodedBuildPayload;
}

export interface BuilderState {
  // State
  selections: BuildSelections;
  strictFilterEnabled: boolean;
  assembleService: boolean;
  customBuildName: string;

  // Actions
  addPart: (category: ProductCategory, product: Product, quantity?: number) => void;
  removePart: (category: ProductCategory, index: number) => void;
  updateQuantity: (category: ProductCategory, index: number, qty: number) => void;
  clearCategory: (category: ProductCategory) => void;
  clearAll: () => void;
  loadTemplate: (template: PrebuiltTemplate, allProducts?: Product[]) => void;
  toggleStrictFilter: () => void;
  setStrictFilter: (enabled: boolean) => void;
  toggleAssembleService: () => void;
  setAssembleService: (enabled: boolean) => void;
  setCustomBuildName: (name: string) => void;
  exportToEncodedString: () => string;
  importFromEncodedString: (code: string, allProducts?: Product[]) => boolean;

  // Computed & Selectors
  getAllSelectedItems: () => SelectedBuildItem[];
  getSubtotal: () => number;
  getTotalPrice: () => number;
  getTotalWattage: () => number;
  getItemCount: () => number;
  getSelectedPartsCount: () => number;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      selections: {},
      strictFilterEnabled: true,
      assembleService: false,
      customBuildName: '',

      addPart: (category: ProductCategory, product: Product, quantity = 1) => {
        const safeQty = Math.max(1, quantity);
        const isMulti = MULTI_ITEM_CATEGORIES.includes(category);

        set((state) => {
          const currentList = state.selections[category] || [];

          if (isMulti) {
            // Cek apakah item dengan product.id yang sama sudah ada di slot
            const existingIndex = currentList.findIndex((item) => item.product.id === product.id);
            if (existingIndex >= 0) {
              const updatedList = [...currentList];
              updatedList[existingIndex] = {
                ...updatedList[existingIndex],
                quantity: updatedList[existingIndex].quantity + safeQty,
              };
              return {
                selections: {
                  ...state.selections,
                  [category]: updatedList,
                },
              };
            }
            // Tambahkan item baru ke daftar multi-item
            return {
              selections: {
                ...state.selections,
                [category]: [...currentList, { product, quantity: safeQty }],
              },
            };
          }

          // Slot tunggal (CPU, Motherboard, Case, PSU, Cooler, GPU): gantikan komponen sebelumnya
          return {
            selections: {
              ...state.selections,
              [category]: [{ product, quantity: safeQty }],
            },
          };
        });
      },

      removePart: (category: ProductCategory, index: number) => {
        set((state) => {
          const currentList = state.selections[category];
          if (!currentList) return state;

          const updatedList = currentList.filter((_, idx) => idx !== index);
          const newSelections = { ...state.selections };

          if (updatedList.length === 0) {
            delete newSelections[category];
          } else {
            newSelections[category] = updatedList;
          }

          return { selections: newSelections };
        });
      },

      updateQuantity: (category: ProductCategory, index: number, qty: number) => {
        if (qty <= 0) {
          get().removePart(category, index);
          return;
        }

        set((state) => {
          const currentList = state.selections[category];
          if (!currentList || !currentList[index]) return state;

          const updatedList = [...currentList];
          updatedList[index] = {
            ...updatedList[index],
            quantity: Math.max(1, Math.round(qty)),
          };

          return {
            selections: {
              ...state.selections,
              [category]: updatedList,
            },
          };
        });
      },

      clearCategory: (category: ProductCategory) => {
        set((state) => {
          if (!state.selections[category]) return state;
          const newSelections = { ...state.selections };
          delete newSelections[category];
          return { selections: newSelections };
        });
      },

      clearAll: () => {
        set({
          selections: {},
          customBuildName: '',
          assembleService: false,
        });
      },

      loadTemplate: (template: PrebuiltTemplate, allProducts = MOCK_PRODUCTS) => {
        const newSelections: BuildSelections = {};

        for (const item of template.items) {
          const foundProduct = allProducts.find((p) => p.id === item.productId);
          if (foundProduct) {
            if (!newSelections[item.category]) {
              newSelections[item.category] = [];
            }
            newSelections[item.category]!.push({
              product: foundProduct,
              quantity: Math.max(1, item.quantity),
            });
          }
        }

        set({
          selections: newSelections,
          customBuildName: template.name,
          assembleService: false,
        });
      },

      toggleStrictFilter: () => {
        set((state) => ({ strictFilterEnabled: !state.strictFilterEnabled }));
      },

      setStrictFilter: (enabled: boolean) => {
        set({ strictFilterEnabled: enabled });
      },

      toggleAssembleService: () => {
        set((state) => ({ assembleService: !state.assembleService }));
      },

      setAssembleService: (enabled: boolean) => {
        set({ assembleService: enabled });
      },

      setCustomBuildName: (name: string) => {
        set({ customBuildName: name });
      },

      exportToEncodedString: (): string => {
        const state = get();
        const parts: EncodedBuildPayload['parts'] = [];

        (Object.keys(state.selections) as ProductCategory[]).forEach((cat) => {
          const items = state.selections[cat];
          if (items && items.length > 0) {
            items.forEach((item) => {
              parts.push({
                c: cat,
                id: item.product.id,
                q: item.quantity,
              });
            });
          }
        });

        const payload: EncodedBuildPayload = {
          v: 1,
          name: state.customBuildName.trim() || undefined,
          assemble: state.assembleService ? true : undefined,
          parts,
        };

        return encodeBuildPayload(payload);
      },

      importFromEncodedString: (code: string, allProducts = MOCK_PRODUCTS): boolean => {
        try {
          if (!code || typeof code !== 'string') return false;
          const payload = decodeBuildPayload(code.trim());
          if (!payload || !Array.isArray(payload.parts)) return false;

          const newSelections: BuildSelections = {};

          for (const part of payload.parts) {
            const foundProduct = allProducts.find((p) => p.id === part.id);
            if (foundProduct) {
              if (!newSelections[part.c]) {
                newSelections[part.c] = [];
              }
              newSelections[part.c]!.push({
                product: foundProduct,
                quantity: Math.max(1, part.q || 1),
              });
            }
          }

          set({
            selections: newSelections,
            customBuildName: payload.name || '',
            assembleService: Boolean(payload.assemble),
          });

          return true;
        } catch {
          return false;
        }
      },

      getAllSelectedItems: (): SelectedBuildItem[] => {
        const { selections } = get();
        const items: SelectedBuildItem[] = [];
        (Object.keys(selections) as ProductCategory[]).forEach((cat) => {
          const list = selections[cat];
          if (list && list.length > 0) {
            items.push(...list);
          }
        });
        return items;
      },

      getSubtotal: (): number => {
        const items = get().getAllSelectedItems();
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getTotalPrice: (): number => {
        const subtotal = get().getSubtotal();
        return get().assembleService ? subtotal + ASSEMBLE_SERVICE_FEE : subtotal;
      },

      getTotalWattage: (): number => {
        const items = get().getAllSelectedItems();
        return items.reduce((sum, item) => sum + item.product.wattage * item.quantity, 0);
      },

      getItemCount: (): number => {
        const items = get().getAllSelectedItems();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getSelectedPartsCount: (): number => {
        const items = get().getAllSelectedItems();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'pc-builder-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
      partialize: (state) => ({
        selections: state.selections,
        strictFilterEnabled: state.strictFilterEnabled,
        assembleService: state.assembleService,
        customBuildName: state.customBuildName,
      }),
    }
  )
);

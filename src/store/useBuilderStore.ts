import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BuildSelections,
  ProductCategory,
  HardwarePart,
  SelectedBuildItem,
  PrebuiltPC,
} from '../lib/types';
import { PARTS_BY_ID } from '../lib/mock-data';
import { calculateDeltaPrice, getItemPart } from '../lib/compatibility';

export const DEFAULT_ASSEMBLY_FEE = 150000;

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

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
  prebuiltId?: string;
  fee?: number;
  parts: {
    c: ProductCategory;
    id: string;
    q: number;
  }[];
}

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
  selections: BuildSelections;
  activePrebuilt: PrebuiltPC | null;
  customBuildName: string;
  assemblyFee: number;
  strictFilterEnabled: boolean;

  // Actions
  selectPart: (category: ProductCategory, part: HardwarePart, quantity?: number) => void;
  addPart: (category: ProductCategory, part: HardwarePart, quantity?: number) => void; // alias
  removePart: (category: ProductCategory, index?: number) => void;
  updateQuantity: (category: ProductCategory, index: number, qty: number) => void;
  clearCategory: (category: ProductCategory) => void;
  clearAll: () => void;

  loadPrebuilt: (pkg: PrebuiltPC, partsMap?: Record<string, HardwarePart>) => void;
  loadTemplate: (template: PrebuiltPC) => void; // alias

  setCustomBuildName: (name: string) => void;
  setAssemblyFee: (fee: number) => void;
  toggleStrictFilter: () => void;

  // Delta Pricing Helper
  getDeltaPrice: (category: ProductCategory, candidatePart: HardwarePart) => number;

  // Computations
  getAllSelectedItems: () => SelectedBuildItem[];
  getSubtotal: () => number;
  getTotalPrice: () => number;
  getTotalWattage: () => number;
  getItemCount: () => number;

  exportToEncodedString: () => string;
  importFromEncodedString: (code: string) => boolean;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      selections: {},
      activePrebuilt: null,
      customBuildName: 'Custom PC Rig KSS',
      assemblyFee: DEFAULT_ASSEMBLY_FEE,
      strictFilterEnabled: true,

      selectPart: (category: ProductCategory, part: HardwarePart, quantity = 1) => {
        const safeQty = Math.max(1, Math.round(quantity));
        const isMulti = MULTI_ITEM_CATEGORIES.includes(category);

        set((state) => {
          const currentList = state.selections[category] || [];

          if (!isMulti) {
            // Penggantian slot tunggal (CPU, Mobo, VGA, PSU, Case, Cooler)
            return {
              selections: {
                ...state.selections,
                [category]: [{ part, product: part, quantity: safeQty }],
              },
            };
          }

          // Kategori multi-item (RAM, SSD, HDD, Peripheral, Monitor)
          const existingIdx = currentList.findIndex(
            (item) => getItemPart(item)?.id === part.id
          );

          if (existingIdx >= 0) {
            const updated = [...currentList];
            updated[existingIdx] = {
              part,
              product: part,
              quantity: safeQty,
            };
            return {
              selections: {
                ...state.selections,
                [category]: updated,
              },
            };
          }

          return {
            selections: {
              ...state.selections,
              [category]: [...currentList, { part, product: part, quantity: safeQty }],
            },
          };
        });
      },

      addPart: (category, part, quantity = 1) => {
        get().selectPart(category, part, quantity);
      },

      removePart: (category: ProductCategory, index = 0) => {
        set((state) => {
          const currentList = state.selections[category];
          if (!currentList || currentList.length === 0) return state;

          const updated = currentList.filter((_, idx) => idx !== index);
          const newSelections = { ...state.selections };

          if (updated.length === 0) {
            delete newSelections[category];
          } else {
            newSelections[category] = updated;
          }

          return { selections: newSelections };
        });
      },

      updateQuantity: (category: ProductCategory, index: number, qty: number) => {
        const safeQty = Math.max(1, Math.round(qty));
        set((state) => {
          const currentList = state.selections[category];
          if (!currentList || !currentList[index]) return state;

          const updated = [...currentList];
          const currentItem = updated[index];
          const part = getItemPart(currentItem)!;
          updated[index] = { part, product: part, quantity: safeQty };

          return {
            selections: {
              ...state.selections,
              [category]: updated,
            },
          };
        });
      },

      clearCategory: (category: ProductCategory) => {
        set((state) => {
          const newSelections = { ...state.selections };
          delete newSelections[category];
          return { selections: newSelections };
        });
      },

      clearAll: () => {
        set({
          selections: {},
          activePrebuilt: null,
          customBuildName: 'Custom PC Rig KSS',
          assemblyFee: DEFAULT_ASSEMBLY_FEE,
        });
      },

      loadPrebuilt: (pkg: PrebuiltPC, partsMap: Record<string, HardwarePart> = PARTS_BY_ID) => {
        const newSelections: BuildSelections = {};

        for (const [cat, item] of Object.entries(pkg.baseParts)) {
          if (!item) continue;
          const category = cat as ProductCategory;
          const part = partsMap[item.partId];
          if (part) {
            newSelections[category] = [
              {
                part,
                product: part,
                quantity: item.quantity,
              },
            ];
          }
        }

        set({
          selections: newSelections,
          activePrebuilt: pkg,
          customBuildName: pkg.name,
          assemblyFee: pkg.assemblyFee || DEFAULT_ASSEMBLY_FEE,
        });
      },

      loadTemplate: (template: PrebuiltPC) => {
        get().loadPrebuilt(template);
      },

      setCustomBuildName: (name: string) => {
        set({ customBuildName: name.trim() || 'Custom PC Rig KSS' });
      },

      setAssemblyFee: (fee: number) => {
        set({ assemblyFee: Math.max(0, fee) });
      },

      toggleStrictFilter: () => {
        set((state) => ({ strictFilterEnabled: !state.strictFilterEnabled }));
      },

      getDeltaPrice: (category: ProductCategory, candidatePart: HardwarePart): number => {
        const state = get();
        const currentItem = state.selections[category]?.[0];
        const basePart = getItemPart(currentItem);
        return calculateDeltaPrice(basePart, candidatePart);
      },

      getAllSelectedItems: () => {
        const state = get();
        const result: SelectedBuildItem[] = [];
        for (const cat of Object.keys(state.selections) as ProductCategory[]) {
          const items = state.selections[cat] || [];
          for (const item of items) {
            result.push(item);
          }
        }
        return result;
      },

      getSubtotal: () => {
        const items = get().getAllSelectedItems();
        return items.reduce((sum, item) => {
          const part = getItemPart(item);
          const price = part ? part.sellPrice || part.price || 0 : 0;
          return sum + price * item.quantity;
        }, 0);
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const fee = get().assemblyFee;
        return subtotal + fee;
      },

      getTotalWattage: () => {
        const items = get().getAllSelectedItems();
        let total = items.reduce((sum, item) => {
          const part = getItemPart(item);
          const watt = part?.wattage || 0;
          return sum + watt * item.quantity;
        }, 0);
        if (total > 0 && !get().selections.motherboard) {
          total += 30; // mobo baseline
        }
        return total;
      },

      getItemCount: () => {
        return get().getAllSelectedItems().reduce((sum, item) => sum + item.quantity, 0);
      },

      exportToEncodedString: () => {
        const state = get();
        const parts: EncodedBuildPayload['parts'] = [];

        for (const cat of Object.keys(state.selections) as ProductCategory[]) {
          const items = state.selections[cat] || [];
          for (const item of items) {
            const part = getItemPart(item);
            if (part) {
              parts.push({
                c: cat,
                id: part.id,
                q: item.quantity,
              });
            }
          }
        }

        const payload: EncodedBuildPayload = {
          v: 2,
          name: state.customBuildName,
          prebuiltId: state.activePrebuilt?.id,
          fee: state.assemblyFee,
          parts,
        };

        return encodeBuildPayload(payload);
      },

      importFromEncodedString: (code: string) => {
        try {
          const payload = decodeBuildPayload(code);
          if (!payload || !payload.parts || !Array.isArray(payload.parts)) {
            return false;
          }

          const newSelections: BuildSelections = {};
          for (const entry of payload.parts) {
            const part = PARTS_BY_ID[entry.id];
            if (part && entry.c) {
              const currentList = newSelections[entry.c] || [];
              newSelections[entry.c] = [
                ...currentList,
                { part, product: part, quantity: entry.q || 1 },
              ];
            }
          }

          set({
            selections: newSelections,
            customBuildName: payload.name || 'Custom PC Rig KSS',
            assemblyFee: payload.fee !== undefined ? payload.fee : DEFAULT_ASSEMBLY_FEE,
          });

          return true;
        } catch (err) {
          console.error('Failed to import build code:', err);
          return false;
        }
      },
    }),
    {
      name: 'kss-builder-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
      partialize: (state) => ({
        selections: state.selections,
        activePrebuilt: state.activePrebuilt,
        customBuildName: state.customBuildName,
        assemblyFee: state.assemblyFee,
        strictFilterEnabled: state.strictFilterEnabled,
      }),
    }
  )
);

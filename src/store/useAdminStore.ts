import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HardwarePart, PrebuiltPC } from '../lib/types';
import { TOKOPEDIA_OFFICIAL_STORE_URL } from '../lib/format';

export interface PartPriceOverride {
  costPrice: number;
  sellPrice: number;
}

export interface AdminPricingState {
  globalMarkupPercent: number;
  defaultAssemblyFee: number;
  tokopediaStoreUrl: string;
  priceOverrides: Record<string, PartPriceOverride>;

  // Actions
  setGlobalMarkupPercent: (percent: number) => void;
  setDefaultAssemblyFee: (fee: number) => void;
  setTokopediaStoreUrl: (url: string) => void;
  updatePartPrice: (partId: string, costPrice: number, sellPrice: number) => void;
  bulkApplyMarkupToAll: (percent: number, parts: HardwarePart[]) => void;
  resetPriceOverrides: () => void;

  // Calculators & Selectors
  getEffectivePartPrices: (part: HardwarePart) => {
    costPrice: number;
    sellPrice: number;
    profit: number;
    marginPercent: number;
  };
  calculatePackageProfit: (
    pkg: PrebuiltPC,
    partsMap: Record<string, HardwarePart>
  ) => {
    totalCost: number;
    totalSell: number;
    assemblyFee: number;
    totalCustomerPrice: number;
    netProfit: number;
    profitMarginPercent: number;
  };
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAdminStore = create<AdminPricingState>()(
  persist(
    (set, get) => ({
      globalMarkupPercent: 12,
      defaultAssemblyFee: 150000,
      tokopediaStoreUrl: TOKOPEDIA_OFFICIAL_STORE_URL,
      priceOverrides: {},

      setGlobalMarkupPercent: (percent: number) => {
        set({ globalMarkupPercent: Math.max(0, Math.min(100, percent)) });
      },

      setDefaultAssemblyFee: (fee: number) => {
        set({ defaultAssemblyFee: Math.max(0, fee) });
      },

      setTokopediaStoreUrl: (url: string) => {
        set({ tokopediaStoreUrl: url.trim() || TOKOPEDIA_OFFICIAL_STORE_URL });
      },

      updatePartPrice: (partId: string, costPrice: number, sellPrice: number) => {
        set((state) => ({
          priceOverrides: {
            ...state.priceOverrides,
            [partId]: {
              costPrice: Math.max(0, Math.round(costPrice)),
              sellPrice: Math.max(0, Math.round(sellPrice)),
            },
          },
        }));
      },

      bulkApplyMarkupToAll: (percent: number, parts: HardwarePart[]) => {
        const safePercent = Math.max(0, Math.min(100, percent));
        const overrides: Record<string, PartPriceOverride> = {};

        for (const part of parts) {
          const currentCost = get().priceOverrides[part.id]?.costPrice ?? part.costPrice;
          const newSell = Math.round(currentCost * (1 + safePercent / 100));
          overrides[part.id] = {
            costPrice: currentCost,
            sellPrice: newSell,
          };
        }

        set({
          globalMarkupPercent: safePercent,
          priceOverrides: overrides,
        });
      },

      resetPriceOverrides: () => {
        set({ priceOverrides: {}, globalMarkupPercent: 12 });
      },

      getEffectivePartPrices: (part: HardwarePart) => {
        const override = get().priceOverrides[part.id];
        const costPrice = override?.costPrice ?? part.costPrice;
        const sellPrice = override?.sellPrice ?? part.sellPrice;
        const profit = sellPrice - costPrice;
        const marginPercent = costPrice > 0 ? (profit / costPrice) * 100 : 0;

        return {
          costPrice,
          sellPrice,
          profit,
          marginPercent: Math.round(marginPercent * 10) / 10,
        };
      },

      calculatePackageProfit: (pkg: PrebuiltPC, partsMap: Record<string, HardwarePart>) => {
        let totalCost = 0;
        let totalSell = 0;

        for (const item of Object.values(pkg.baseParts)) {
          if (!item) continue;
          const part = partsMap[item.partId];
          if (!part) continue;

          const prices = get().getEffectivePartPrices(part);
          totalCost += prices.costPrice * item.quantity;
          totalSell += prices.sellPrice * item.quantity;
        }

        const fee = pkg.assemblyFee ?? get().defaultAssemblyFee;
        const totalCustomerPrice = totalSell + fee;
        // Biaya rakit dihitung sebagai net profit jasa
        const netProfit = totalCustomerPrice - totalCost;
        const profitMarginPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

        return {
          totalCost,
          totalSell,
          assemblyFee: fee,
          totalCustomerPrice,
          netProfit,
          profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
        };
      },
    }),
    {
      name: 'kss-admin-pricing-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);

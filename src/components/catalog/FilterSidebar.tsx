'use client';

import React, { useState, useMemo } from 'react';
import {
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Cpu,
  CircuitBoard,
  MemoryStick,
  Disc3,
  HardDriveDownload,
  HardDrive,
  Zap,
  Box,
  Fan,
  Monitor,
  Mouse,
  Layers,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  CpuSocket,
  RamType,
  FormFactor,
} from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/format';

export interface CatalogFilterState {
  category: ProductCategory | 'all';
  readyStockOnly: boolean;
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sockets: CpuSocket[];
  ramTypes: RamType[];
  formFactors: FormFactor[];
  searchQuery: string;
}

export const INITIAL_CATALOG_FILTERS: CatalogFilterState = {
  category: 'all',
  readyStockOnly: false,
  brands: [],
  minPrice: null,
  maxPrice: null,
  sockets: [],
  ramTypes: [],
  formFactors: [],
  searchQuery: '',
};

const CATEGORY_ICONS: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  gpu: Disc3,
  ssd: HardDriveDownload,
  hdd: HardDrive,
  psu: Zap,
  case: Box,
  cooler: Fan,
  monitor: Monitor,
  peripheral: Mouse,
};

const AVAILABLE_SOCKETS: CpuSocket[] = ['AM5', 'AM4', 'LGA1700', 'LGA1851'];
const AVAILABLE_RAM_TYPES: RamType[] = ['DDR5', 'DDR4'];
const AVAILABLE_FORM_FACTORS: FormFactor[] = ['ATX', 'mATX', 'ITX', 'E-ATX'];

export interface FilterSidebarProps {
  allProducts: Product[];
  filters: CatalogFilterState;
  onFilterChange: (newFilters: CatalogFilterState) => void;
  onResetFilters: () => void;
  filteredCount?: number;
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Filter engine helper function untuk memvalidasi produk terhadap filter aktif
 */
export function filterProducts(products: Product[], filters: CatalogFilterState): Product[] {
  return products.filter((product) => {
    // 1. Kategori
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }

    // 2. Ready Stock Only
    if (filters.readyStockOnly && product.stockStatus !== 'ready') {
      return false;
    }

    // 3. Brand
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    // 4. Rentang Harga
    if (filters.minPrice !== null && filters.minPrice > 0 && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== null && filters.maxPrice > 0 && product.price > filters.maxPrice) {
      return false;
    }

    // 5. Socket CPU / Motherboard
    if (filters.sockets.length > 0) {
      const socket = product.specs.socket;
      if (!socket || !filters.sockets.includes(socket)) {
        return false;
      }
    }

    // 6. RAM Type (RAM & Motherboard)
    if (filters.ramTypes.length > 0) {
      const ramType = product.specs.ramType;
      if (!ramType || !filters.ramTypes.includes(ramType)) {
        return false;
      }
    }

    // 7. Form Factor (Motherboard & Casing)
    if (filters.formFactors.length > 0) {
      const ff = product.specs.formFactor;
      const supportedFf = product.specs.supportedFormFactors;
      const matchesDirect = ff ? filters.formFactors.includes(ff) : false;
      const matchesSupported = supportedFf ? supportedFf.some((s) => filters.formFactors.includes(s)) : false;

      if (!matchesDirect && !matchesSupported) {
        return false;
      }
    }

    // 8. Search Query
    if (filters.searchQuery.trim()) {
      const tokens = filters.searchQuery.toLowerCase().trim().split(/\s+/);
      const targetText = [
        product.name,
        product.brand,
        product.sku,
        product.specs.socket || '',
        product.specs.chipset || '',
        product.specs.ramType || '',
        product.specs.formFactor || '',
        product.specs.storageInterface || '',
        product.category,
      ].join(' ').toLowerCase();

      const matchesAllTokens = tokens.every((token) => targetText.includes(token));
      if (!matchesAllTokens) return false;
    }

    return true;
  });
}

export function FilterSidebar({
  allProducts,
  filters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  className = '',
  isMobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) {
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    brand: false,
    price: false,
    socket: false,
    ramType: false,
    formFactor: false,
  });

  const [brandSearch, setBrandSearch] = useState('');

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Daftar Brand unik yang tersedia
  const uniqueBrands = useMemo(() => {
    const relevantProducts = filters.category === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === filters.category);

    const brandsSet = new Set<string>();
    relevantProducts.forEach((p) => brandsSet.add(p.brand));
    return Array.from(brandsSet).sort();
  }, [allProducts, filters.category]);

  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return uniqueBrands;
    return uniqueBrands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [uniqueBrands, brandSearch]);

  // Jumlah produk per kategori
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length };
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  // Hitung jumlah filter aktif
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.readyStockOnly) count++;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.minPrice !== null && filters.minPrice > 0) count++;
    if (filters.maxPrice !== null && filters.maxPrice > 0) count++;
    if (filters.sockets.length > 0) count += filters.sockets.length;
    if (filters.ramTypes.length > 0) count += filters.ramTypes.length;
    if (filters.formFactors.length > 0) count += filters.formFactors.length;
    return count;
  }, [filters]);

  const handleCategorySelect = (category: ProductCategory | 'all') => {
    onFilterChange({
      ...filters,
      category,
      // Reset filter teknis jika berpindah ke kategori yang tidak relevan
      sockets: category === 'cpu' || category === 'motherboard' || category === 'all' ? filters.sockets : [],
      ramTypes: category === 'ram' || category === 'motherboard' || category === 'all' ? filters.ramTypes : [],
      formFactors: category === 'motherboard' || category === 'case' || category === 'all' ? filters.formFactors : [],
    });
  };

  const handleBrandToggle = (brand: string) => {
    const exists = filters.brands.includes(brand);
    const updated = exists
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: updated });
  };

  const handleSocketToggle = (socket: CpuSocket) => {
    const exists = filters.sockets.includes(socket);
    const updated = exists
      ? filters.sockets.filter((s) => s !== socket)
      : [...filters.sockets, socket];
    onFilterChange({ ...filters, sockets: updated });
  };

  const handleRamTypeToggle = (ramType: RamType) => {
    const exists = filters.ramTypes.includes(ramType);
    const updated = exists
      ? filters.ramTypes.filter((r) => r !== ramType)
      : [...filters.ramTypes, ramType];
    onFilterChange({ ...filters, ramTypes: updated });
  };

  const handleFormFactorToggle = (ff: FormFactor) => {
    const exists = filters.formFactors.includes(ff);
    const updated = exists
      ? filters.formFactors.filter((f) => f !== ff)
      : [...filters.formFactors, ff];
    onFilterChange({ ...filters, formFactors: updated });
  };

  // Relevansi filter spesifikasi teknis berdasarkan kategori saat ini
  const showSocketFilter =
    filters.category === 'all' ||
    filters.category === 'cpu' ||
    filters.category === 'motherboard';

  const showRamTypeFilter =
    filters.category === 'all' ||
    filters.category === 'ram' ||
    filters.category === 'motherboard';

  const showFormFactorFilter =
    filters.category === 'all' ||
    filters.category === 'motherboard' ||
    filters.category === 'case';

  const content = (
    <div className="space-y-5 text-xs">
      {/* Header Sidebar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Filter Spesifikasi
          </span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.2 font-mono text-[10px] font-bold bg-blue-600 text-white rounded-sm">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
            title="Reset semua filter ke kondisi awal"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* 1. Toggle Status Stok */}
      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <label className="flex items-center justify-between p-2 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer select-none transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
              Hanya Ready Stock
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.readyStockOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, readyStockOnly: e.target.checked })
            }
            className="w-3.5 h-3.5 rounded-sm border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
        </label>
      </div>

      {/* 2. Pemilih Kategori Komponen */}
      <div className="space-y-1.5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Kategori Hardware
        </div>
        <div className="space-y-0.5">
          {/* Semua Kategori */}
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-sm font-medium transition-colors ${
              filters.category === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Semua Kategori</span>
            </div>
            <span
              className={`font-mono text-[10px] tabular-nums ${
                filters.category === 'all' ? 'text-blue-100' : 'text-zinc-400'
              }`}
            >
              {categoryCounts.all || 0}
            </span>
          </button>

          {/* Daftar Kategori */}
          {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Box;
            const isSelected = filters.category === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                </div>
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    isSelected ? 'text-blue-100' : 'text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Rentang Harga */}
      <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <span>Rentang Harga (Rp)</span>
          {collapsedSections.price ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>

        {!collapsedSections.price && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                  Min (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null;
                    onFilterChange({ ...filters, minPrice: val });
                  }}
                  className="w-full px-2 py-1.5 font-mono text-xs rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                  Max (Rp)
                </label>
                <input
                  type="number"
                  placeholder="50.000.000"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null;
                    onFilterChange({ ...filters, maxPrice: val });
                  }}
                  className="w-full px-2 py-1.5 font-mono text-xs rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { label: '< 2 Juta', min: null, max: 2000000 },
                { label: '2 - 5 Jt', min: 2000000, max: 5000000 },
                { label: '5 - 10 Jt', min: 5000000, max: 10000000 },
                { label: '> 10 Jt', min: 10000000, max: null },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      minPrice: preset.min,
                      maxPrice: preset.max,
                    })
                  }
                  className="px-2 py-0.5 text-[10px] font-mono rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Filter Brand */}
      <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <span>Brand ({uniqueBrands.length})</span>
          {collapsedSections.brand ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>

        {!collapsedSections.brand && (
          <div className="space-y-2 pt-1">
            {/* Cari brand jika banyak */}
            {uniqueBrands.length > 6 && (
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari brand..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 font-mono text-[11px] rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {filteredBrandsList.map((brand) => {
                const isChecked = filters.brands.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center justify-between px-2 py-1 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer select-none text-zinc-700 dark:text-zinc-300 text-xs"
                  >
                    <span className="truncate">{brand}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-3.5 h-3.5 rounded-sm border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>
                );
              })}
              {filteredBrandsList.length === 0 && (
                <div className="text-[11px] text-zinc-400 py-1 text-center">
                  Brand tidak ditemukan.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Filter Teknis: Socket CPU & Motherboard */}
      {showSocketFilter && (
        <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => toggleSection('socket')}
            className="w-full flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <span>Socket Processor</span>
            {collapsedSections.socket ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {!collapsedSections.socket && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {AVAILABLE_SOCKETS.map((socket) => {
                const isSelected = filters.sockets.includes(socket);
                return (
                  <button
                    key={socket}
                    type="button"
                    onClick={() => handleSocketToggle(socket)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-sm border font-mono text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{socket}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Filter Teknis: RAM Type (DDR4 / DDR5) */}
      {showRamTypeFilter && (
        <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => toggleSection('ramType')}
            className="w-full flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <span>Tipe RAM</span>
            {collapsedSections.ramType ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {!collapsedSections.ramType && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {AVAILABLE_RAM_TYPES.map((ramType) => {
                const isSelected = filters.ramTypes.includes(ramType);
                return (
                  <button
                    key={ramType}
                    type="button"
                    onClick={() => handleRamTypeToggle(ramType)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-sm border font-mono text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{ramType}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. Filter Teknis: Form Factor */}
      {showFormFactorFilter && (
        <div className="space-y-2 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('formFactor')}
            className="w-full flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <span>Form Factor (Ukuran)</span>
            {collapsedSections.formFactor ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {!collapsedSections.formFactor && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {AVAILABLE_FORM_FACTORS.map((ff) => {
                const isSelected = filters.formFactors.includes(ff);
                return (
                  <button
                    key={ff}
                    type="button"
                    onClick={() => handleFormFactorToggle(ff)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-sm border font-mono text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{ff}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info hasil hitung */}
      {filteredCount !== undefined && (
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Menampilkan:</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
            {filteredCount} SKU
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky container) */}
      <aside
        className={`hidden lg:block w-64 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 self-start sticky top-20 shadow-xs ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Filter */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer Body */}
          <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-zinc-900 p-4 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  Filter Produk
                </span>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="p-1 rounded-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onMobileClose}
                className="w-full py-2.5 px-4 font-mono text-xs font-bold uppercase bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-center shadow-xs"
              >
                Lihat Hasil {filteredCount !== undefined ? `(${filteredCount} SKU)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

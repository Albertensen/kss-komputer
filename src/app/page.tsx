'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Disc3,
  HardDrive,
  HardDriveDownload,
  Zap,
  Box,
  Fan,
  Monitor,
  Mouse,
  Layers,
  ArrowRight,
  Plus,
  ShoppingCart,
  Scale,
  Check,
  Search,
  Sparkles,
  ChevronRight,
  Wrench,
} from 'lucide-react';
import { ProductCategory, Product, PrebuiltTemplate } from '@/lib/types';
import { MOCK_PRODUCTS, MOCK_TEMPLATES } from '@/lib/mock-data';
import { formatIDR, formatWatt, CATEGORY_LABELS } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';
import { SpecBadges } from '@/components/catalog/SpecBadges';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useCartStore } from '@/store/useCartStore';
import { useCompareStore } from '@/store/useCompareStore';

// Pemetaan Ikon Kategori Komponen
const CATEGORY_ICON_MAP: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
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

const ORDERED_CATEGORIES: ProductCategory[] = [
  'cpu',
  'motherboard',
  'ram',
  'gpu',
  'ssd',
  'hdd',
  'psu',
  'case',
  'cooler',
  'monitor',
  'peripheral',
];

export default function HomePage() {
  const mounted = useHydrated();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Zustand stores
  const selections = useBuilderStore((state) => state.selections);
  const builderPartCount = useBuilderStore((state) => state.getItemCount());
  const builderTotalPrice = useBuilderStore((state) => state.getTotalPrice());
  const builderTotalWatt = useBuilderStore((state) => state.getTotalWattage());
  const addPart = useBuilderStore((state) => state.addPart);
  const loadTemplate = useBuilderStore((state) => state.loadTemplate);

  const addItemToCart = useCartStore((state) => state.addItem);
  const toggleCompare = useCompareStore((state) => state.toggleCompareProduct);
  const isComparing = useCompareStore((state) => state.isComparing);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((prev) => (prev === message ? null : prev));
    }, 2500);
  };

  // Statistik Kategori untuk Baris Kategori Cepat
  const categoryStats = useMemo(() => {
    return ORDERED_CATEGORIES.map((cat) => {
      const prods = MOCK_PRODUCTS.filter((p) => p.category === cat);
      const readyCount = prods.filter((p) => p.stockStatus === 'ready').length;
      const minPrice = prods.length > 0 ? Math.min(...prods.map((p) => p.price)) : 0;
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        icon: CATEGORY_ICON_MAP[cat],
        totalCount: prods.length,
        readyCount,
        minPrice,
      };
    });
  }, []);

  // Filter Pricelist Explorer
  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS;

    if (activeTab === 'discount') {
      list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
    } else if (activeTab !== 'all') {
      list = list.filter((p) => p.category === activeTab);
    }

    if (tableSearch.trim()) {
      const q = tableSearch.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.specs.socket && p.specs.socket.toLowerCase().includes(q)) ||
          (p.specs.chipset && p.specs.chipset.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, tableSearch]);

  const handleQuickAddBuilder = (product: Product) => {
    addPart(product.category, product);
    showToast(`"${product.name}" ditambahkan ke Simulasi Rakitan.`);
  };

  const handleQuickAddToCart = (product: Product) => {
    addItemToCart(product, 1);
    showToast(`"${product.name}" dimasukkan ke Keranjang Belanja.`);
  };

  const handleQuickCompare = (product: Product) => {
    const res = toggleCompare(product);
    if (res.added) {
      showToast(`"${product.name}" ditambahkan ke perbandingan.`);
    } else {
      showToast(res.reason || `"${product.name}" dikeluarkan dari perbandingan.`);
    }
  };

  const handleLoadTemplate = (tpl: PrebuiltTemplate) => {
    loadTemplate(tpl);
    showToast(`Template "${tpl.name}" berhasil dimuat ke Simulasi Rakitan!`);
  };

  // Highlight paket bulanan (Sweetspot AM5 & Kere Hore)
  const spotlightTemplates = MOCK_TEMPLATES.slice(0, 2);

  // Ambil CPU & GPU yang sedang aktif di builder untuk ringkasan di banner
  const activeCpu = selections.cpu?.[0]?.part || selections.cpu?.[0]?.product;
  const activeGpu = selections.gpu?.[0]?.part || selections.gpu?.[0]?.product;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 space-y-5">
      {/* Toast Notification Flasher */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-sm border border-blue-600 bg-zinc-900 px-3.5 py-2.5 font-mono text-xs text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* =========================================================================
          1. BARIS KATEGORI CEPAT (11 KATEGORI INDUSTRIAL)
         ========================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Kategori Komponen Hardware
            </h2>
          </div>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Semua Komponen ({MOCK_PRODUCTS.length} SKU) <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1.5">
          {categoryStats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.category}
                href={`/katalog?kategori=${item.category}`}
                className="group flex flex-col justify-between border border-zinc-200 bg-white p-2 text-left rounded-sm transition-colors hover:border-blue-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-400 dark:hover:bg-zinc-800/80"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-blue-600 dark:text-zinc-400 dark:group-hover:text-blue-400" />
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {item.readyCount} Ready
                  </span>
                </div>
                <div className="mt-2">
                  <div className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.label.split(' ')[0]}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    Mulai {formatIDR(item.minPrice)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          2. SPLIT ACTION BANNER PADAT (BUKAN HERO RAKSASA)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Kolom Kiri (5 Kolom): Status Simulasi Rakitan Pengguna */}
        <div className="lg:col-span-5 flex flex-col justify-between border border-zinc-300 bg-white p-4 rounded-sm shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Simulasi Rakitan Anda
                </h3>
              </div>
              <span className="rounded-sm bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                {mounted ? `${builderPartCount} Komponen Terpasang` : '0 Komponen'}
              </span>
            </div>

            {mounted && builderPartCount > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between text-xs">
                    <span className="font-mono text-zinc-500">Processor:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] text-right">
                      {activeCpu ? activeCpu.name : <em className="text-zinc-400">Belum dipilih</em>}
                    </span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="font-mono text-zinc-500">Kartu Grafis:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] text-right">
                      {activeGpu ? activeGpu.name : <em className="text-zinc-400">Belum dipilih</em>}
                    </span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="font-mono text-zinc-500">Estimasi Daya:</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {formatWatt(builderTotalWatt)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Total Biaya Rakit:</span>
                  <span className="font-mono text-base font-black tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatIDR(builderTotalPrice)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 py-2 text-xs text-zinc-500 leading-relaxed">
                <p>
                  Belum ada komponen di rakitan aktif Anda. Gunakan mesin simulasi KSS Komputer untuk merakit PC impian dengan validasi socket, RAM, form factor, dan daya otomatis secara real-time.
                </p>
                <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Cek Socket AM5/1700
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Cek Ukuran GPU
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <Link
              href="/simulasi"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm bg-blue-600 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-blue-700 transition-colors"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>{mounted && builderPartCount > 0 ? 'Lanjutkan Rakitan' : 'Mulai Rakit PC'}</span>
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center rounded-sm border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Lihat Pricelist
            </Link>
          </div>
        </div>

        {/* Kolom Kanan (7 Kolom): Sorotan Paket Rakitan Value for Money */}
        <div className="lg:col-span-7 border border-zinc-300 bg-white p-4 rounded-sm shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Paket PC Siap Rakit Paling Populer
              </h3>
            </div>
            <Link
              href="/paket-rakitan"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:underline dark:text-blue-400"
            >
              Semua Paket ({MOCK_TEMPLATES.length}) <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {spotlightTemplates.map((tpl) => {
              const basePartsEntries = Object.values(tpl.baseParts);
              const packagePrice = basePartsEntries.reduce((sum: number, itm) => {
                if (!itm) return sum;
                const prod = MOCK_PRODUCTS.find((p) => p.id === itm.partId);
                return sum + (prod ? (prod.sellPrice || prod.price) * itm.quantity : 0);
              }, tpl.assemblyFee || 150000);

              return (
                <div
                  key={tpl.id}
                  className="flex flex-col justify-between border border-zinc-200 bg-zinc-50/70 p-3 rounded-sm dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="rounded-sm border border-blue-600/30 bg-blue-600/10 px-1.5 py-0.2 font-mono text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
                        {tpl.targetResolution}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {basePartsEntries.length} Komponen
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {tpl.name}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {tpl.description}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1 font-mono text-[10px]">
                      {tpl.estimatedFps.slice(0, 2).map((fps) => (
                        <span
                          key={fps.game}
                          className="rounded-sm bg-zinc-200/80 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {fps.game}: <strong className="text-emerald-600 dark:text-emerald-400">{fps.fps} FPS</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">Estimasi Harga</div>
                      <div className="font-mono text-xs font-black tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatIDR(packagePrice)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(tpl)}
                      className="inline-flex items-center gap-1 rounded-sm bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-blue-500 dark:hover:text-white transition-colors"
                      title="Muat konfigurasi ini ke halaman Simulasi"
                    >
                      <span>Load Rakitan</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. LIVE PRICELIST EXPLORER (TABEL ENTERKOMPUTER STYLE LANGSUNG DI HOMEPAGE)
         ========================================================================= */}
      <section className="border border-zinc-300 bg-white rounded-sm shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-100/50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Live Pricelist Hardware Explorer
            </h2>
            <span className="font-mono text-[11px] text-zinc-500">
              (Menampilkan {filteredProducts.length} dari {MOCK_PRODUCTS.length} SKU)
            </span>
          </div>

          {/* Quick Search inside Table */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Saring nama, brand, atau socket..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full sm:w-64 rounded-sm border border-zinc-300 bg-white py-1.5 pl-8 pr-3 font-mono text-xs text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
            <Link
              href="/katalog"
              className="hidden sm:inline-flex items-center gap-1 rounded-sm bg-blue-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-blue-700"
            >
              <span>Katalog Lengkap</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Tab Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          {[
            { id: 'all', label: 'Semua Komponen' },
            { id: 'cpu', label: 'Processor (CPU)' },
            { id: 'gpu', label: 'VGA / Kartu Grafis' },
            { id: 'motherboard', label: 'Motherboard' },
            { id: 'ram', label: 'Memory (RAM)' },
            { id: 'ssd', label: 'SSD NVMe' },
            { id: 'discount', label: '🔥 Turun Harga / Promo' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* High-Density Pricelist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100/80 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400">
                <th className="py-2.5 px-3 w-32">SKU &amp; Brand</th>
                <th className="py-2.5 px-3">Nama Produk &amp; Spesifikasi Kunci</th>
                <th className="py-2.5 px-3 w-28 text-center">Stok</th>
                <th className="py-2.5 px-3 w-24 text-right">Daya</th>
                <th className="py-2.5 px-3 w-36 text-right">Harga Resmi</th>
                <th className="py-2.5 px-3 w-44 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Tidak ada produk yang cocok dengan pencarian &quot;{tableSearch}&quot;.
                  </td>
                </tr>
              ) : (
                filteredProducts.slice(0, 15).map((product) => {
                  const comparing = mounted && isComparing(product.id);
                  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-zinc-800/60 transition-colors"
                    >
                      {/* 1. SKU & Brand */}
                      <td className="py-2.5 px-3 align-top font-mono">
                        <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                          {product.brand}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[110px]">
                          {product.sku}
                        </div>
                      </td>

                      {/* 2. Nama Produk + SpecBadges */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                          {product.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <SpecBadges product={product} />
                          <span className="font-mono text-[10px] text-zinc-400">
                            &bull; {product.warrantyYears} Thn Garansi
                          </span>
                        </div>
                      </td>

                      {/* 3. Status Stok */}
                      <td className="py-2.5 px-3 align-top text-center">
                        {product.stockStatus === 'ready' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Ready
                          </span>
                        ) : product.stockStatus === 'low' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-amber-50 text-amber-700 border border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400">
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-red-50 text-red-700 border border-red-500/20 dark:bg-red-950/40 dark:text-red-400">
                            Habis
                          </span>
                        )}
                      </td>

                      {/* 4. Daya (Watt) */}
                      <td className="py-2.5 px-3 align-top text-right font-mono text-zinc-600 dark:text-zinc-300">
                        {product.wattage > 0 ? formatWatt(product.wattage) : '-'}
                      </td>

                      {/* 5. Harga Satuan */}
                      <td className="py-2.5 px-3 align-top text-right">
                        <div className="font-mono text-xs font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                          {formatIDR(product.price)}
                        </div>
                        {hasDiscount && (
                          <div className="font-mono text-[10px] tabular-nums text-zinc-400 line-through">
                            {formatIDR(product.originalPrice!)}
                          </div>
                        )}
                      </td>

                      {/* 6. Tombol Aksi Cepat */}
                      <td className="py-2.5 px-3 align-top text-center">
                        <div className="inline-flex items-center gap-1">
                          {/* Tambah ke Simulasi */}
                          <button
                            onClick={() => handleQuickAddBuilder(product)}
                            className="inline-flex items-center gap-0.5 rounded-sm bg-blue-600 px-2 py-1 font-mono text-[11px] font-medium text-white hover:bg-blue-700 transition-colors"
                            title="Tambahkan ke Simulasi Rakitan"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Rakit</span>
                          </button>

                          {/* Tambah ke Keranjang */}
                          <button
                            onClick={() => handleQuickAddToCart(product)}
                            className="rounded-sm border border-zinc-200 bg-white p-1 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            title="Tambahkan ke Keranjang Belanja"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>

                          {/* Tombol Bandingkan */}
                          <button
                            onClick={() => handleQuickCompare(product)}
                            className={`rounded-sm border p-1 ${
                              comparing
                                ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                            title="Bandingkan spesifikasi"
                          >
                            <Scale className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Link ke katalog penuh */}
        <div className="border-t border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-zinc-500 font-mono">
            * Seluruh harga termasuk PPN 11% &amp; segel garansi distributor resmi Indonesia.
          </div>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>Buka Halaman Katalog Lengkap &amp; Filter Detail</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

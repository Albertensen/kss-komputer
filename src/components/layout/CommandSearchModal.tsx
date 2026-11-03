'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Plus, ShoppingCart, Cpu, Check, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { formatIDR } from '@/lib/format';
import { SpecBadges, getProductSpecLabels } from '@/components/catalog/SpecBadges';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useCartStore } from '@/store/useCartStore';

export interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Memeriksa apakah suatu produk cocok dengan seluruh token pencarian (multi-token search).
 * Contoh: "am5 ddr5 msi" harus cocok dengan socket AM5, ram DDR5, dan brand MSI.
 */
function matchesSearchTokens(product: Product, tokens: string[]): boolean {
  if (tokens.length === 0) return true;

  const specLabels = getProductSpecLabels(product).map((lbl) => lbl.toLowerCase());
  const searchCorpus = [
    product.name.toLowerCase(),
    product.sku.toLowerCase(),
    product.brand.toLowerCase(),
    product.category.toLowerCase(),
    product.specs.socket?.toLowerCase() || '',
    product.specs.chipset?.toLowerCase() || '',
    product.specs.ramType?.toLowerCase() || '',
    product.specs.formFactor?.toLowerCase() || '',
    product.specs.vramType?.toLowerCase() || '',
    product.specs.storageInterface?.toLowerCase() || '',
    product.specs.efficiencyRating?.toLowerCase() || '',
    ...specLabels,
  ].join(' ');

  return tokens.every((token) => searchCorpus.includes(token));
}

export function CommandSearchModal({ isOpen, onClose }: CommandSearchModalProps) {
  const [query, setQuery] = useState('');
  const [addedBuilderId, setAddedBuilderId] = useState<string | null>(null);
  const [addedCartId, setAddedCartId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addPart = useBuilderStore((state) => state.addPart);
  const addItem = useCartStore((state) => state.addItem);

  // Fokus input otomatis saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setAddedBuilderId(null);
      setAddedCartId(null);
    }
  }, [isOpen]);

  // Shortcut keyboard Escape untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Multi-token filter
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Tampilkan 8 produk rekomendasi awal saat query kosong
      return MOCK_PRODUCTS.slice(0, 8);
    }
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    return MOCK_PRODUCTS.filter((product) => matchesSearchTokens(product, tokens)).slice(0, 20);
  }, [query]);

  const handleAddToBuilder = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addPart(product.category, product);
    setAddedBuilderId(product.id);
    setTimeout(() => {
      setAddedBuilderId((prev) => (prev === product.id ? null : prev));
    }, 1500);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedCartId(product.id);
    setTimeout(() => {
      setAddedCartId((prev) => (prev === product.id ? null : prev));
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-md overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar & Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama komponen, SKU, socket (AM5, LGA1700), RAM (DDR5)..."
            className="w-full bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono tracking-tight"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-sm">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Info Tag */}
        <div className="px-4 py-1.5 bg-zinc-100/70 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>
            {query.trim()
              ? `Ditemukan ${searchResults.length} komponen`
              : 'Komponen Unggulan & Ready Stock'}
          </span>
          <span className="hidden sm:inline">Navigasi instan multi-token</span>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80 p-1">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500 font-mono">
              Tidak ada komponen yang cocok dengan kata kunci &quot;{query}&quot;.
              <div className="text-xs text-zinc-400 mt-1">
                Coba cari berdasarkan socket (contoh: AM5, LGA1700) atau brand (ASUS, MSI, AMD).
              </div>
            </div>
          ) : (
            searchResults.map((product) => {
              const isAddedToBuilder = addedBuilderId === product.id;
              const isAddedToCart = addedCartId === product.id;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-sm transition-colors gap-2"
                >
                  {/* Left Column: Product Info & Spec Badges */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tracking-wider">
                        {product.sku}
                      </span>
                      <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-sm uppercase">
                        {product.brand}
                      </span>
                      {product.stockStatus === 'ready' && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          ● Ready
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/produk/${product.slug}`}
                      onClick={onClose}
                      className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1.5">
                      <SpecBadges product={product} limit={4} />
                    </div>
                  </div>

                  {/* Right Column: Price & Quick Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {formatIDR(product.price)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="font-mono text-[10px] text-zinc-400 line-through tabular-nums">
                          {formatIDR(product.originalPrice)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Button + Simulasi */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToBuilder(e, product)}
                        title="Tambahkan ke Simulasi Rakitan PC"
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium border rounded-sm transition-all ${
                          isAddedToBuilder
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {isAddedToBuilder ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Tersimpan</span>
                          </>
                        ) : (
                          <>
                            <Cpu className="w-3 h-3" />
                            <span className="hidden sm:inline">+ Rakitan</span>
                          </>
                        )}
                      </button>

                      {/* Button + Keranjang */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        title="Tambahkan ke Keranjang Belanja"
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium border rounded-sm transition-all ${
                          isAddedToCart
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                        }`}
                      >
                        {isAddedToCart ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Di Keranjang</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span className="hidden sm:inline">+ Beli</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>Tekan <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-sm">ESC</kbd> untuk menutup</span>
          </div>
          <Link
            href="/katalog"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Buka Katalog Lengkap <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CommandSearchModal;

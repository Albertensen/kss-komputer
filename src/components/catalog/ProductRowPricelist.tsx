'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  ShoppingCart,
  Scale,
  Check,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatIDR } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';
import { SpecBadges } from './SpecBadges';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useCartStore } from '@/store/useCartStore';
import { useCompareStore } from '@/store/useCompareStore';

export interface ProductRowPricelistProps {
  product: Product;
  onActionFeedback?: (message: string) => void;
  className?: string;
  showCategoryBadge?: boolean;
}

export function ProductRowPricelist({
  product,
  onActionFeedback,
  className = '',
  showCategoryBadge = false,
}: ProductRowPricelistProps) {
  const isHydrated = useHydrated();
  const [justAddedSimulasi, setJustAddedSimulasi] = useState(false);
  const [justAddedCart, setJustAddedCart] = useState(false);

  // Zustand Store hooks
  const addPart = useBuilderStore((state) => state.addPart);
  const addItem = useCartStore((state) => state.addItem);
  const isComparing = useCompareStore((state) => state.isComparing);
  const toggleCompare = useCompareStore((state) => state.toggleCompareProduct);

  const comparing = isHydrated && isComparing(product.id);
  const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const distributor = product.officialDistributor || product.OfficialDistributor;

  // Handlers
  const handleAddToSimulasi = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addPart(product.category, product);
    setJustAddedSimulasi(true);
    setTimeout(() => setJustAddedSimulasi(false), 1500);
    onActionFeedback?.(`${product.name} ditambahkan ke Simulasi Rakitan`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setJustAddedCart(true);
    setTimeout(() => setJustAddedCart(false), 1500);
    onActionFeedback?.(`${product.name} dimasukkan ke Keranjang Belanja`);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(product);
    if (result.reason) {
      onActionFeedback?.(result.reason);
    } else {
      onActionFeedback?.(
        result.added
          ? `${product.name} ditambahkan ke Bandingkan`
          : `${product.name} dihapus dari Bandingkan`
      );
    }
  };

  return (
    <tr
      className={`border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors group text-xs ${className}`}
    >
      {/* Kolom 1: SKU & Brand */}
      <td className="py-2.5 px-3 align-top font-mono w-32 shrink-0">
        <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <span>{product.brand}</span>
          {showCategoryBadge && (
            <span className="text-[9px] uppercase px-1 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xs">
              {product.category}
            </span>
          )}
        </div>
        <div
          className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[110px]"
          title={`SKU: ${product.sku}`}
        >
          {product.sku}
        </div>
      </td>

      {/* Kolom 2: Nama Produk (link ke /produk/[slug]) + SpecBadges */}
      <td className="py-2.5 px-3 align-top">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/produk/${product.slug}`}
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight inline-flex items-center gap-1 group-hover:underline"
          >
            <span>{product.name}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
          </Link>
        </div>

        {/* Deretan SpecBadges */}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <SpecBadges product={product} />
        </div>
      </td>

      {/* Kolom 3: Status Stok & Garansi */}
      <td className="py-2.5 px-3 align-top w-36">
        <div className="flex flex-col gap-1">
          {/* Status Stok Badge */}
          <div>
            {product.stockStatus === 'ready' ? (
              <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                Ready Stock
              </span>
            ) : product.stockStatus === 'low' ? (
              <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-amber-50 text-amber-700 border border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400">
                Stok Terbatas
              </span>
            ) : product.stockStatus === 'po' ? (
              <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-blue-50 text-blue-700 border border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400">
                Pre-Order
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded-sm bg-red-50 text-red-700 border border-red-500/20 dark:bg-red-950/40 dark:text-red-400">
                Habis
              </span>
            )}
          </div>

          {/* Garansi Resmi */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            <Shield className="w-3 h-3 shrink-0 text-zinc-400" />
            <span className="truncate" title={`Garansi Resmi ${product.warrantyYears} Tahun ${distributor ? `(${distributor})` : ''}`}>
              Resmi {product.warrantyYears} Thn
              {distributor ? ` (${distributor})` : ''}
            </span>
          </div>
        </div>
      </td>

      {/* Kolom 4: Harga Satuan & Coret */}
      <td className="py-2.5 px-3 align-top text-right w-36 whitespace-nowrap">
        <div className="font-mono tabular-nums font-bold text-sm text-zinc-900 dark:text-zinc-100">
          {formatIDR(product.price)}
        </div>
        {hasDiscount && (
          <div className="flex items-center justify-end gap-1 font-mono text-[10px]">
            <span className="text-zinc-400 line-through">
              {formatIDR(product.originalPrice!)}
            </span>
            <span className="text-red-600 dark:text-red-400 font-bold">
              -{discountPercent}%
            </span>
          </div>
        )}
      </td>

      {/* Kolom 5: Tombol Aksi Cepat */}
      <td className="py-2.5 px-3 align-top w-48 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {/* Tombol + Simulasi */}
          <button
            type="button"
            onClick={handleAddToSimulasi}
            title="Tambahkan ke Simulasi Rakitan PC"
            className={`inline-flex items-center gap-1 px-2 py-1 font-mono text-[11px] font-semibold rounded-sm border transition-colors ${
              justAddedSimulasi
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:border-zinc-700'
            }`}
          >
            {justAddedSimulasi ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>Simulasi</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Simulasi</span>
              </>
            )}
          </button>

          {/* Tombol Bandingkan */}
          <button
            type="button"
            onClick={handleToggleCompare}
            title={comparing ? 'Hapus dari daftar perbandingan' : 'Bandingkan spesifikasi produk ini'}
            className={`p-1 rounded-sm border transition-colors ${
              comparing
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:border-zinc-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          {/* Tombol + Keranjang */}
          <button
            type="button"
            disabled={product.stockStatus === 'out_of_stock'}
            onClick={handleAddToCart}
            title={
              product.stockStatus === 'out_of_stock'
                ? 'Stok produk habis'
                : 'Tambahkan langsung ke Keranjang Belanja'
            }
            className={`inline-flex items-center gap-1 px-2 py-1 font-mono text-[11px] font-semibold rounded-sm border transition-colors ${
              product.stockStatus === 'out_of_stock'
                ? 'opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                : justAddedCart
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            {justAddedCart ? (
              <Check className="w-3 h-3" />
            ) : (
              <ShoppingCart className="w-3 h-3" />
            )}
            <span>Beli</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

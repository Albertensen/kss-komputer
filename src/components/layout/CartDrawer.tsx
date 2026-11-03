'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquareCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatIDR } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/format';

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItemsCount = useCartStore((state) => state.getTotalItemsCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup drawer jika tombol ESC ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted || !isOpen) return null;

  const totalPrice = getTotalPrice();
  const totalCount = getTotalItemsCount();

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const phone = '6281234567890'; // WhatsApp Sales KSS Komputer
    const lines: string[] = [
      '*PESANAN KERANJANG BELANJA — KSS KOMPUTER*',
      '----------------------------------------',
      '*DAFTAR BARANG:*',
    ];

    items.forEach((item, index) => {
      const subtotal = item.product.price * item.quantity;
      lines.push(
        `${index + 1}. ${item.product.name} (${item.product.sku})\n   ${item.quantity}x @ ${formatIDR(item.product.price)} = *${formatIDR(subtotal)}*`
      );
    });

    lines.push('----------------------------------------');
    lines.push(`*TOTAL BELANJA:* ${formatIDR(totalPrice)}`);
    lines.push('');
    lines.push('Mohon konfirmasi ketersediaan stok fisik dan rekening pembayaran. Terima kasih!');

    const encodedText = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:border-l dark:border-zinc-800">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
              Keranjang Belanja
            </h2>
            <span className="rounded-sm border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {totalCount} item
            </span>
          </div>
          <button
            onClick={closeCart}
            className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Tutup (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body / List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 px-4 py-2">
          {items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Keranjang belanja masih kosong
              </p>
              <button
                onClick={closeCart}
                className="mt-3 inline-flex items-center gap-1 rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Mulai Belanja Komponen
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="py-3 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {CATEGORY_LABELS[item.product.category] || item.product.category} &bull; {item.product.brand}
                    </span>
                    <h3 className="text-xs font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                      {item.product.name}
                    </h3>
                    <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      SKU: {item.product.sku}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-0.5"
                    title="Hapus komponen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-sm">
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                      title="Kurangi kuantitas"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 py-0.5 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Tambah kuantitas"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatIDR(item.product.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="font-mono text-[10px] text-zinc-400">
                        @{formatIDR(item.product.price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Total Pesanan ({totalCount} item):</span>
              <span className="font-mono text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatIDR(totalPrice)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleWhatsAppCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-emerald-700"
              >
                <MessageSquareCheck className="h-4 w-4" />
                Pesan via WhatsApp Sales
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Kosongkan Keranjang
                </button>
                <Link
                  href="/simulasi"
                  onClick={closeCart}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Buka Simulasi Rakitan <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

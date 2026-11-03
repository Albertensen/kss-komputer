'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Cpu,
  Layers,
  Sparkles,
  Scale,
  ShoppingBag,
  FileDown,
  PhoneCall,
  Menu,
  X,
  Clock,
  ShieldCheck,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useCartStore } from '@/store/useCartStore';
import { formatIDR } from '@/lib/format';
import { CommandSearchModal } from '@/components/layout/CommandSearchModal';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Zustand stores
  const builderPartCount = useBuilderStore((state) => state.getItemCount());
  const builderTotalPrice = useBuilderStore((state) => state.getTotalPrice());
  const compareCount = useCompareStore((state) => state.products.length);
  const cartCount = useCartStore((state) => state.getTotalItemsCount());
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tutup mobile menu saat rute berpindah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: '/katalog',
      label: 'Katalog & Pricelist',
      icon: Layers,
    },
    {
      href: '/simulasi',
      label: 'Simulasi Rakitan',
      icon: Cpu,
      badge: isMounted && builderPartCount > 0 ? `${builderPartCount} Item` : null,
      subBadge: isMounted && builderTotalPrice > 0 ? formatIDR(builderTotalPrice) : null,
      highlight: true,
    },
    {
      href: '/paket-rakitan',
      label: 'Paket PC',
      icon: Sparkles,
    },
    {
      href: '/bandingkan',
      label: 'Bandingkan',
      icon: Scale,
      badge: isMounted && compareCount > 0 ? `${compareCount}` : null,
    },
    {
      href: '/admin/pricelist',
      label: 'Admin Pricelist',
      icon: Database,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95 backdrop-blur-sm">
        {/* 1. TOP UTILITY BAR (Toko Offline, Jam Buka, Update Pricelist, Sales WhatsApp) */}
        <div className="border-b border-zinc-200 bg-zinc-100/90 px-3 py-1 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            {/* Sisi Kiri: Status Operasional & Garansi */}
            <div className="flex items-center gap-4 overflow-hidden">
              <span className="flex items-center gap-1.5 truncate">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">Toko Offline Mangga Dua:</span>
                <span>Buka 10.00 – 18.00 WIB</span>
              </span>
              <span className="hidden lg:flex items-center gap-1 text-zinc-400 dark:text-zinc-600">|</span>
              <span className="hidden lg:flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3 text-zinc-500" />
                <span>Pricelist Terupdate Hari Ini</span>
              </span>
              <span className="hidden xl:flex items-center gap-1 text-zinc-400 dark:text-zinc-600">|</span>
              <span className="hidden xl:flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>100% Distributor Resmi ID</span>
              </span>
            </div>

            {/* Sisi Kanan: Download Pricelist & WhatsApp Direct */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/katalog"
                className="hidden sm:inline-flex items-center gap-1 font-medium hover:text-blue-600 dark:hover:text-blue-400"
              >
                <FileDown className="h-3 w-3" />
                <span>Download XLS/PDF</span>
              </Link>
              <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700">|</span>
              <a
                href="https://wa.me/6281234567890?text=Halo%20KSS%20Komputer,%20saya%20ingin%20tanya%20stok%20dan%20harga%20terbaru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <PhoneCall className="h-3 w-3" />
                <span>WA Sales: 0812-3456-7890</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. MAIN NAVBAR */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-600 text-white font-mono font-bold text-sm tracking-wider shadow-sm group-hover:bg-blue-700">
                KSS
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    KSS KOMPUTER
                  </span>
                  <span className="rounded-sm border border-blue-500/30 bg-blue-500/10 px-1 py-0.2 font-mono text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                    Pro
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-tight text-zinc-500 dark:text-zinc-400">
                  Hardware &amp; PC Builder Jakarta
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                      isActive
                        ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                        : item.highlight && isMounted && builderPartCount > 0
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-0.5 rounded-sm bg-blue-600 px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                    {item.subBadge && (
                      <span className="hidden xl:inline-block ml-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ({item.subBadge})
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sisi Kanan: Search Trigger Button + Keranjang Drawer Trigger + Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Command Search Trigger (Cmd+K / Ctrl+K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 transition-all sm:w-64 justify-between"
              title="Cari komponen, SKU, atau socket (Ctrl+K)"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="truncate">Cari SKU, socket, GPU...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-300 bg-white px-1 font-mono text-[10px] text-zinc-500 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            {/* Tombol Keranjang Belanja */}
            <button
              onClick={openCart}
              className="relative inline-flex items-center justify-center rounded-sm border border-zinc-200 bg-white p-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Buka Keranjang Belanja"
            >
              <ShoppingBag className="h-4 w-4" />
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-blue-600 px-1 font-mono text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center rounded-sm border border-zinc-200 bg-white p-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* 3. MOBILE MENU COLLAPSIBLE */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <nav className="flex flex-col gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-sm px-3 py-2 text-xs font-semibold ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="rounded-sm bg-blue-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono">Mangga Dua Mall Lt. 4</span>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-medium text-emerald-600 dark:text-emerald-400"
              >
                0812-3456-7890
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Search Modal */}
      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

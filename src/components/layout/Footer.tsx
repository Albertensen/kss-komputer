import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Wrench,
  Headphones,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';

export function Footer() {
  const currentYear = 2025;

  const distributors = [
    { name: 'PT Astrindo Senayasa', brands: 'ASUS, Intel, ASRock' },
    { name: 'PT EMD Pratama', brands: 'AMD, Sapphire' },
    { name: 'PT Nusantara Jaya Teknologi (NJT)', brands: 'Gigabyte, Kingston' },
    { name: 'PT WPG Indonesia', brands: 'Corsair, MSI, Lexar' },
    { name: 'PT Synnex Metrodata', brands: 'Samsung, HP, Dell' },
    { name: 'PT Cahaya Distribusi', brands: 'Thermalright, Tecware' },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-100/90 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
      {/* 1. HIGHLIGHT SERVICE & VALUE BAR */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                100% Garansi Resmi ID
              </div>
              <div className="text-[11px] text-zinc-500">
                Semua part bersegel distributor resmi Indonesia
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                Quality Assembly &amp; Test
              </div>
              <div className="text-[11px] text-zinc-500">
                Cable management rapi, stress test &amp; update BIOS gratis
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                Packing Kayu &amp; Asuransi
              </div>
              <div className="text-[11px] text-zinc-500">
                Aman dikirim ke seluruh wilayah Nusantara
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                Konsultasi &amp; RMA Cepat
              </div>
              <div className="text-[11px] text-zinc-500">
                Bantuan klaim garansi toko langsung di Mangga Dua
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Profil Toko & Kontak */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-600 text-white font-mono font-bold text-xs tracking-wider">
                KSS
              </div>
              <span className="font-mono text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                KSS KOMPUTER
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Toko retail &amp; perakitan komputer spesialis gaming, workstation, dan render profesional berstandar industri dengan harga transparan dan kompetitif.
            </p>

            <div className="mt-1 flex flex-col gap-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  Mangga Dua Mall Lt. 4 Blok A No. 12-14, Sawah Besar, Jakarta Pusat 10730
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Senin – Sabtu: 10.00 – 18.00 WIB (Minggu Libur)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <a
                  href="https://wa.me/6281234567890"
                  className="font-mono font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  WhatsApp: 0812-3456-7890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="font-mono">sales@ksskomputer.id</span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Navigasi Sistem */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              Navigasi Cepat
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link href="/katalog" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Katalog &amp; Pricelist Lengkap
                </Link>
              </li>
              <li>
                <Link href="/simulasi" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Simulasi Rakitan PC Interaktif
                </Link>
              </li>
              <li>
                <Link href="/paket-rakitan" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Paket PC Siap Pakai (Prebuilt)
                </Link>
              </li>
              <li>
                <Link href="/bandingkan" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Komparasi Hardware (Side-by-Side)
                </Link>
              </li>
              <li>
                <Link href="/admin/pricelist" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Portal Admin &amp; Update Pricelist
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Partner Distributor Resmi */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              Distributor Resmi
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {distributors.map((dist) => (
                <div key={dist.name} className="border-b border-zinc-200/60 pb-1.5 dark:border-zinc-800/60">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">
                    {dist.name}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">
                    {dist.brands}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom 4: Syarat Garansi & Pembayaran */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              Kebijakan &amp; Pembayaran
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Garansi 1 to 1 Replacement (7 Hari Pertama Toko)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Bebas biaya rakitan dan instalasi OS trial</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Dukungan faktur pajak untuk pengadaan kantor (PT/CV)</span>
              </li>
            </ul>

            <div className="mt-4">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Metode Pembayaran
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {['BCA Transfer', 'Mandiri', 'QRIS', 'Tokopedia', 'Shopee'].map((pay) => (
                  <span
                    key={pay}
                    className="rounded-sm border border-zinc-200 bg-white px-1.5 py-0.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUB-FOOTER BOTTOM BAR */}
      <div className="border-t border-zinc-200 bg-zinc-200/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 text-[11px] text-zinc-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-mono text-center sm:text-left">
            &copy; {currentYear} KSS Komputer Jakarta. Seluruh hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>Next.js 16 App Router</span>
            <span>&bull;</span>
            <span>Turbopack Engine</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Pricelist Engine v2.4 Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

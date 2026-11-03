# AGENT RULES & ANTI-AI-SLOP DESIGN SYSTEM

Dokumen ini adalah instruksi sistem wajib bagi AI Agent. Setiap baris kode dan komponen UI yang Anda buat **WAJIB** mematuhi seluruh aturan di bawah ini tanpa terkecuali.

---

## 1. PROTOKOL EKSEKUSI KODE (UNTuk AI AGENT)

1. **Eksekusi Bertahap (Atomic Execution)**:
   - Jangan mencoba mengerjakan seluruh fase di `ROADMAP.md` dalam satu kali jalan.
   - Kerjakan **maksimal 1 hingga 2 item `[ ]`** per giliran, pastikan kode komplit, bebas *error* TypeScript, lalu ubah tanda `[ ]` menjadi `[x]` di `ROADMAP.md`.
2. **Dilarang Menulis Placeholder / Komentar Malas**:
   - **DILARANG KERAS** menulis komentar seperti `// TODO: implement later`, `// ... rest of the code`, atau `// tambahkan produk lainnya di sini`.
   - Tulis seluruh logika, komponen, dan data *mock* secara utuh dan fungsional.
3. **Konsistensi Tipe Data**:
   - Selalu impor dan patuhi kontrak tipe dari `src/lib/types.ts` sesuai yang didefinisikan di `ARCHITECTURE.md`. Jangan membuat tipe duplikat di dalam file komponen.

---

## 2. ATURAN VISUAL MUTLAK: ANTI-"AI SLOP"

Website toko komputer harus terlihat seperti alat teknis profesional (**PCPartPicker**, **Enterkomputer**, **Linear**, **Vercel Dashboard**), BUKAN *landing page* SaaS hasil *template* AI.

### A. Elemen yang DILARANG KERAS (Forbidden Patterns)
- **DILARANG** menggunakan gradien dekoratif: Jangan pernah memakai `bg-gradient-to-r`, `from-purple-500`, `via-pink-500`, `to-cyan-500`, atau teks bergradien.
- **DILARANG** menggunakan efek kabur berlebihan: Hindari kartu `backdrop-blur-xl` dengan `bg-white/10` yang menurunkan keterbacaan teks spesifikasi.
- **DILARANG** menggunakan sudut membulat besar: Jangan pernah memakai `rounded-2xl`, `rounded-3xl`, atau `rounded-full` (kecuali untuk indikator titik status kecil `w-2 h-2`).
- **DILARANG** membuat *Hero Section* promosi raksasa: Halaman utama (`src/app/page.tsx`) tidak boleh memiliki banner kosong setinggi layar penuh (`min-h-screen`). Pengguna yang membuka web harus langsung melihat *Search Bar*, *Kategori Komponen*, dan *Tabel Pricelist / Simulasi*.
- **DILARANG** menggunakan bayangan tebal atau *glow*: Hindari `shadow-xl`, `shadow-2xl`, atau `shadow-blue-500/50`.
- **DILARANG** membuat testimoni karangan ("Budi - Gamer Profesional") atau angka statistik palsu.

### B. Standar Desain yang WAJIB DIGUNAKAN (Required Patterns)
- **Batas & Sudut (Borders & Radii)**:
  - Gunakan `rounded-none`, `rounded-sm` (`2px`), atau maksimal `rounded-md` (`6px`).
  - Gunakan garis batas tegas `1px solid`: `border border-zinc-200 dark:border-zinc-800`.
- **Palet Warna Industrial**:
  - **Background Utama**: `bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`
  - **Surface / Kartu / Tabel**: `bg-white dark:bg-zinc-900`
  - **Surface Hover / Baris Tabel Genap**: `hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60`
  - **Aksen Fungsional Tunggal**: Gunakan **Signal Blue** (`bg-blue-600 hover:bg-blue-700 text-white`) atau **Industrial Orange** (`bg-orange-600 hover:bg-orange-700 text-white`) khusus untuk tombol aksi utama (CTA).
  - **Warna Status Semantik**:
    - *Ready Stock / Kompatibel*: `text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20`
    - *Stok Menipis / Peringatan BIOS*: `text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20`
    - *Stok Habis / Tidak Kompatibel*: `text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20`
- **Tipografi Teknis & Angka**:
  - Semua harga (`Rp`), kode SKU, kapasitas memori (`16GB`, `1TB`), frekuensi (`6000MHz`), dan angka daya (`750W`) **WAJIB** menggunakan class:
    `font-mono tabular-nums tracking-tight`
  - Hal ini memastikan seluruh digit harga sejajar lurus secara vertikal saat ditampilkan di dalam tabel *pricelist* maupun daftar simulasi.
- **Kepadatan Informasi (High Density)**:
  - Gunakan padding kompak pada tabel dan baris komponen (`py-2 px-3` atau `py-2.5 px-4`).
  - Tampilkan *Technical Spec Badges* langsung di bawah/samping nama produk menggunakan bentuk kotak ringkas:
    `inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-sm`

---

## 3. STANDAR LOKALISASI INDONESIA

1. **Format Rupiah**:
   - Selalu gunakan *helper* `formatIDR(number)` yang menghasilkan `Rp 2.450.000` (menggunakan titik sebagai pemisah ribuan, tanpa `,00` di belakang).
2. **Terminologi Toko Komputer Indonesia**:
   - Gunakan istilah yang akrab bagi pembeli hardware di Indonesia:
     - **"Simulasi Rakitan"** (bukan sekadar *Builder*)
     - **"Pricelist Katalog"** (untuk tampilan tabel padat)
     - **"Garansi Resmi"** (misal: *Garansi Resmi 3 Tahun*)
     - **"Ready Stock"** / **"Stok Terbatas"** / **"Habis"** / **"Pre-Order"**
     - **"Cetak Penawaran (PDF)"** & **"Pesan via WhatsApp"**
# AGENT RULES & ANTI-AI-SLOP DESIGN SYSTEM — KSS KOMPUTER

Dokumen ini adalah instruksi operasional mutlak bagi Anda sebagai **Single-Agent Full-Stack Developer (Antigravity)**. Setiap baris kode, arsitektur data, dan antarmuka UI wajib mematuhi seluruh aturan di bawah ini.

---

## 1. PROTOKOL EKSEKUSI TUNGGAL (SINGLE-AGENT DIRECT EXECUTION)

1. **Mandiri Penuh & Tanpa Delegasi**:
   - Seluruh kode ditulis, diperiksa, dan dijalankan langsung oleh Anda sendiri.
   - **JANGAN PERNAH** mendelegasikan tugas ke sub-agent (`planner`, `scout`, `worker`, `reviewer`).
2. **Kode Komplit Tanpa Placeholder**:
   - **DILARANG KERAS** menulis kode malas seperti `// TODO: implement later`, `// ... rest of the code`, atau `// tambahkan komponen lainnya di sini`.
   - Semua fungsi, data mock, komponen antarmuka, dan validasi harus ditulis utuh dan siap pakai.
3. **Siklus Eksekusi & Git Workflow**:
   - Setiap menyelesaikan 1 Fase atau sub-tugas:
     1. Jalankan `npx tsc --noEmit` dan pastikan 0 error TypeScript.
     2. Ubah checklist `[ ]` menjadi `[x]` di `ROADMAP.md`.
     3. Jalankan `git add .`, `git commit -m "..."`, dan `git push origin main`.

---

## 2. PRINSIP DESAIN INDUSTRIAL MODERN (ANTI-AI-SLOP)

KSS Komputer dibangun dengan identitas **Modern System Integrator** profesional (seperti Aftershock PC, Linear, dan PCPartPicker). Tampilan harus teknis, padat informasi, bersih, dan berwibawa.

### A. Elemen yang DILARANG KERAS (Forbidden Patterns)
- **DILARANG** menggunakan gradien dekoratif: Tidak boleh memakai `bg-gradient-to-*`, `from-purple-500`, `to-pink-500`, atau teks pelangi.
- **DILARANG** menggunakan efek blur kaca berlebihan: Hindari `backdrop-blur-xl` dengan `bg-white/10` yang mengaburkan teks spesifikasi hardware.
- **DILARANG** menggunakan sudut membulat berlebihan: Tidak boleh memakai `rounded-2xl`, `rounded-3xl`, atau `rounded-full` (kecuali untuk dot status lampu indikator `w-2 h-2`).
- **DILARANG** bayangan tebal / neon: Hindari `shadow-2xl` atau `shadow-blue-500/50`.
- **DILARANG** membuat *Hero Banner* raksasa: Pengunjung yang membuka website harus langsung melihat katalog paket rakitan PC, filter kebutuhan, atau ringkasan spesifikasi.
- **DILARANG** menampilkan testimoni fiktif atau angka statistik karangan.

### B. Standar Visual yang WAJIB DIGUNAKAN (Required Patterns)
- **Batas & Sudut (Borders & Radii)**:
  - Gunakan `rounded-none`, `rounded-sm` (2px), atau maksimal `rounded-md` (6px).
  - Garis batas tegas `1px solid`: `border border-zinc-200 dark:border-zinc-800`.
- **Palet Warna Industrial**:
  - **Latar Belakang**: `bg-white dark:bg-zinc-950`
  - **Surface / Kartu / Slot**: `bg-zinc-50 dark:bg-zinc-900`
  - **Surface Hover**: `hover:bg-zinc-100 dark:hover:bg-zinc-800/80`
  - **Aksen CTA Tunggal**: **Signal Blue** (`bg-blue-600 hover:bg-blue-700 text-white`) atau **Industrial Orange** (`bg-orange-600 hover:bg-orange-700 text-white`).
  - **Indikator Status Semantik**:
    - *Kompatibel / Ready*: `text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20`
    - *Delta Tambahan (+)*: `text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20`
    - *Delta Pengurangan (-)*: `text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20`
    - *Peringatan / Incompatible*: `text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20`
- **Tipografi Angka & Kode Teknis**:
  - Semua harga (`Rp`), selisih upgrade/downgrade (`+ Rp` / `- Rp`), konsumsi daya (`Watt`), frekuensi (`MHz`), dan kode SKU **WAJIB** memakai:
    `font-mono tabular-nums tracking-tight`
- **Ikon**:
  - Gunakan `lucide-react` dengan ukuran kompak `w-3.5 h-3.5` atau `w-4 h-4`.

---

## 3. ATURAN BISNIS MUTLAK: HIDDEN PART PRICE & DELTA PRICING

1. **Bukan Toko Part Eceran**:
   - KSS Komputer menjual **PC Rakitan Jadi Siap Pakai** dan **Layanan Jasa Komputer**.
   - **DILARANG MENAMPILKAN HARGA SATUAN KOMPONEN KEPADA PENGUNJUNG UMUM**.
2. **Delta Pricing pada Konfigurator & Quick Upgrader**:
   - Saat pembeli mengganti atau meng-upgrade part, antarmuka hanya menampilkan selisih harga terhadap komponen bawaan:
     - `[Termasuk dalam Paket]` (jika komponen standar paket)
     - `[+ Rp 650.000]` (jika upgrade ke komponen lebih tinggi)
     - `[- Rp 250.000]` (jika memilih opsi lebih ekonomis)
3. **Harga Publik**:
   - Hanya **Total Harga Paket Rakitan Jadi** (yang telah mengakumulasi `sellPrice` part, markup, dan `assemblyFee`) yang ditampilkan secara utuh kepada pengguna.
4. **Integrasi Multi-Channel**:
   - Tautan toko resmi Tokopedia: `https://tk.tokopedia.com/ZSpeToWkH/`
   - WhatsApp Admin: Format pesan pesanan rapi memuat rincian spesifikasi lengkap dan total harga paket tanpa membeberkan rincian modal part.

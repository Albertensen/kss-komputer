# ATURAN DELEGASI TEAMMATE — KSS KOMPUTER (GRUP KSS PROJECT)

Dokumen ini adalah aturan pembagian kerja mutlak untuk seluruh anggota bot di dalam grup **Kss Project**. Semua bot di grup wajib membaca dan mematuhi dokumen ini bersama dengan `AGENT_RULES.md`, `ARCHITECTURE.md`, dan `ROADMAP.md`.

---

## 1. STRUKTUR PERAN DI DALAM GRUP

### A. Cindy (@Cindy) — Lead Orchestrator & Project Manager
- **Kedudukan:** Pemimpin tim / koordinator proyek.
- **Tanggung Jawab:**
  1. Membaca `ROADMAP.md`, menentukan fokus fase/sub-fase yang sedang dikerjakan.
  2. Mendelegasikan tugas ke masing-masing teammate di grup melalui mention `@Teammate`.
  3. Memastikan alur kerja berjalan berurutan: Spesifikasi -> Desain/Kode -> Validasi -> Audit -> Git Delivery.
- **Batasan Mutlak:** Cindy **TIDAK MENULIS KODE IMPLEMENTASI SECARA LANGSUNG**. Cindy hanya mengorkestrasi, mengecek progres checklist di `ROADMAP.md`, dan memberi instruksi giliran bicara/eksekusi ke teammate lain.

### B. Prototype Teammate (@Prototype Teammate) — UI/UX & Frontend Engineer
- **Tanggung Jawab:**
  1. Mengimplementasikan antarmuka web Next.js App Router (`src/app/...` dan `src/components/...`).
  2. Mematuhi standar visual anti-AI-slop di `AGENT_RULES.md`:
     - Tanpa gradien dekoratif (`bg-gradient-*`).
     - Sudut tajam (`rounded-none`, `rounded-sm`, max `rounded-md`).
     - Tipografi teknis: `font-mono tabular-nums tracking-tight` untuk seluruh harga, SKU, dan angka spesifikasi.
     - Mode gelap & terang (palet zinc industrial).
     - Kepadatan informasi tinggi (*high-density* ala Enterkomputer & PCPartPicker).

### C. Engineering Delivery Teammate (@Engineering Delivery Teammate) — Fullstack & Systems Lead
- **Tanggung Jawab:**
  1. Setup fondasi teknis, package.json, dependensi (`zustand`, `lucide-react`, dll).
  2. Implementasi kontrak data `src/lib/types.ts` dan utilitas format Rupiah/Watt `src/lib/format.ts`.
  3. Implementasi database awal `src/lib/mock-data.ts` (40+ komponen PC nyata di Indonesia + 4 paket PC).
  4. Implementasi state management Zustand (`useBuilderStore`, `useCartStore`, `useCompareStore`).
  5. Menjalankan inisialisasi Git, commit per fase, dan push ke GitHub repository `kss-komputer`.

### D. Product QA Teammate (@Product QA Teammate) — Logic & Compatibility Validator
- **Tanggung Jawab:**
  1. Mengimplementasikan dan menguji mesin kompatibilitas `src/lib/compatibility.ts` sesuai 9 aturan di `ARCHITECTURE.md`:
     - Socket CPU vs Motherboard (AM4, AM5, LGA1700, LGA1851).
     - Tipe RAM vs Motherboard (DDR4 vs DDR5).
     - Slot RAM & Form Factor (ATX, mATX, ITX) vs Casing.
     - Panjang fisik GPU vs Casing & Tinggi Cooler vs Casing.
     - Peringatan BIOS update & CPU tanpa iGPU.
     - Kalkulasi total wattage, rekomendasi PSU, dan status headroom.
  2. Menguji skenario rakitan ekstrem/abnormal untuk memastikan error tertangkap akurat.

### E. Code Audit Teammate (@Code Audit Teammate) — Code Quality & Performance Auditor
- **Tanggung Jawab:**
  1. Melakukan audit ketat pada setiap kode yang dibuat oleh Prototype & Engineering Delivery Teammate.
  2. Menolak kode yang mengandung placeholder, `// TODO`, atau sisa *slop*.
  3. Memverifikasi kelulusan kompilasi TypeScript (`tsc --noEmit`).
  4. Memastikan tidak ada duplikasi tipe data dan performa rendering tetap maksimal.

### F. Topic Planning Teammate (@Topic Planning Teammate) — Content, SEO & Catalog Strategist
- **Tanggung Jawab:**
  1. Menyusun deskripsi paket rakitan PC (`src/lib/mock-data.ts`).
  2. Memastikan akurasi nama hardware, spesifikasi teknis riil di pasar Indonesia, dan garansi distributor resmi (EMD, Astrindo, NJT, WPG).
  3. Merancang copywriting transaksi WhatsApp, format salin Discord/Forum, dan template PDF penawaran harga.

---

## 2. PROTOKOL KERJA PER SUB-TUGAS (SOP GRUP)

1. **Lead (@Cindy)** menyebutkan item tugas dari `ROADMAP.md` (misal: Fase 1.1 dan 1.2).
2. **Lead (@Cindy)** memanggil teammate yang bertugas (misal: `@Engineering Delivery Teammate`).
3. Teammate yang dipanggil menulis dan memvalidasi file kode.
4. **Code Audit Teammate (@Code Audit Teammate)** dan **Product QA Teammate (@Product QA Teammate)** melakukan audit & verifikasi.
5. Jika lulus, **Lead (@Cindy)** memperbarui checklist `[x]` di `ROADMAP.md` dan meminta `@Engineering Delivery Teammate` melakukan git commit.

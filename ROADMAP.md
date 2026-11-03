# MASTER ROADMAP & EXECUTION CHECKLIST — KSS KOMPUTER

Panduan eksekusi bertahap untuk Single-Agent Antigravity. Setiap menyelesaikan sub-tugas dan memastikan lolos uji TypeScript (`npx tsc --noEmit`), ubah `[ ]` menjadi `[x]`.

---

## FASE 1: Fondasi Tipe Data, Kalkulator Markup & Data Paket Rakitan
Target: Menyiapkan kontrak TypeScript model bisnis System Integrator, utilitas format delta price, dan database 45+ part + 6 paket PC rakitan jadi + 4 layanan jasa.

- [x] **1.1 Buat `src/lib/types.ts`**:
  - Kontrak TypeScript untuk `HardwarePart` (dengan `costPrice`, `sellPrice`, `wattage`, `specs` kompatibilitas), `PrebuiltPC` (paket PC jadi, target resolusi gaming/kerja, estimasi FPS, link Tokopedia), dan `ServicePackage` (layanan jasa).
- [x] **1.2 Buat `src/lib/format.ts`**:
  - Fungsi `formatIDR(amount)` (`Rp 8.500.000`), `formatDeltaIDR(diff)` (`+ Rp 450.000` / `- Rp 200.000` / `Standar`), link konstan Tokopedia `https://tk.tokopedia.com/ZSpeToWkH/`, dan generator pesan checkout WhatsApp berisi rincian spesifikasi rakitan tanpa harga satuan per part (hanya total harga paket).
- [x] **1.3 Buat `src/lib/mock-data.ts`**:
  - 45+ komponen hardware nyata di pasar Indonesia lengkap dengan `costPrice` dan `sellPrice` (sudah di-markup).
  - 6 Paket PC Rakitan Siap Pakai (PC Kasir/Office Hemat, Gaming E-Sports 1080p, Gaming AAA 1080p Rata Kanan, Creator & Rendering 1440p, Workstation AI/3D, Sultan 4K Rig).
  - 4 Layanan Jasa KSS Komputer (Jasa Rakit Full Custom & Cable Management, Jasa Upgrade & Optimasi PC, Jasa Deep Cleaning & Repaste Thermal, Konsultasi Rakitan sesuai Budget).

---

## FASE 2: Compatibility Engine & Zustand State (Builder & Markup Store)
Target: Membangun mesin validasi kompatibilitas, perhitungan delta price, dan state management builder & admin pricing.

- [x] **2.1 Buat `src/lib/compatibility.ts`**:
  - Validasi socket, RAM, form factor, dimensi GPU, peringatan BIOS, kalkulasi total Watt, dan fungsi `calculateBundleTotal(parts, assemblyFee, globalMarkupPercent)`.
- [x] **2.2 Buat `src/store/useBuilderStore.ts`**:
  - Menyimpan komponen rakitan aktif, fungsi `loadPrebuilt(pkg)`, `selectPart(slot, part)`, `getDeltaPrice(slot, candidatePart)`, serta perhitungan total harga bundel otomatis (persist di `localStorage`).
- [x] **2.3 Buat `src/store/useAdminStore.ts`**:
  - Menyimpan pengaturan global markup (`globalMarkupPercent`), `defaultAssemblyFee`, serta kemampuan mengedit modal (`costPrice`) dan harga jual (`sellPrice`) secara langsung.

---

## FASE 3: Layout Global, Navbar & High-Conversion Homepage
Target: Antarmuka utama berdensitas tinggi, navigasi langsung ke Tokopedia & WA, dan homepage siap konversi.

- [ ] **3.1 Buat `src/components/layout/Navbar.tsx` & `Footer.tsx`**:
  - Navigasi padat berisi pintasan ke **Paket PC Rakitan**, **Custom Configurator**, **Layanan Jasa**, badge ringkasan harga rakitan aktif, dan tombol langsung ke **Tokopedia Resmi (`https://tk.tokopedia.com/ZSpeToWkH/`)**.
- [ ] **3.2 Buat `src/app/page.tsx`**:
  - Header fungsional padat dengan filter cepat berdasarkan kebutuhan (*Gaming 1080p*, *Gaming 1440p*, *Editing & Render*, *Office & Kasir*).
  - Grid **Paket PC Rakitan Terlaris** lengkap dengan daftar spek inti, bar estimasi FPS (Valorant, Cyberpunk 2077, GTA V), Total Harga Paket, tombol **Kustomisasi Spek**, dan tombol **Beli via Tokopedia / WA**.
  - Seksi **Layanan Jasa & Keunggulan KSS Komputer** (Garansi Resmi, Stress-Tested sebelum kirim, Cable Management Rapi, Packing Kayu Aman).

---

## FASE 4: Katalog Paket Rakitan & Halaman Quick-Upgrade
Target: Menampilkan katalog rakitan lengkap dan pengalaman upgrade spek instan dengan selisih harga.

- [ ] **4.1 Buat `src/app/paket-rakitan/page.tsx`**:
  - Katalog seluruh PC Rakitan Jadi dengan filter budget (di bawah 7 Juta, 7–12 Juta, 12–20 Juta, >20 Juta), filter platform (`AMD Ryzen` vs `Intel Core`), dan pengurutan harga.
- [ ] **4.2 Buat `src/app/paket-rakitan/[slug]/page.tsx`**:
  - Halaman detail Paket PC dengan fitur **Quick Spec Upgrader** (user bisa klik ganti kapasitas RAM/SSD/VGA dari opsi kompatibel, melihat selisih `+ Rp xxx.xxx`, dan melihat Total Harga Paket ter-update otomatis) + tombol Checkout Tokopedia & WhatsApp.

---

## FASE 5: Custom PC Configurator (`/simulasi`) Tanpa Harga Eceran
Target: Pengalaman merakit PC impian tanpa membocorkan modal atau harga satuan per part.

- [ ] **5.1 Buat `src/app/simulasi/page.tsx` beserta komponen slot & drawer pemilih komponen**:
  - Menampilkan baris slot (`Processor`, `Motherboard`, `Cooler`, `RAM`, `SSD NVMe`, `HDD`, `VGA / GPU`, `PSU`, `Casing`, `Monitor`).
  - Di dalam drawer pemilih komponen: otomatis memfilter hanya komponen yang kompatibel (misal CPU AM5 hanya memunculkan Mobo AM5 & RAM DDR5) dan menampilkan badge **Delta Price (`+ Rp xxx.xxx` / `- Rp xxx.xxx`)**—bukan harga satuan part.
  - Sticky Telemetry Bar yang menampilkan: Status `100% Kompatibel`, Estimasi Daya (`Watt`), dan **Total Harga Rakitan Jadi** (sudah termasuk markup & jasa rakit).
  - Fitur **Cetak Quotation Resmi (PDF/Print View)**, **Salin Spesifikasi Rakitan**, **Pesan via WhatsApp**, dan **Request Link Checkout Tokopedia**.

---

## FASE 6: Halaman Layanan Jasa (`/jasa`) & Admin Markup Panel (`/admin/pricing`)
Target: Menawarkan jasa service/upgrade profesional dan kontrol penuh pricing bagi pemilik toko.

- [ ] **6.1 Buat `src/app/jasa/page.tsx`**:
  - Katalog layanan jasa rakit, maintenance, cleaning, dan upgrade PC dengan estimasi biaya jasa transparan dan tombol booking jadwal via WhatsApp.
- [ ] **6.2 Buat `src/app/admin/pricing/page.tsx`**:
  - Panel bergaya spreadsheet untuk pemilik KSS Komputer guna mengatur `costPrice` (modal), mengatur persentase `Markup (%)` otomatis atau manual, mengatur `Biaya Rakit`, melihat estimasi profit per rakitan, dan mengedit link Tokopedia.

# MASTER ROADMAP & EXECUTION CHECKLIST

**Instruksi untuk AI Agent**:
1. Baca `AGENT_RULES.md` dan `ARCHITECTURE.md` terlebih dahulu.
2. Kerjakan item dengan tanda `[ ]` secara berurutan dari Fase 1 hingga Fase 7.
3. Setiap menyelesaikan satu item dan memastikan tidak ada *compile/type error*, ubah tanda `[ ]` menjadi `[x]` di dalam file ini.

---

## FASE 1: FONDASI TIPE DATA, UTILITAS & DATABASE MOCK REALISTIS
Target: Menyiapkan kontrak data yang kuat dan 40+ komponen PC nyata di pasar Indonesia.

- [x] **1.1 Buat `src/lib/types.ts`**:
  - Implementasikan seluruh *interface* dan *type* sesuai spesifikasi di `ARCHITECTURE.md` (`ProductCategory`, `ProductSpecs`, `Product`, `BuildSelections`, `CompatibilityReport`, `PrebuiltTemplate`).
- [x] **1.2 Buat `src/lib/format.ts`**:
  - Buat `formatIDR(amount: number): string` yang menghasilkan format `Rp 2.450.000` (tanpa desimal `,00`).
  - Buat `formatWatt(watt: number): string` yang menghasilkan `${watt}W`.
  - Buat `generateWhatsAppBuildUrl(phone: string, items: SelectedBuildItem[], totalPrice: number, options: { assembleService: boolean; notes?: string }): string` yang menyusun teks pesanan rapi untuk dikirim ke WhatsApp Admin.
  - Buat `generateBuildPlainText(items: SelectedBuildItem[], totalPrice: number, totalWattage: number): string` untuk fitur *Copy to Clipboard* (format tabel teks/markdown untuk Discord & Forum).
- [x] **1.3 Buat `src/lib/mock-data.ts`**:
  - Buat minimal **40 produk hardware nyata** dengan harga Rupiah akurat dan `specs` lengkap yang mencakup semua 11 kategori:
    - **CPU**: AMD Ryzen 5 7500F (AM5), Ryzen 7 7800X3D (AM5), Ryzen 7 9700X (AM5), Ryzen 5 5600 (AM4), Intel Core i5-12400F (LGA1700), Core i5-14400F (LGA1700), Core i7-14700K (LGA1700).
    - **Motherboard**: ASRock B650M Pro RS (AM5, DDR5, mATX), MSI MAG B650 Tomahawk WiFi (AM5, DDR5, ATX), ASRock B550M Pro4 (AM4, DDR4, mATX), MSI PRO B760M-A WiFi DDR4 (LGA1700, DDR4, mATX), ASUS TUF Gaming B760M-PLUS WiFi II (LGA1700, DDR5, mATX).
    - **RAM**: TEAMGROUP T-Force Delta RGB 32GB (2x16GB) DDR5-6000 CL30, Kingston Fury Beast 16GB (2x8GB) DDR5-5600, Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200, G.Skill Ripjaws V 32GB (2x16GB) DDR4-3600.
    - **GPU**: NVIDIA GeForce RTX 4060 8GB, RTX 4060 Ti 16GB, RTX 4070 Super 12GB, RTX 4080 Super 16GB, AMD Radeon RX 6600 8GB, RX 7700 XT 12GB, RX 7800 XT 16GB (lengkap dengan `gpuLengthMm` dan `wattage`).
    - **SSD & HDD**: Samsung 990 PRO 1TB NVMe PCIe 4.0, TEAMGROUP MP44L 1TB NVMe PCIe 4.0, ADATA Legend 850 Lite 512GB, Seagate Barracuda 2TB SATA III.
    - **PSU**: Super Flower Leadex III Gold 750W Full Modular, Corsair RM850e 850W 80+ Gold, MSI MAG A650BN 650W 80+ Bronze, FSP HV PRO 550W 80+ Bronze.
    - **Casing**: Tecware Timber M (mATX), Lian Li Lancool 216 (ATX/E-ATX), Asus Prime AP201 Mesh (mATX), NZXT H6 Flow (ATX) — lengkap dengan `supportedFormFactors` dan `maxGpuLengthMm`.
    - **Cooler, Monitor, & Peripheral**: Thermalright Peerless Assassin 120 SE, DeepCool AK400, LG UltraGear 24GS60F 24" 180Hz IPS 1080p, MSI G274QPF E2 27" 180Hz IPS 1440p, VortexSeries Mechanical Keyboard, Logitech G Pro X Superlight.
  - Buat **4 `PrebuiltTemplate`** siap pakai (PC Kere Hore 1080p ~7 Juta, Sweetspot AM5 1080p/1440p ~13 Juta, High-Refresh 1440p ~21 Juta, Workstation & 4K Sultan ~34 Juta).

---

## FASE 2: ENGINE KOMPATIBILITAS & STATE MANAGEMENT (ZUSTAND)
Target: Membangun logika validasi PC Builder, keranjang, dan komparasi produk.

- [x] **2.1 Buat `src/lib/compatibility.ts`**:
  - Implementasikan fungsi `validateBuild(selections: BuildSelections): CompatibilityReport` sesuai dengan 9 aturan di `ARCHITECTURE.md`.
  - Buat fungsi `isProductCompatibleWithCurrentBuild(product: Product, selections: BuildSelections): { compatible: boolean; reason?: string }` untuk digunakan oleh filter otomatis di pemilih komponen.
- [x] **2.2 Buat `src/store/useBuilderStore.ts`**:
  - Gunakan `zustand` dengan `persist` (`name: 'pc-builder-storage'`).
  - State: `selections: BuildSelections`, `strictFilterEnabled: boolean`, `assembleService: boolean` (biaya rakit & *cable management* Rp 100.000), `customBuildName: string`.
  - Actions: `addPart(category, product)`, `removePart(category, index)`, `updateQuantity(category, index, qty)`, `clearCategory(category)`, `clearAll()`, `loadTemplate(template: PrebuiltTemplate, allProducts: Product[])`, `toggleStrictFilter()`, `toggleAssembleService()`, `importFromEncodedString(code: string)`, `exportToEncodedString(): string`.
- [x] **2.3 Buat `src/store/useCompareStore.ts` & `src/store/useCartStore.ts`**:
  - `useCompareStore`: State daftar produk yang dibandingkan (maksimal 4 item), action `toggleCompareProduct(product)`, `clearCompare()`.
  - `useCartStore`: State item keranjang belanja reguler, action `addItem(product, qty)`, `addBulkFromBuilder(items: SelectedBuildItem[])`, `removeItem(productId)`, `updateQty(productId, qty)`, `clearCart()`.

---

## FASE 3: LAYOUT GLOBAL, COMMAND SEARCH (`Cmd+K`) & HIGH-DENSITY HOMEPAGE
Target: Antarmuka utama yang cepat, tajam, dan bebas *AI slop*.

- [ ] **3.1 Buat `src/components/catalog/SpecBadges.tsx`**:
  - Komponen pembantu yang menerima `product: Product` dan merender 3-4 *badge* teknis kotak (`font-mono text-[11px]`) secara otomatis sesuai kategorinya (contoh untuk Mobo: `[AM5] [B650] [DDR5] [mATX]`, untuk GPU: `[16GB GDDR6X] [285W] [305mm]`).
- [ ] **3.2 Buat `src/components/layout/CommandSearchModal.tsx`**:
  - Modal pencarian cepat yang dipicu oleh tombol di Navbar atau pintasan keyboard `Cmd+K` / `Ctrl+K`.
  - Mendukung pencarian multi-token (misal pengguna mengetik `"am5 ddr5 msi"` atau `"4060 ti"` langsung memfilter produk berdasarkan nama, SKU, brand, maupun atribut spesifikasi).
  - Dari hasil pencarian, pengguna bisa langsung klik **`+ Simulasi`**, **`+ Keranjang`**, atau membuka halaman detail produk.
- [ ] **3.3 Buat `src/components/layout/Navbar.tsx` & `Footer.tsx`**:
  - **Top Utility Bar tipis**: Jam operasional toko offline/online, indikator *Pricelist Terupdate Hari Ini*, tombol *Download Pricelist*, dan nomor WhatsApp Sales.
  - **Main Navbar**: Logo tegas bergaya teknis, tombol trigger `CommandSearchModal` (`Cari komponen, SKU, atau socket... [Ctrl+K]`), menu navigasi ke:
    1. **Katalog & Pricelist** (`/katalog`)
    2. **Simulasi Rakitan** (`/simulasi`) — lengkap dengan badge *live* jumlah komponen & total Rupiah rakitan saat ini
    3. **Paket PC Rakitan** (`/paket-rakitan`)
    4. **Bandingkan** (`/bandingkan`) — dengan badge jumlah item
    5. **Admin Pricelist** (`/admin/pricelist`)
    6. **Drawer Keranjang Belanja**
- [ ] **3.4 Buat `src/app/page.tsx` (High-Density Homepage)**:
  - **Baris Kategori Cepat (11 Kategori)**: Kotak kompak dengan ikon teknis, nama kategori, jumlah SKU *Ready Stock*, dan harga mulai dari (`Mulai Rp ...`).
  - **Split Action Banner Padat (Bukan Hero Raksasa)**:
    - Kolom Kiri: Status Simulasi Rakitan Aktif milik pengguna (langsung menampilkan ringkasan CPU/GPU yang sedang dirakit atau tombol mulai merakit).
    - Kolom Kanan: Sorotan Paket Rakitan *Value for Money* bulan ini.
  - **Live Pricelist Explorer (Langsung di Homepage)**:
    - Tabel *pricelist* interaktif dengan *tab* cepat (`Semua`, `Processor`, `VGA / GPU`, `Motherboard`, `RAM`, `Turun Harga`) sehingga pengunjung bisa langsung merasakan pengalaman ala Enterkomputer begitu membuka halaman utama.

---

## FASE 4: KATALOG DUAL-VIEW (ENTERKOMPUTER PRICELIST TABLE vs COMPACT GRID)
Target: Halaman katalog dengan pemfilteran spesifikasi teknis yang instan.

- [ ] **4.1 Buat `src/components/catalog/FilterSidebar.tsx`**:
  - Filter berdasarkan Kategori, Status Stok (`Hanya Ready Stock`), Brand, Rentang Harga Minimum/Maksimum, serta filter teknis kontekstual:
    - Socket (`AM5`, `AM4`, `LGA1700`)
    - Tipe RAM (`DDR4`, `DDR5`)
    - Form Factor (`ATX`, `mATX`, `ITX`)
- [ ] **4.2 Buat `src/components/catalog/ProductRowPricelist.tsx` (Mode Tabel Enterkomputer)**:
  - Baris tabel berdensitas tinggi (`border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/70 dark:hover:bg-zinc-900`) yang menampilkan:
    - Kolom 1: SKU (`font-mono text-xs text-zinc-500`) & Brand
    - Kolom 2: Nama Produk (link ke `/produk/[slug]`) + deretan `SpecBadges`
    - Kolom 3: Status Stok (Badge Emerald/Amber/Red) + Garansi
    - Kolom 4: Harga Satuan (`font-mono tabular-nums font-semibold text-right`) + harga coret jika diskon
    - Kolom 5: Tombol Aksi Cepat (`+ Simulasi`, `Compare`, `+ Keranjang`)
- [ ] **4.3 Buat `src/components/catalog/ProductCardCompact.tsx` (Mode Grid Modern)**:
  - Kartu produk dengan sudut tegas (`rounded-md border`), visual representasi komponen teknis yang bersih, `SpecBadges`, indikator daya (`Watt`), harga `font-mono`, dan tombol aksi.
- [ ] **4.4 Buat `src/app/katalog/page.tsx`**:
  - Menggabungkan `FilterSidebar`, bar pencarian instan, *sorter* (`Harga Termurah`, `Harga Termahal`, `Nama A-Z`), dan pengalih tampilan **Tabel Pricelist (Default)** vs **Grid Compact**.

---

## FASE 5: ENGINE SIMULASI RAKITAN PC INTERAKTIF (`/simulasi`)
Target: Halaman *PC Builder* paling presisi dan informatif.

- [ ] **5.1 Buat `src/components/builder/TelemetryBar.tsx`**:
  - Panel *sticky* yang menampilkan:
    1. **Status Kompatibilitas** (Badge Hijau `"100% Kompatibel"` atau Merah/Kuning `"X Masalah Ditemukan"`).
    2. **Estimasi Daya Sistem** (`Total TDP: XXX W` | `Saran PSU Min: XXX W` dengan *progress bar* kapasitas terhadap PSU yang dipilih).
    3. **Total Biaya Rakitan** (`font-mono tabular-nums text-xl font-bold`).
- [ ] **5.2 Buat `src/components/builder/CompatibilityAlert.tsx`**:
  - Menampilkan daftar seluruh *error* dan *warning* dari `validateBuild()` secara spesifik beserta saran perbaikannya (misal: tombol cepat untuk mengganti Motherboard atau Casing yang tidak cocok).
- [ ] **5.3 Buat `src/components/builder/BuilderSlotRow.tsx`**:
  - Merender baris untuk masing-masing dari 11 slot kategori.
  - Mendukung *multi-item* untuk kategori `ram`, `ssd`, `hdd`, dan `peripheral` (pengguna bisa klik `+ Tambah SSD Lain` atau mengatur kuantitas keping RAM).
  - Saat slot kosong, tampilkan petunjuk filter aktif (contoh pada baris Motherboard saat Ryzen 5 7500F sudah terpilih: `"Menampilkan khusus Socket AM5"`).
- [ ] **5.4 Buat `src/components/builder/PartSelectorDrawer.tsx`**:
  - Modal/Drawer lebar saat pengguna menekan `+ Pilih [Kategori]`.
  - Dilengkapi *switch* **"Filter Kompatibel Otomatis"**, pencarian instan, filter brand, urutan harga, dan indikator alasan jika ada komponen yang tidak kompatibel.
- [ ] **5.5 Buat `src/components/builder/QuotationPrintView.tsx` & `src/app/simulasi/page.tsx`**:
  - Integrasikan seluruh komponen simulasi di `src/app/simulasi/page.tsx`.
  - Sediakan panel aksi lengkap:
    - Checkbox **Jasa Rakit Profesional + Cable Management (+Rp 100.000)**
    - Tombol **Pesan Rakitan via WhatsApp** (membuka WA dengan rincian komponen & total harga)
    - Tombol **Masukkan Semua ke Keranjang Belanja**
    - Tombol **Salin Teks Rakitan (Format Discord / Forum)** dengan notifikasi *Copied!*
    - Tombol **Bagikan Link Rakitan** (menyalin URL `/simulasi?build=...` yang memuat konfigurasi yang sama saat dibuka)
    - Tombol **Cetak / Simpan PDF Penawaran Resmi** (`window.print()` dengan *stylesheet* `@media print` bersih berlogo toko, nomor referensi penawaran, dan tabel rincian harga untuk pengadaan kantor/B2B).

---

## FASE 6: FITUR KOMPETITIF TAMBAHAN (PAKET PC, KOMPARASI, MULTI-CHANNEL DETAIL)
Target: Fitur bernilai tambah tinggi yang mengungguli website toko komputer lama.

- [ ] **6.1 Buat `src/app/paket-rakitan/page.tsx`**:
  - Menampilkan 4+ `PrebuiltTemplate` lengkap dengan daftar komponen penyusunnya, total harga *real-time* (dihitung dari harga komponen terbaru), dan bar estimasi FPS pada game populer (*Valorant*, *Cyberpunk 2077*, *Dota 2*).
  - Tombol **"Buka & Edit di Simulasi"** yang memanggil `loadTemplate()` dan mengarahkan pengguna ke `/simulasi` agar bisa mengganti Casing/GPU/RAM sesuai selera.
- [ ] **6.2 Buat `src/components/compare/CompareFloatingBar.tsx` & `src/app/bandingkan/page.tsx`**:
  - Bar melayang di bagian bawah layar saat ada 1–4 produk di `useCompareStore`.
  - Halaman `/bandingkan` menampilkan tabel matriks perbandingan spesifikasi baris demi baris, dengan *highlight* warna hijau pada harga termurah dan spesifikasi teknis yang lebih tinggi.
- [ ] **6.3 Buat `src/app/produk/[slug]/page.tsx`**:
  - Menampilkan detail produk lengkap, tabel seluruh atribut `specs`, informasi garansi distributor resmi, dan status stok.
  - Menyediakan opsi pembelian multi-kanal: **`+ Masukkan ke Simulasi`**, **`+ Keranjang Website`**, **`Beli via WhatsApp`**, serta tombol eksternal **`Beli di Tokopedia`** & **`Beli di Shopee`**.
  - Menampilkan bagian **"Komponen yang 100% Kompatibel"** di bagian bawah halaman (misal: jika sedang membuka detail CPU AM5, tampilkan daftar Motherboard AM5 dan RAM DDR5 yang cocok).

---

## FASE 7: ADMIN SPREADSHEET PRICE & STOCK EDITOR (`/admin/pricelist`)
Target: Alat operasional cepat bagi pemilik toko untuk mengelola harga harian.

- [ ] **7.1 Buat `src/app/admin/pricelist/page.tsx`**:
  - Tabel *spreadsheet* padat seluruh produk dengan kolom input langsung (*inline input*) untuk mengubah `Harga (Rp)`, `Harga Coret`, dan dropdown `Status Stok` (`Ready`, `Stok Terbatas`, `Habis`, `Pre-Order`).
  - Fitur filter berdasarkan kategori/brand, indikator baris yang telah dimodifikasi, tombol **Terapkan Perubahan Harga**, serta fitur **Simulasi Kenaikan/Penurunan Kurs Massal (+/- X%)** dan **Export CSV**.
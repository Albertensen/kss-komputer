# SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATIONS

Dokumen ini mendefinisikan struktur file, kontrak tipe TypeScript, logika validasi kompatibilitas rakitan PC, dan rancangan *state* aplikasi. Gunakan spesifikasi di bawah ini secara persis.

---

## 1. STRUKTUR DIREKTORI TARGET

~~~text
src/
├── app/
│   ├── layout.tsx                  # Root layout dengan Navbar, Sticky Compare Bar, & Footer
│   ├── page.tsx                    # High-density Homepage (Quick Search, Category Bar, Pricelist Preview, Paket PC)
│   ├── katalog/
│   │   └── page.tsx                # Katalog Produk (Toggle Grid View vs Enterkomputer Pricelist Table View)
│   ├── produk/
│   │   └── [slug]/
│   │       └── page.tsx            # Detail Produk, Tabel Spesifikasi Lengkap, Link Tokopedia/Shopee/WA, & Produk Kompatibel
│   ├── simulasi/
│   │   └── page.tsx                # Interactive PC Builder, Wattage Meter, Compatibility Checker, Export PDF/WA/Text
│   ├── paket-rakitan/
│   │   └── page.tsx                # Template Rakitan PC Siap Pakai (1-Click Load ke Simulasi)
│   ├── bandingkan/
│   │   └── page.tsx                # Tabel Perbandingan Spesifikasi (Maksimal 4 Produk)
│   └── admin/
│       └── pricelist/
│           └── page.tsx            # Spreadsheet-style Bulk Price & Stock Editor untuk Pemilik Toko
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── CommandSearchModal.tsx  # Pencarian instan (Cmd+K) multi-keyword
│   │   └── Footer.tsx
│   ├── catalog/
│   │   ├── FilterSidebar.tsx
│   │   ├── ProductRowPricelist.tsx # Baris tabel padat ala Enterkomputer
│   │   ├── ProductCardCompact.tsx  # Kartu grid ringkas dengan spec badges
│   │   └── SpecBadges.tsx          # Renderer badge teknis otomatis per kategori
│   ├── builder/
│   │   ├── TelemetryBar.tsx        # Bar atas/bawah: Total Rp, Estimasi Watt, Status Kompatibilitas
│   │   ├── BuilderSlotRow.tsx      # Baris slot komponen di halaman Simulasi
│   │   ├── PartSelectorDrawer.tsx  # Modal/Drawer pemilih komponen dengan auto-filter kompatibilitas
│   │   ├── CompatibilityAlert.tsx  # Panel rincian error/warning kompatibilitas
│   │   └── QuotationPrintView.tsx  # Komponen khusus cetak penawaran resmi (muncul saat window.print)
│   └── compare/
│       └── CompareFloatingBar.tsx  # Bar melayang di bawah layar saat ada produk di daftar bandingkan
├── lib/
│   ├── types.ts                    # Kontrak utama TypeScript
│   ├── format.ts                   # Utilitas format Rupiah, Watt, Tanggal, dan Generator URL WhatsApp
│   ├── compatibility.ts            # Mesin pemeriksa kompatibilitas rakitan PC (Pure Functions)
│   └── mock-data.ts                # Database awal (40+ produk PC nyata di Indonesia + 4 Paket Rakitan)
└── store/
    ├── useBuilderStore.ts          # Zustand store untuk Simulasi Rakitan (dengan localStorage persist)
    ├── useCartStore.ts             # Zustand store untuk Keranjang Belanja
    └── useCompareStore.ts          # Zustand store untuk Bandingkan Produk
~~~

---

## 2. KONTRAK DATA TYPESCRIPT (`src/lib/types.ts`)

Salin dan implementasikan kontrak ini secara lengkap di `src/lib/types.ts`:

~~~ts
export type ProductCategory =
  | 'cpu'
  | 'motherboard'
  | 'cooler'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'hdd'
  | 'psu'
  | 'case'
  | 'monitor'
  | 'peripheral';

export type StockStatus = 'ready' | 'low' | 'out_of_stock' | 'po';

export type CpuSocket = 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
export type RamType = 'DDR4' | 'DDR5';
export type FormFactor = 'ATX' | 'mATX' | 'ITX' | 'E-ATX';

export interface ProductSpecs {
  // CPU & Motherboard
  socket?: CpuSocket;
  cores?: number;
  threads?: number;
  baseClockGhz?: number;
  boostClockGhz?: number;
  integratedGpu?: boolean;
  chipset?: string;               // contoh: 'B650', 'X670E', 'B760', 'Z790'
  needsBiosUpdateForLatestGen?: boolean;
  cpuGenTag?: 'ryzen-7000' | 'ryzen-9000' | 'ryzen-5000' | 'intel-12-13' | 'intel-14' | 'intel-ultra-200';

  // Memory (RAM) & Motherboard
  ramType?: RamType;
  ramSlots?: number;
  capacityGb?: number;            // contoh: 16, 32, 64
  kitConfiguration?: string;      // contoh: '2x16GB', '2x8GB'
  speedMhz?: number;              // contoh: 6000, 3200
  casLatency?: string;            // contoh: 'CL30', 'CL16'

  // Form Factor & Dimensi (Motherboard, GPU, Case, Cooler)
  formFactor?: FormFactor;
  supportedFormFactors?: FormFactor[]; // untuk Casing
  gpuLengthMm?: number;           // panjang fisik kartu grafis
  maxGpuLengthMm?: number;        // batas panjang GPU pada Casing
  coolerHeightMm?: number;        // tinggi cooler CPU
  maxCoolerHeightMm?: number;     // batas tinggi cooler pada Casing

  // GPU
  vramGb?: number;
  vramType?: string;              // contoh: 'GDDR6', 'GDDR6X'
  recommendedPsuWatt?: number;

  // Storage (SSD / HDD)
  storageInterface?: 'NVMe PCIe 4.0' | 'NVMe PCIe 5.0' | 'NVMe PCIe 3.0' | 'SATA III';
  readSpeedMbps?: number;
  m2Slots?: number;               // jumlah slot M.2 pada Motherboard

  // PSU
  psuWattage?: number;
  efficiencyRating?: '80+ Bronze' | '80+ Gold' | '80+ Platinum' | '80+ White';
  modular?: 'Full Modular' | 'Semi Modular' | 'Non-Modular';

  // Monitor
  screenSizeInch?: number;
  resolution?: '1080p' | '1440p' | '4K';
  refreshRateHz?: number;
  panelType?: 'IPS' | 'VA' | 'OLED' | 'TN';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stockStatus: StockStatus;
  wattage: number;                // Estimasi TDP / konsumsi daya komponen (0 untuk Casing/PSU)
  warrantyYears: number;
  OfficialDistributor?: string;   // contoh: 'EMD', 'Astrindo', 'WPG', 'NJt'
  marketplaceLinks?: {
    tokopedia?: string;
    shopee?: string;
  };
  specs: ProductSpecs;
  updatedAt: string;              // ISO Date atau 'Hari ini, 10:30'
}

export interface SelectedBuildItem {
  product: Product;
  quantity: number;
}

export type BuildSelections = {
  [K in ProductCategory]?: SelectedBuildItem[];
};

export interface CompatibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  affectedCategories: ProductCategory[];
}

export interface CompatibilityReport {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  totalWattage: number;
  recommendedPsuWatt: number;
  psuHeadroomStatus: 'optimal' | 'tight' | 'insufficient' | 'no_psu';
}

export interface PrebuiltTemplate {
  id: string;
  name: string;
  slug: string;
  tier: 'Budget / Office' | '1080p Gaming' | '1440p Sweetspot' | '4K Workstation & AI';
  description: string;
  targetResolution: '1080p' | '1440p' | '4K';
  estimatedFps: {
    game: string;
    fps: number;
  }[];
  items: {
    category: ProductCategory;
    productId: string;
    quantity: number;
  }[];
}
~~~

---

## 3. ATURAN ENGINE KOMPATIBILITAS (`src/lib/compatibility.ts`)

Fungsi `validateBuild(selections: BuildSelections): CompatibilityReport` harus mengevaluasi aturan berikut secara deterministik:

1. **Validasi Socket CPU & Motherboard (`severity: 'error'`)**:
   - Jika `cpu.specs.socket !== motherboard.specs.socket`, keluarkan *Error*:
     `"Socket Tidak Cocok: Processor menggunakan socket [X], sedangkan Motherboard menggunakan socket [Y]."`
2. **Validasi Tipe RAM & Motherboard (`severity: 'error'`)**:
   - Jika `ram.specs.ramType !== motherboard.specs.ramType`, keluarkan *Error*:
     `"Tipe Memori Tidak Kompatibel: Motherboard membutuhkan RAM [X], tetapi RAM yang dipilih adalah [Y]."`
3. **Validasi Jumlah Modul RAM vs Slot Motherboard (`severity: 'error'`)**:
   - Hitung total keping RAM yang dipilih. Jika melebihi `motherboard.specs.ramSlots`, keluarkan *Error*.
4. **Validasi Form Factor Motherboard vs Casing (`severity: 'error'`)**:
   - Jika `motherboard.specs.formFactor` tidak ada di dalam array `case.specs.supportedFormFactors`, keluarkan *Error*:
     `"Ukuran Motherboard Tidak Muat: Casing [Nama Case] hanya mendukung [List], tidak muat untuk motherboard [FormFactor]."`
5. **Validasi Panjang Fisik GPU vs Casing (`severity: 'error'`)**:
   - Jika `gpu.specs.gpuLengthMm > case.specs.maxGpuLengthMm`, keluarkan *Error*:
     `"GPU Terlalu Panjang: Panjang VGA ([X]mm) melebihi ruang maksimal Casing ([Y]mm)."`
6. **Validasi Tinggi Cooler vs Casing (`severity: 'error'`)**:
   - Jika `cooler.specs.coolerHeightMm > case.specs.maxCoolerHeightMm`, keluarkan *Error*.
7. **Peringatan Update BIOS (`severity: 'warning'`)**:
   - Jika `cpu.specs.cpuGenTag === 'ryzen-9000'` atau `'intel-14'` dan `motherboard.specs.needsBiosUpdateForLatestGen === true`, keluarkan *Warning*:
     `"Perlu Update BIOS: Motherboard seri ini mungkin memerlukan Flash BIOS terbaru agar dapat mengenali processor generasi ini (Gratis jasa update BIOS di toko kami)."`
8. **Peringatan CPU Tanpa Integrated GPU (`severity: 'warning'`)**:
   - Jika `cpu.specs.integratedGpu === false` (misal seri F seperti Ryzen 5 7500F atau i5-14400F) dan slot `gpu` masih kosong, keluarkan *Warning*:
     `"Wajib Tambah Kartu Grafis (VGA): Processor ini tidak memiliki GPU terintegrasi (iGPU) sehingga tidak akan menampilkan gambar ke monitor tanpa VGA tambahan."`
9. **Kalkulasi Daya & PSU (`severity: 'error' | 'warning'`)**:
   - `totalWattage` = Jumlah seluruh `product.wattage * quantity` (ditambah *base system overhead* `50W` untuk kipas/motherboard).
   - `recommendedPsuWatt` = `Math.max(450, Math.ceil((totalWattage * 1.35) / 50) * 50)` (atau ambil nilai `gpu.specs.recommendedPsuWatt` jika lebih tinggi).
   - Jika PSU dipilih dan `psu.specs.psuWattage < totalWattage`: keluarkan *Error* (`insufficient`).
   - Jika PSU dipilih dan `psu.specs.psuWattage < recommendedPsuWatt`: keluarkan *Warning* (`tight`).

---

## 4. FILTER OTOMATIS PADA PEMILIH KOMPONEN (`PartSelectorDrawer`)

Saat pengguna membuka pemilih komponen untuk kategori tertentu di `/simulasi` dan opsi `strictFilterEnabled === true`:
- Saat memilih **Motherboard** (dan CPU sudah dipilih): Hanya tampilkan motherboard dengan `specs.socket === cpu.specs.socket`.
- Saat memilih **CPU** (dan Motherboard sudah dipilih): Hanya tampilkan CPU dengan `specs.socket === motherboard.specs.socket`.
- Saat memilih **RAM** (dan Motherboard sudah dipilih): Hanya tampilkan RAM dengan `specs.ramType === motherboard.specs.ramType`.
- Saat memilih **Casing** (dan Motherboard/GPU sudah dipilih): Hanya tampilkan casing yang mendukung `formFactor` motherboard dan memiliki `maxGpuLengthMm >= gpu.specs.gpuLengthMm`.
- Sediakan *switch toggle* yang jelas di bagian atas *drawer*: **"Filter Kompatibel Otomatis (Aktif)"** sehingga pengguna tetap bisa mematikannya jika ingin melihat seluruh katalog.
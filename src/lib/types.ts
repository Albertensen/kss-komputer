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

export interface PartSpecs {
  // CPU & Motherboard
  socket?: CpuSocket;
  cores?: number;
  threads?: number;
  baseClockGhz?: number;
  boostClockGhz?: number;
  integratedGpu?: boolean;
  chipset?: string;               // contoh: 'B650', 'B760', 'Z790', 'A520', 'X670'
  needsBiosUpdateForLatestGen?: boolean;
  cpuGenTag?: 'ryzen-7000' | 'ryzen-9000' | 'ryzen-5000' | 'intel-12-13' | 'intel-14' | 'intel-ultra-200';

  // Memory (RAM) & Motherboard
  ramType?: RamType;
  ramSlots?: number;
  capacityGb?: number;            // kapasitas total per modul/kit (contoh: 16, 32, 64)
  kitConfiguration?: string;      // contoh: '2x16GB', '2x8GB', '1x16GB'
  speedMhz?: number;              // contoh: 6000, 5600, 3200
  casLatency?: string;            // contoh: 'CL30', 'CL16'

  // Form Factor & Dimensi
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
  m2Slots?: number;

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

/**
 * Komponen Hardware Komputer internal KSS Komputer
 * Memiliki costPrice (modal distributor) dan sellPrice (harga jual ber-markup)
 */
export interface HardwarePart {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  costPrice: number;              // Modal rahasia toko (hanya tampil di admin)
  sellPrice: number;              // Harga jual internal dasar
  price: number;                  // Alias untuk sellPrice agar backward-compatible
  originalPrice?: number;         // Harga sebelum diskon promo jika ada
  stockStatus: StockStatus;
  wattage: number;                // TDP konsumsi daya
  warrantyYears: number;
  officialDistributor?: string;   // contoh: 'EMD', 'Astrindo', 'NJT', 'WPG'
  OfficialDistributor?: string;   // alias
  specs: PartSpecs;
  updatedAt: string;
}

// Alias untuk menjaga backward compatibility dengan kode sebelumnya
export type Product = HardwarePart;
export type ProductSpecs = PartSpecs;

/**
 * Paket PC Rakitan Jadi (Siap Pakai) KSS Komputer
 */
export interface PrebuiltPC {
  id: string;
  name: string;
  slug: string;
  tier: string;                   // contoh: '1080p Gaming Sweetspot', '4K Workstation Sultan'
  categoryTag: 'office' | 'gaming-1080p' | 'gaming-1440p' | 'creator' | 'workstation' | 'sultan-4k';
  platform: 'AMD Ryzen' | 'Intel Core';
  description: string;
  highlights: string[];
  targetResolution: '1080p' | '1440p' | '4K' | 'Office';
  estimatedFps: {
    game: string;
    fps: number;
    settings: string;
  }[];
  // Komponen bawaan paket (kategori -> partId & qty)
  baseParts: {
    [K in ProductCategory]?: {
      partId: string;
      quantity: number;
    };
  };
  assemblyFee: number;            // Biaya rakit & garansi toko
  tokopediaUrl: string;           // Direct link ke Tokopedia resmi KSS Komputer
  featured?: boolean;
  warrantyYears: number;          // Garansi unit rakitan toko (misal: 1 atau 2 tahun)
}

// Backward-compatible alias
export type PrebuiltTemplate = PrebuiltPC;

/**
 * Paket Layanan Jasa Komputer KSS Komputer
 */
export interface ServicePackage {
  id: string;
  title: string;
  slug: string;
  price: number;
  duration: string;               // contoh: '1 - 2 Jam', 'Same Day', '1 Hari Kerja'
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;                 // contoh: 'Paling Dicari', 'Best Value'
}

/**
 * Item Rakitan Aktif
 */
export interface SelectedBuildItem {
  part: HardwarePart;
  product?: HardwarePart;         // alias
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

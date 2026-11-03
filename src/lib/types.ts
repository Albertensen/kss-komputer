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
  officialDistributor?: string;   // contoh: 'EMD', 'Astrindo', 'WPG', 'NJT'
  OfficialDistributor?: string;   // alias backward-compatibility
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

import {
  BuildSelections,
  CompatibilityIssue,
  CompatibilityReport,
  HardwarePart,
  ProductCategory,
  SelectedBuildItem,
} from './types';

// Helper mengekstrak HardwarePart dari SelectedBuildItem secara aman
export function getItemPart(item?: SelectedBuildItem): HardwarePart | undefined {
  if (!item) return undefined;
  return item.part || item.product;
}

/**
 * Menghitung total keping RAM fisik dari produk dan kuantitasnya.
 * Mendeteksi konfigurasi kit seperti '2x16GB', '2x8GB', '4x16GB', dsb.
 */
export function getRamModuleCount(ramPart: HardwarePart, quantity: number): number {
  const kitConfig = ramPart.specs.kitConfiguration;
  if (kitConfig) {
    const match = kitConfig.match(/^(\d+)\s*x/i);
    if (match) {
      return parseInt(match[1], 10) * quantity;
    }
  }
  return 1 * quantity;
}

/**
 * Hitung total harga paket rakitan PC jadi
 * Menggunakan sellPrice atau formula costPrice + global markup, ditambah assembly fee
 */
export function calculateBundleTotal(
  parts: (HardwarePart | undefined)[],
  assemblyFee: number = 150000,
  globalMarkupPercent: number = 0
): number {
  let subtotal = 0;

  for (const part of parts) {
    if (!part) continue;

    if (globalMarkupPercent > 0) {
      const markedUp = part.costPrice * (1 + globalMarkupPercent / 100);
      subtotal += Math.round(markedUp);
    } else {
      subtotal += part.sellPrice || part.price || 0;
    }
  }

  return subtotal + Math.max(0, assemblyFee);
}

/**
 * Menghitung Delta Price (selisih harga) antara part kandidat dengan part dasar paket
 * candidate.sellPrice - base.sellPrice
 */
export function calculateDeltaPrice(
  basePart: HardwarePart | undefined,
  candidatePart: HardwarePart
): number {
  const basePrice = basePart ? basePart.sellPrice || basePart.price || 0 : 0;
  const candidatePrice = candidatePart.sellPrice || candidatePart.price || 0;
  return candidatePrice - basePrice;
}

/**
 * Validasi deterministik seluruh aturan kompatibilitas rakitan PC
 * sesuai dengan standar System Integrator KSS Komputer.
 */
export function validateBuild(selections: BuildSelections): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];

  const cpu = getItemPart(selections.cpu?.[0]);
  const motherboard = getItemPart(selections.motherboard?.[0]);
  const casing = getItemPart(selections.case?.[0]);
  const psu = getItemPart(selections.psu?.[0]);

  const ramItems = selections.ram || [];
  const gpuItems = selections.gpu || [];
  const coolerItems = selections.cooler || [];

  // 1. Validasi Socket CPU & Motherboard
  if (cpu?.specs.socket && motherboard?.specs.socket) {
    if (cpu.specs.socket !== motherboard.specs.socket) {
      issues.push({
        id: 'socket-mismatch',
        severity: 'error',
        title: 'Socket CPU & Motherboard Tidak Cocok',
        description: `Processor menggunakan socket ${cpu.specs.socket}, sedangkan Motherboard menggunakan socket ${motherboard.specs.socket}. Komponen tidak bisa dipasang.`,
        affectedCategories: ['cpu', 'motherboard'],
      });
    }
  }

  // 2. Validasi Tipe RAM & Motherboard (DDR4 vs DDR5)
  if (motherboard?.specs.ramType && ramItems.length > 0) {
    for (const item of ramItems) {
      const part = getItemPart(item);
      if (part?.specs.ramType && part.specs.ramType !== motherboard.specs.ramType) {
        issues.push({
          id: `ram-type-mismatch-${part.id}`,
          severity: 'error',
          title: 'Tipe Memori RAM Tidak Kompatibel',
          description: `Motherboard membutuhkan memori ${motherboard.specs.ramType}, sedangkan RAM yang dipilih bertipe ${part.specs.ramType} (${part.name}).`,
          affectedCategories: ['ram', 'motherboard'],
        });
      }
    }
  }

  // 3. Validasi Slot RAM Motherboard
  if (motherboard?.specs.ramSlots && ramItems.length > 0) {
    const totalRamModules = ramItems.reduce((sum, item) => {
      const part = getItemPart(item);
      return part ? sum + getRamModuleCount(part, item.quantity) : sum;
    }, 0);

    if (totalRamModules > motherboard.specs.ramSlots) {
      issues.push({
        id: 'ram-slots-exceeded',
        severity: 'error',
        title: 'Keping RAM Melebihi Slot Tersedia',
        description: `Motherboard hanya menyediakan ${motherboard.specs.ramSlots} slot RAM, sementara konfigurasi yang dipilih membutuhkan ${totalRamModules} slot fisik.`,
        affectedCategories: ['ram', 'motherboard'],
      });
    }
  }

  // 4. Validasi Form Factor Motherboard vs Casing
  if (motherboard?.specs.formFactor && casing?.specs.supportedFormFactors) {
    if (!casing.specs.supportedFormFactors.includes(motherboard.specs.formFactor)) {
      issues.push({
        id: 'form-factor-incompatible',
        severity: 'error',
        title: 'Ukuran Motherboard Tidak Muat di Casing',
        description: `Casing ${casing.name} hanya mendukung form factor [${casing.specs.supportedFormFactors.join(', ')}], tidak muat untuk motherboard ${motherboard.specs.formFactor}.`,
        affectedCategories: ['motherboard', 'case'],
      });
    }
  }

  // 5. Validasi Panjang Fisik GPU vs Casing
  if (casing?.specs.maxGpuLengthMm && gpuItems.length > 0) {
    for (const item of gpuItems) {
      const part = getItemPart(item);
      if (part?.specs.gpuLengthMm && part.specs.gpuLengthMm > casing.specs.maxGpuLengthMm) {
        issues.push({
          id: `gpu-length-exceeded-${part.id}`,
          severity: 'error',
          title: 'VGA Terlalu Panjang untuk Casing',
          description: `Panjang kartu grafis (${part.specs.gpuLengthMm}mm) melebihi batas clearance maksimal Casing (${casing.specs.maxGpuLengthMm}mm).`,
          affectedCategories: ['gpu', 'case'],
        });
      }
    }
  }

  // 6. Validasi Tinggi CPU Cooler vs Casing
  if (casing?.specs.maxCoolerHeightMm && coolerItems.length > 0) {
    for (const item of coolerItems) {
      const part = getItemPart(item);
      if (part?.specs.coolerHeightMm && part.specs.coolerHeightMm > casing.specs.maxCoolerHeightMm) {
        issues.push({
          id: `cooler-height-exceeded-${part.id}`,
          severity: 'error',
          title: 'Cooler CPU Terlalu Tinggi',
          description: `Tinggi cooler (${part.specs.coolerHeightMm}mm) melebihi batas ruang panel samping Casing (${casing.specs.maxCoolerHeightMm}mm).`,
          affectedCategories: ['cooler', 'case'],
        });
      }
    }
  }

  // 7. Peringatan Update BIOS
  if (cpu && motherboard) {
    const isLatestGen = cpu.specs.cpuGenTag === 'ryzen-9000' || cpu.specs.cpuGenTag === 'intel-14';
    if (isLatestGen && motherboard.specs.needsBiosUpdateForLatestGen) {
      issues.push({
        id: 'bios-update-required',
        severity: 'warning',
        title: 'Peringatan: Perlu Update BIOS',
        description:
          'Motherboard ini memerlukan update versi BIOS terbaru agar dapat mengenali CPU generasi ini (Gratis di-update oleh teknisi KSS Komputer sebelum pengiriman).',
        affectedCategories: ['cpu', 'motherboard'],
      });
    }
  }

  // 8. Deteksi CPU Tanpa iGPU Tanpa VGA Diskrit
  if (cpu && cpu.specs.integratedGpu === false && gpuItems.length === 0) {
    issues.push({
      id: 'no-display-output',
      severity: 'warning',
      title: 'Tidak Ada Output Display Monitor',
      description: `Processor ${cpu.name} tidak memiliki chip grafis internal (iGPU). Rakitan membutuhkan VGA / Kartu Grafis terpisah agar monitor dapat menampilkan gambar.`,
      affectedCategories: ['cpu', 'gpu'],
    });
  }

  // 9. Kalkulasi Daya (Wattage) & Headroom Rekomendasi PSU
  let totalTdp = 0;
  const categories: ProductCategory[] = [
    'cpu',
    'motherboard',
    'cooler',
    'ram',
    'gpu',
    'ssd',
    'hdd',
    'monitor',
    'peripheral',
  ];

  for (const cat of categories) {
    const items = selections[cat] || [];
    for (const item of items) {
      const part = getItemPart(item);
      if (part && part.wattage) {
        totalTdp += part.wattage * (item.quantity || 1);
      }
    }
  }

  // Motherboard & fans baseline jika belum ada
  if (totalTdp > 0 && !motherboard) {
    totalTdp += 30; // estimasi mobo baseline
  }

  // Rekomendasi PSU minimal: Total TDP * 1.35 (headroom 35%)
  const recommendedPsuWatt = Math.max(450, Math.ceil((totalTdp * 1.35) / 50) * 50);

  let psuHeadroomStatus: 'optimal' | 'tight' | 'insufficient' | 'no_psu' = 'no_psu';

  if (psu && psu.specs.psuWattage) {
    const psuCapacity = psu.specs.psuWattage;
    if (psuCapacity < totalTdp) {
      psuHeadroomStatus = 'insufficient';
      issues.push({
        id: 'psu-insufficient',
        severity: 'error',
        title: 'Kapasitas PSU Tidak Mencukupi',
        description: `Kapasitas PSU (${psuCapacity}W) lebih kecil dari total konsumsi daya komponen (${totalTdp}W). Komputer berisiko shutdown mendadak saat full load.`,
        affectedCategories: ['psu'],
      });
    } else if (psuCapacity < recommendedPsuWatt) {
      psuHeadroomStatus = 'tight';
      issues.push({
        id: 'psu-tight-headroom',
        severity: 'warning',
        title: 'Kapasitas PSU Menipis (Tight Headroom)',
        description: `Kapasitas PSU (${psuCapacity}W) sudah mencukupi daya nominal (${totalTdp}W), namun disarankan minimal ${recommendedPsuWatt}W untuk menjaga efisiensi dan stabilitas transient spike.`,
        affectedCategories: ['psu'],
      });
    } else {
      psuHeadroomStatus = 'optimal';
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    isCompatible: !hasErrors,
    issues,
    totalWattage: totalTdp,
    recommendedPsuWatt,
    psuHeadroomStatus,
  };
}

/**
 * Memeriksa apakah satu part kandidat kompatibel jika dimasukkan ke dalam konfigurasi saat ini
 */
export function isPartCompatibleWithCurrentBuild(
  candidatePart: HardwarePart,
  currentSelections: BuildSelections
): { compatible: boolean; reason?: string } {
  const { category, specs } = candidatePart;

  const currentCpu = getItemPart(currentSelections.cpu?.[0]);
  const currentMobo = getItemPart(currentSelections.motherboard?.[0]);
  const currentCase = getItemPart(currentSelections.case?.[0]);
  const currentRamItems = currentSelections.ram || [];

  // Jika part adalah CPU: periksa socket motherboard jika ada
  if (category === 'cpu' && specs.socket && currentMobo?.specs.socket) {
    if (specs.socket !== currentMobo.specs.socket) {
      return {
        compatible: false,
        reason: `Socket ${specs.socket} tidak cocok dengan Motherboard (${currentMobo.specs.socket})`,
      };
    }
  }

  // Jika part adalah Motherboard: periksa socket CPU, tipe RAM, dan casing
  if (category === 'motherboard') {
    if (specs.socket && currentCpu?.specs.socket && specs.socket !== currentCpu.specs.socket) {
      return {
        compatible: false,
        reason: `Socket ${specs.socket} tidak cocok dengan Processor (${currentCpu.specs.socket})`,
      };
    }
    if (specs.ramType && currentRamItems.length > 0) {
      const incompatibleRam = currentRamItems.find((r) => {
        const part = getItemPart(r);
        return part?.specs.ramType && part.specs.ramType !== specs.ramType;
      });
      if (incompatibleRam) {
        const part = getItemPart(incompatibleRam);
        return {
          compatible: false,
          reason: `Motherboard ${specs.ramType} tidak cocok dengan RAM ${part?.specs.ramType}`,
        };
      }
    }
    if (specs.formFactor && currentCase?.specs.supportedFormFactors) {
      if (!currentCase.specs.supportedFormFactors.includes(specs.formFactor)) {
        return {
          compatible: false,
          reason: `Ukuran ${specs.formFactor} tidak muat di Casing yang dipilih`,
        };
      }
    }
  }

  // Jika part adalah RAM: periksa tipe RAM motherboard
  if (category === 'ram' && specs.ramType && currentMobo?.specs.ramType) {
    if (specs.ramType !== currentMobo.specs.ramType) {
      return {
        compatible: false,
        reason: `Tipe RAM ${specs.ramType} tidak cocok dengan Motherboard (${currentMobo.specs.ramType})`,
      };
    }
  }

  // Jika part adalah GPU: periksa panjang terhadap casing
  if (category === 'gpu' && specs.gpuLengthMm && currentCase?.specs.maxGpuLengthMm) {
    if (specs.gpuLengthMm > currentCase.specs.maxGpuLengthMm) {
      return {
        compatible: false,
        reason: `Panjang GPU (${specs.gpuLengthMm}mm) melebihi batas Casing (${currentCase.specs.maxGpuLengthMm}mm)`,
      };
    }
  }

  // Jika part adalah Cooler: periksa tinggi terhadap casing
  if (category === 'cooler' && specs.coolerHeightMm && currentCase?.specs.maxCoolerHeightMm) {
    if (specs.coolerHeightMm > currentCase.specs.maxCoolerHeightMm) {
      return {
        compatible: false,
        reason: `Tinggi Cooler (${specs.coolerHeightMm}mm) melebihi batas Casing (${currentCase.specs.maxCoolerHeightMm}mm)`,
      };
    }
  }

  // Jika part adalah Casing: periksa form factor motherboard
  if (category === 'case' && specs.supportedFormFactors && currentMobo?.specs.formFactor) {
    if (!specs.supportedFormFactors.includes(currentMobo.specs.formFactor)) {
      return {
        compatible: false,
        reason: `Casing tidak muat untuk Motherboard ${currentMobo.specs.formFactor}`,
      };
    }
  }

  return { compatible: true };
}

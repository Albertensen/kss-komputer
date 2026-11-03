import {
  BuildSelections,
  CompatibilityIssue,
  CompatibilityReport,
  Product,
} from './types';

/**
 * Menghitung total keping RAM fisik dari produk dan kuantitasnya.
 * Mendeteksi konfigurasi kit seperti '2x16GB', '2x8GB', '4x16GB', dsb.
 */
export function getRamModuleCount(ramProduct: Product, quantity: number): number {
  const kitConfig = ramProduct.specs.kitConfiguration;
  if (kitConfig) {
    const match = kitConfig.match(/^(\d+)\s*x/i);
    if (match) {
      return parseInt(match[1], 10) * quantity;
    }
  }
  return 1 * quantity;
}

/**
 * Validasi deterministik seluruh aturan kompatibilitas rakitan PC
 * sesuai dengan 9 aturan spesifikasi pada ARCHITECTURE.md.
 */
export function validateBuild(selections: BuildSelections): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];

  const cpuItem = selections.cpu?.[0];
  const moboItem = selections.motherboard?.[0];
  const caseItem = selections.case?.[0];
  const gpuItems = selections.gpu || [];
  const coolerItems = selections.cooler || [];
  const ramItems = selections.ram || [];
  const psuItem = selections.psu?.[0];

  const cpu = cpuItem?.product;
  const motherboard = moboItem?.product;
  const casing = caseItem?.product;

  // 1. Validasi Socket CPU & Motherboard (severity: 'error')
  if (cpu?.specs.socket && motherboard?.specs.socket) {
    if (cpu.specs.socket !== motherboard.specs.socket) {
      issues.push({
        id: 'socket-mismatch',
        severity: 'error',
        title: 'Socket CPU & Motherboard Tidak Cocok',
        description: `Socket Tidak Cocok: Processor menggunakan socket ${cpu.specs.socket}, sedangkan Motherboard menggunakan socket ${motherboard.specs.socket}.`,
        affectedCategories: ['cpu', 'motherboard'],
      });
    }
  }

  // 2. Validasi Tipe RAM & Motherboard (severity: 'error')
  if (motherboard?.specs.ramType && ramItems.length > 0) {
    for (const item of ramItems) {
      if (item.product.specs.ramType && item.product.specs.ramType !== motherboard.specs.ramType) {
        issues.push({
          id: `ram-type-mismatch-${item.product.id}`,
          severity: 'error',
          title: 'Tipe Memori Tidak Kompatibel',
          description: `Tipe Memori Tidak Kompatibel: Motherboard membutuhkan RAM ${motherboard.specs.ramType}, tetapi RAM yang dipilih adalah ${item.product.specs.ramType} (${item.product.name}).`,
          affectedCategories: ['ram', 'motherboard'],
        });
      }
    }
  }

  // 3. Validasi Jumlah Modul RAM vs Slot Motherboard (severity: 'error')
  if (motherboard?.specs.ramSlots && ramItems.length > 0) {
    const totalRamModules = ramItems.reduce(
      (sum, item) => sum + getRamModuleCount(item.product, item.quantity),
      0
    );
    if (totalRamModules > motherboard.specs.ramSlots) {
      issues.push({
        id: 'ram-slots-exceeded',
        severity: 'error',
        title: 'Jumlah Keping RAM Melebihi Slot',
        description: `Jumlah Keping RAM Melebihi Slot: Motherboard hanya memiliki ${motherboard.specs.ramSlots} slot RAM, sedangkan total RAM yang dipilih adalah ${totalRamModules} keping.`,
        affectedCategories: ['ram', 'motherboard'],
      });
    }
  }

  // 4. Validasi Form Factor Motherboard vs Casing (severity: 'error')
  if (motherboard?.specs.formFactor && casing?.specs.supportedFormFactors) {
    if (!casing.specs.supportedFormFactors.includes(motherboard.specs.formFactor)) {
      issues.push({
        id: 'form-factor-incompatible',
        severity: 'error',
        title: 'Ukuran Motherboard Tidak Muat',
        description: `Ukuran Motherboard Tidak Muat: Casing ${casing.name} hanya mendukung [${casing.specs.supportedFormFactors.join(', ')}], tidak muat untuk motherboard ${motherboard.specs.formFactor}.`,
        affectedCategories: ['motherboard', 'case'],
      });
    }
  }

  // 5. Validasi Panjang Fisik GPU vs Casing (severity: 'error')
  if (casing?.specs.maxGpuLengthMm && gpuItems.length > 0) {
    for (const item of gpuItems) {
      if (item.product.specs.gpuLengthMm && item.product.specs.gpuLengthMm > casing.specs.maxGpuLengthMm) {
        issues.push({
          id: `gpu-length-exceeded-${item.product.id}`,
          severity: 'error',
          title: 'GPU Terlalu Panjang',
          description: `GPU Terlalu Panjang: Panjang VGA (${item.product.specs.gpuLengthMm}mm) melebihi ruang maksimal Casing (${casing.specs.maxGpuLengthMm}mm).`,
          affectedCategories: ['gpu', 'case'],
        });
      }
    }
  }

  // 6. Validasi Tinggi Cooler vs Casing (severity: 'error')
  if (casing?.specs.maxCoolerHeightMm && coolerItems.length > 0) {
    for (const item of coolerItems) {
      if (item.product.specs.coolerHeightMm && item.product.specs.coolerHeightMm > casing.specs.maxCoolerHeightMm) {
        issues.push({
          id: `cooler-height-exceeded-${item.product.id}`,
          severity: 'error',
          title: 'Cooler Terlalu Tinggi',
          description: `Cooler Terlalu Tinggi: Tinggi CPU cooler (${item.product.specs.coolerHeightMm}mm) melebihi batas maksimal Casing (${casing.specs.maxCoolerHeightMm}mm).`,
          affectedCategories: ['cooler', 'case'],
        });
      }
    }
  }

  // 7. Peringatan Update BIOS (severity: 'warning')
  if (cpu && motherboard) {
    const isLatestGen = cpu.specs.cpuGenTag === 'ryzen-9000' || cpu.specs.cpuGenTag === 'intel-14';
    if (isLatestGen && motherboard.specs.needsBiosUpdateForLatestGen === true) {
      issues.push({
        id: 'bios-update-required',
        severity: 'warning',
        title: 'Perlu Update BIOS',
        description:
          'Perlu Update BIOS: Motherboard seri ini mungkin memerlukan Flash BIOS terbaru agar dapat mengenali processor generasi ini (Gratis jasa update BIOS di toko kami).',
        affectedCategories: ['cpu', 'motherboard'],
      });
    }
  }

  // 8. Peringatan CPU Tanpa Integrated GPU (severity: 'warning')
  if (cpu && cpu.specs.integratedGpu === false && gpuItems.length === 0) {
    issues.push({
      id: 'igpu-missing-no-dedicated-gpu',
      severity: 'warning',
      title: 'Wajib Tambah Kartu Grafis (VGA)',
      description:
        'Wajib Tambah Kartu Grafis (VGA): Processor ini tidak memiliki GPU terintegrasi (iGPU) sehingga tidak akan menampilkan gambar ke monitor tanpa VGA tambahan.',
      affectedCategories: ['cpu', 'gpu'],
    });
  }

  // 9. Kalkulasi Daya & PSU (severity: 'error' | 'warning')
  let rawWattage = 0;
  let hasSelectedComponents = false;

  (Object.keys(selections) as (keyof BuildSelections)[]).forEach((category) => {
    const items = selections[category];
    if (items && items.length > 0) {
      hasSelectedComponents = true;
      items.forEach((item) => {
        rawWattage += (item.product.wattage || 0) * item.quantity;
      });
    }
  });

  // Base overhead 50W untuk kipas casing, motherboard chipset, & LED jika ada komponen yang dipilih
  const totalWattage = hasSelectedComponents ? rawWattage + 50 : 0;

  // Formula ARCHITECTURE.md: Math.max(450, Math.ceil((totalWattage * 1.35) / 50) * 50)
  let calculatedRecommendedPsu = Math.max(450, Math.ceil((totalWattage * 1.35) / 50) * 50);

  // Periksa apakah GPU menyarankan rekomendasi daya lebih besar
  gpuItems.forEach((item) => {
    if (item.product.specs.recommendedPsuWatt && item.product.specs.recommendedPsuWatt > calculatedRecommendedPsu) {
      calculatedRecommendedPsu = item.product.specs.recommendedPsuWatt;
    }
  });

  const recommendedPsuWatt = calculatedRecommendedPsu;
  let psuHeadroomStatus: CompatibilityReport['psuHeadroomStatus'] = 'no_psu';

  if (!psuItem) {
    psuHeadroomStatus = 'no_psu';
  } else {
    const psuWatt = psuItem.product.specs.psuWattage || 0;
    if (psuWatt < totalWattage) {
      psuHeadroomStatus = 'insufficient';
      issues.push({
        id: 'psu-wattage-insufficient',
        severity: 'error',
        title: 'Kapasitas PSU Kurang',
        description: `Daya PSU yang dipilih (${psuWatt}W) lebih kecil dari estimasi konsumsi daya sistem (${totalWattage}W). Sistem berisiko mati mendadak atau tidak dapat menyala.`,
        affectedCategories: ['psu'],
      });
    } else if (psuWatt < recommendedPsuWatt) {
      psuHeadroomStatus = 'tight';
      issues.push({
        id: 'psu-wattage-tight',
        severity: 'warning',
        title: 'Kapasitas PSU Pas-pasan (Headroom Rendah)',
        description: `Daya PSU (${psuWatt}W) di bawah rekomendasi ideal (${recommendedPsuWatt}W). Disarankan minimal ${recommendedPsuWatt}W untuk efisiensi dan kestabilan daya puncak (transient spikes).`,
        affectedCategories: ['psu'],
      });
    } else {
      psuHeadroomStatus = 'optimal';
    }
  }

  const isCompatible = issues.every((issue) => issue.severity !== 'error');

  return {
    isCompatible,
    issues,
    totalWattage,
    recommendedPsuWatt,
    psuHeadroomStatus,
  };
}

/**
 * Mengecek apakah suatu produk cocok dengan rakitan saat ini secara instan.
 * Digunakan oleh switch "Filter Kompatibel Otomatis" pada PartSelectorDrawer.
 */
export function isProductCompatibleWithCurrentBuild(
  product: Product,
  selections: BuildSelections
): { compatible: boolean; reason?: string } {
  const currentCpu = selections.cpu?.[0]?.product;
  const currentMobo = selections.motherboard?.[0]?.product;
  const currentCase = selections.case?.[0]?.product;
  const currentGpu = selections.gpu?.[0]?.product;
  const currentCooler = selections.cooler?.[0]?.product;
  const currentRams = selections.ram || [];

  switch (product.category) {
    case 'cpu': {
      if (currentMobo?.specs.socket && product.specs.socket) {
        if (product.specs.socket !== currentMobo.specs.socket) {
          return {
            compatible: false,
            reason: `Socket CPU (${product.specs.socket}) tidak cocok dengan Motherboard (${currentMobo.specs.socket})`,
          };
        }
      }
      return { compatible: true };
    }

    case 'motherboard': {
      if (currentCpu?.specs.socket && product.specs.socket) {
        if (product.specs.socket !== currentCpu.specs.socket) {
          return {
            compatible: false,
            reason: `Socket Motherboard (${product.specs.socket}) tidak cocok dengan CPU (${currentCpu.specs.socket})`,
          };
        }
      }
      if (currentRams.length > 0 && product.specs.ramType) {
        for (const item of currentRams) {
          if (item.product.specs.ramType && item.product.specs.ramType !== product.specs.ramType) {
            return {
              compatible: false,
              reason: `Motherboard membutuhkan ${product.specs.ramType}, sedangkan RAM yang dipilih adalah ${item.product.specs.ramType}`,
            };
          }
        }
      }
      if (currentCase?.specs.supportedFormFactors && product.specs.formFactor) {
        if (!currentCase.specs.supportedFormFactors.includes(product.specs.formFactor)) {
          return {
            compatible: false,
            reason: `Casing tidak muat untuk motherboard berukuran ${product.specs.formFactor}`,
          };
        }
      }
      return { compatible: true };
    }

    case 'ram': {
      if (currentMobo?.specs.ramType && product.specs.ramType) {
        if (product.specs.ramType !== currentMobo.specs.ramType) {
          return {
            compatible: false,
            reason: `Tipe RAM (${product.specs.ramType}) tidak cocok dengan Motherboard (${currentMobo.specs.ramType})`,
          };
        }
      }
      return { compatible: true };
    }

    case 'gpu': {
      if (currentCase?.specs.maxGpuLengthMm && product.specs.gpuLengthMm) {
        if (product.specs.gpuLengthMm > currentCase.specs.maxGpuLengthMm) {
          return {
            compatible: false,
            reason: `Panjang GPU (${product.specs.gpuLengthMm}mm) melebihi batas ruang casing (${currentCase.specs.maxGpuLengthMm}mm)`,
          };
        }
      }
      return { compatible: true };
    }

    case 'cooler': {
      if (currentCase?.specs.maxCoolerHeightMm && product.specs.coolerHeightMm) {
        if (product.specs.coolerHeightMm > currentCase.specs.maxCoolerHeightMm) {
          return {
            compatible: false,
            reason: `Tinggi cooler (${product.specs.coolerHeightMm}mm) melebihi batas casing (${currentCase.specs.maxCoolerHeightMm}mm)`,
          };
        }
      }
      return { compatible: true };
    }

    case 'case': {
      if (currentMobo?.specs.formFactor && product.specs.supportedFormFactors) {
        if (!product.specs.supportedFormFactors.includes(currentMobo.specs.formFactor)) {
          return {
            compatible: false,
            reason: `Casing tidak mendukung Motherboard berukuran ${currentMobo.specs.formFactor}`,
          };
        }
      }
      if (currentGpu?.specs.gpuLengthMm && product.specs.maxGpuLengthMm) {
        if (currentGpu.specs.gpuLengthMm > product.specs.maxGpuLengthMm) {
          return {
            compatible: false,
            reason: `Ruang GPU casing (${product.specs.maxGpuLengthMm}mm) terlalu pendek untuk VGA (${currentGpu.specs.gpuLengthMm}mm)`,
          };
        }
      }
      if (currentCooler?.specs.coolerHeightMm && product.specs.maxCoolerHeightMm) {
        if (currentCooler.specs.coolerHeightMm > product.specs.maxCoolerHeightMm) {
          return {
            compatible: false,
            reason: `Batas cooler casing (${product.specs.maxCoolerHeightMm}mm) lebih rendah dari tinggi cooler (${currentCooler.specs.coolerHeightMm}mm)`,
          };
        }
      }
      return { compatible: true };
    }

    default:
      return { compatible: true };
  }
}

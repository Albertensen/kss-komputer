import React from 'react';
import { Product } from '@/lib/types';

export interface SpecBadgesProps {
  product: Product;
  limit?: number;
  className?: string;
  badgeClassName?: string;
}

/**
 * Mengambil array label spesifikasi teknis ringkas berdasarkan kategori produk.
 * Menghasilkan 3-4 badge teknis kotak ala Linear / Enterkomputer.
 */
export function getProductSpecLabels(product: Product): string[] {
  const { category, specs, wattage } = product;
  const labels: string[] = [];

  switch (category) {
    case 'cpu': {
      if (specs.socket) labels.push(specs.socket);
      if (specs.cores && specs.threads) {
        labels.push(`${specs.cores}C/${specs.threads}T`);
      } else if (specs.cores) {
        labels.push(`${specs.cores} Cores`);
      }
      if (specs.boostClockGhz) {
        labels.push(`${specs.boostClockGhz} GHz`);
      }
      if (specs.integratedGpu !== undefined) {
        labels.push(specs.integratedGpu ? 'iGPU' : 'No iGPU');
      } else if (wattage) {
        labels.push(`${wattage}W`);
      }
      break;
    }

    case 'motherboard': {
      if (specs.socket) labels.push(specs.socket);
      if (specs.chipset) labels.push(specs.chipset);
      if (specs.ramType) labels.push(specs.ramType);
      if (specs.formFactor) labels.push(specs.formFactor);
      break;
    }

    case 'ram': {
      if (specs.kitConfiguration) {
        labels.push(specs.kitConfiguration);
      } else if (specs.capacityGb) {
        labels.push(`${specs.capacityGb}GB`);
      }
      if (specs.ramType && specs.speedMhz) {
        labels.push(`${specs.ramType}-${specs.speedMhz}`);
      } else if (specs.ramType) {
        labels.push(specs.ramType);
      } else if (specs.speedMhz) {
        labels.push(`${specs.speedMhz}MHz`);
      }
      if (specs.casLatency) labels.push(specs.casLatency);
      break;
    }

    case 'gpu': {
      if (specs.vramGb && specs.vramType) {
        labels.push(`${specs.vramGb}GB ${specs.vramType}`);
      } else if (specs.vramGb) {
        labels.push(`${specs.vramGb}GB VRAM`);
      }
      if (wattage) labels.push(`${wattage}W`);
      if (specs.gpuLengthMm) labels.push(`${specs.gpuLengthMm}mm`);
      break;
    }

    case 'ssd': {
      if (specs.capacityGb) {
        labels.push(specs.capacityGb >= 1000 ? `${specs.capacityGb / 1000}TB` : `${specs.capacityGb}GB`);
      }
      if (specs.storageInterface) labels.push(specs.storageInterface);
      if (specs.readSpeedMbps) labels.push(`${specs.readSpeedMbps} MB/s`);
      break;
    }

    case 'hdd': {
      if (specs.capacityGb) {
        labels.push(specs.capacityGb >= 1000 ? `${specs.capacityGb / 1000}TB` : `${specs.capacityGb}GB`);
      }
      if (specs.storageInterface) labels.push(specs.storageInterface);
      break;
    }

    case 'psu': {
      if (specs.psuWattage) labels.push(`${specs.psuWattage}W`);
      if (specs.efficiencyRating) labels.push(specs.efficiencyRating);
      if (specs.modular) labels.push(specs.modular);
      break;
    }

    case 'case': {
      if (specs.supportedFormFactors && specs.supportedFormFactors.length > 0) {
        labels.push(specs.supportedFormFactors.join('/'));
      }
      if (specs.maxGpuLengthMm) labels.push(`Max GPU ${specs.maxGpuLengthMm}mm`);
      if (specs.maxCoolerHeightMm) labels.push(`Max Cooler ${specs.maxCoolerHeightMm}mm`);
      break;
    }

    case 'cooler': {
      if (specs.coolerHeightMm) labels.push(`H: ${specs.coolerHeightMm}mm`);
      if (wattage) labels.push(`TDP: ${wattage}W`);
      break;
    }

    case 'monitor': {
      if (specs.screenSizeInch) labels.push(`${specs.screenSizeInch}"`);
      if (specs.resolution) labels.push(specs.resolution);
      if (specs.refreshRateHz) labels.push(`${specs.refreshRateHz}Hz`);
      if (specs.panelType) labels.push(specs.panelType);
      break;
    }

    case 'peripheral': {
      if (wattage) labels.push(`${wattage}W`);
      break;
    }

    default:
      break;
  }

  return labels;
}

/**
 * Komponen SpecBadges:
 * Menampilkan barisan badge spesifikasi teknis ringkas, tajam, dan monospaced.
 */
export function SpecBadges({
  product,
  limit,
  className = 'flex flex-wrap items-center gap-1',
  badgeClassName = 'inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-sm whitespace-nowrap',
}: SpecBadgesProps) {
  const allLabels = getProductSpecLabels(product);
  const displayedLabels = typeof limit === 'number' && limit > 0 ? allLabels.slice(0, limit) : allLabels;

  if (displayedLabels.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {displayedLabels.map((label, idx) => (
        <span key={`${product.id}-badge-${idx}`} className={badgeClassName}>
          {label}
        </span>
      ))}
    </div>
  );
}

export default SpecBadges;

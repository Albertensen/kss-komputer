import { ProductCategory } from './types';

export const TOKOPEDIA_OFFICIAL_STORE_URL = 'https://tk.tokopedia.com/ZSpeToWkH/';
export const DEFAULT_WHATSAPP_PHONE = '6281234567890'; // Nomor CS WhatsApp KSS Komputer

/**
 * Format angka ke format mata uang Rupiah Indonesia (Rp 8.500.000)
 */
export function formatIDR(amount: number): string {
  const safeAmount = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(safeAmount);

  return `Rp ${formatted}`;
}

/**
 * Format selisih harga (Delta Pricing) untuk quick upgrader & konfigurator
 * - 0 => '[Termasuk dalam Paket]' atau 'Standar'
 * - > 0 => '+ Rp 450.000'
 * - < 0 => '- Rp 200.000'
 */
export function formatDeltaIDR(diff: number, includeBrackets = false): string {
  const safeDiff = Math.round(Number(diff) || 0);

  if (safeDiff === 0) {
    return includeBrackets ? '[Termasuk dalam Paket]' : 'Termasuk dalam Paket';
  }

  const sign = safeDiff > 0 ? '+ ' : '- ';
  const absAmount = formatIDR(Math.abs(safeDiff));
  const text = `${sign}${absAmount}`;

  return includeBrackets ? `[${text}]` : text;
}

/**
 * Format angka Wattase (contoh: 450W)
 */
export function formatWatt(watt: number): string {
  return `${Math.round(Number(watt) || 0)}W`;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cpu: 'Processor (CPU)',
  motherboard: 'Motherboard',
  cooler: 'CPU Cooler',
  ram: 'Memory (RAM)',
  gpu: 'VGA / Kartu Grafis',
  ssd: 'Storage (SSD NVMe)',
  hdd: 'Storage Tambahan (HDD)',
  psu: 'Power Supply (PSU)',
  case: 'Casing PC',
  monitor: 'Monitor',
  peripheral: 'Aksesoris & Peripheral',
};

export interface WhatsAppOrderPayload {
  buildName: string;
  items: {
    category: ProductCategory;
    name: string;
    quantity: number;
  }[];
  totalPrice: number;
  customerName?: string;
  notes?: string;
  isCustomBuild?: boolean;
}

/**
 * Generate tautan WhatsApp checkout resmi KSS Komputer.
 * Sesuai aturan bisnis KSS Komputer:
 * Menampilkan rincian part secara utuh tetapi TIDAK membeberkan harga satuan per part (hanya Total Harga Paket).
 */
export function generateWhatsAppOrderUrl(
  phone: string = DEFAULT_WHATSAPP_PHONE,
  payload: WhatsAppOrderPayload
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const lines: string[] = [
    `*HALO KSS KOMPUTER, SAYA MAU PESAN PC RAKITAN:*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*Paket / Konfigurasi:* ${payload.buildName}`,
  ];

  if (payload.customerName) {
    lines.push(`*Nama Pemesan:* ${payload.customerName}`);
  }

  lines.push(`\n*RINCIAN SPESIFIKASI RAKITAN:*`);

  payload.items.forEach((item, idx) => {
    const catLabel = CATEGORY_LABELS[item.category] || item.category;
    const qtyStr = item.quantity > 1 ? ` (${item.quantity}x)` : '';
    lines.push(`${idx + 1}. *${catLabel}*: ${item.name}${qtyStr}`);
  });

  lines.push(`\n*STATUS UNIT:*`);
  lines.push(`✓ Sudah Dirakit Rapi (Clean Cable Management)`);
  lines.push(`✓ Lulus Stress-Test Hardware 24 Jam`);
  lines.push(`✓ Garansi Resmi Distributor & Garansi Toko`);

  if (payload.notes) {
    lines.push(`\n*Catatan Khusus:* ${payload.notes}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*TOTAL HARGA PAKET: ${formatIDR(payload.totalPrice)}*`);
  lines.push(`\nMohon info ketersediaan stok & jadwal perakitan/pengiriman. Terima kasih!`);

  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format teks spesifikasi untuk disalin ke clipboard (Discord / Forum / Catatan)
 */
export function generateBuildPlainText(
  buildName: string,
  items: { category: ProductCategory; name: string; quantity: number }[],
  totalPrice: number,
  totalWattage: number
): string {
  const lines: string[] = [
    `=== SPESIFIKASI PC RAKITAN KSS KOMPUTER ===`,
    `Paket / Nama: ${buildName}`,
    `Estimasi Total Daya: ${formatWatt(totalWattage)}`,
    `------------------------------------------`,
  ];

  items.forEach((item) => {
    const catLabel = CATEGORY_LABELS[item.category] || item.category;
    const qtyStr = item.quantity > 1 ? ` [${item.quantity}x]` : '';
    lines.push(`- ${catLabel}: ${item.name}${qtyStr}`);
  });

  lines.push(`------------------------------------------`);
  lines.push(`TOTAL HARGA RAKITAN: ${formatIDR(totalPrice)} (Siap Pakai)`);
  lines.push(`Toko Resmi Tokopedia: ${TOKOPEDIA_OFFICIAL_STORE_URL}`);
  lines.push(`==========================================`);

  return lines.join('\n');
}

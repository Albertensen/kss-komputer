import { SelectedBuildItem, ProductCategory } from './types';

/**
 * Format angka menjadi representasi Rupiah Indonesia standar.
 * Contoh: 2450000 -> "Rp 2.450.000" (tanpa sen/desimal ,00).
 */
export function formatIDR(amount: number): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  return `Rp ${formatted}`;
}

/**
 * Format angka daya menjadi representasi Watt.
 * Contoh: 350 -> "350W".
 */
export function formatWatt(watt: number): string {
  const safeWatt = Math.round(Number.isFinite(watt) ? watt : 0);
  return `${safeWatt}W`;
}

/**
 * Format tanggal dalam format standar Indonesia.
 */
export function formatDate(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Hari ini';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Label nama kategori dalam bahasa Indonesia yang ramah pengguna.
 */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cpu: 'Processor (CPU)',
  motherboard: 'Motherboard',
  ram: 'Memory (RAM)',
  gpu: 'VGA / Kartu Grafis',
  ssd: 'SSD Storage',
  hdd: 'Harddisk (HDD)',
  psu: 'Power Supply (PSU)',
  case: 'Casing PC',
  cooler: 'CPU Cooler',
  monitor: 'Monitor',
  peripheral: 'Aksesoris / Peripheral',
};

/**
 * Susun teks pesanan rapi untuk dikirim langsung ke WhatsApp Admin KSS Komputer.
 */
export function generateWhatsAppBuildUrl(
  phone: string,
  items: SelectedBuildItem[],
  totalPrice: number,
  options: {
    assembleService?: boolean;
    notes?: string;
    buildName?: string;
  } = {}
): string {
  // Normalisasi nomor telepon Indonesia (misal: 0812... -> 62812...)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }

  const ASSEMBLE_FEE = 100000;
  const grandTotal = options.assembleService ? totalPrice + ASSEMBLE_FEE : totalPrice;

  const lines: string[] = [
    `*PESANAN SIMULASI RAKITAN PC — KSS KOMPUTER*`,
    options.buildName ? `*Nama Rakitan:* ${options.buildName}` : '',
    `----------------------------------------`,
    `*DAFTAR KOMPONEN:*`,
  ].filter(Boolean);

  if (items.length === 0) {
    lines.push('(Belum ada komponen yang dipilih)');
  } else {
    items.forEach((item, index) => {
      const catLabel = CATEGORY_LABELS[item.product.category] || item.product.category.toUpperCase();
      const subtotal = item.product.price * item.quantity;
      lines.push(
        `${index + 1}. *[${catLabel}]* ${item.product.name}\n   Jumlah: ${item.quantity}x @ ${formatIDR(item.product.price)} = *${formatIDR(subtotal)}*`
      );
    });
  }

  lines.push(`----------------------------------------`);
  lines.push(`*Subtotal Komponen:* ${formatIDR(totalPrice)}`);
  if (options.assembleService) {
    lines.push(`*Jasa Rakit & Manajemen Kabel:* ${formatIDR(ASSEMBLE_FEE)} (Aktif)`);
  } else {
    lines.push(`*Jasa Rakit:* Tidak (Kirim Part Saja)`);
  }
  lines.push(`*ESTIMASI TOTAL:* *${formatIDR(grandTotal)}*`);
  lines.push(`----------------------------------------`);

  if (options.notes && options.notes.trim()) {
    lines.push(`*Catatan Tambahan:*\n${options.notes.trim()}`);
    lines.push(`----------------------------------------`);
  }

  lines.push(
    `Halo Admin KSS Komputer, saya ingin menanyakan ketersediaan stok komponen di atas dan konfirmasi total pembayarannya. Terima kasih!`
  );

  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format teks polos / Markdown untuk ekspor ke Clipboard (Discord, Forum PC, & Catatan Pribadi).
 */
export function generateBuildPlainText(
  items: SelectedBuildItem[],
  totalPrice: number,
  totalWattage: number,
  options: {
    assembleService?: boolean;
    buildName?: string;
  } = {}
): string {
  const ASSEMBLE_FEE = 100000;
  const grandTotal = options.assembleService ? totalPrice + ASSEMBLE_FEE : totalPrice;

  const header = [
    `================================================================`,
    ` SIMULASI RAKITAN PC — KSS KOMPUTER (ksskomputer.id)`,
    options.buildName ? ` Nama Racikan: ${options.buildName}` : '',
    `================================================================`,
  ].filter(Boolean);

  const body: string[] = [];

  if (items.length === 0) {
    body.push(`(Tidak ada komponen yang dipilih)`);
  } else {
    items.forEach((item) => {
      const catLabel = (CATEGORY_LABELS[item.product.category] || item.product.category).padEnd(20, ' ');
      const subtotal = item.product.price * item.quantity;
      body.push(
        `[${catLabel}] ${item.product.name}\n   Qty: ${item.quantity} x ${formatIDR(item.product.price)} = ${formatIDR(subtotal)}`
      );
    });
  }

  const footer = [
    `----------------------------------------------------------------`,
    `Subtotal Part      : ${formatIDR(totalPrice)}`,
    options.assembleService ? `Jasa Rakit & Test  : ${formatIDR(ASSEMBLE_FEE)}` : `Jasa Rakit         : Tidak Dipilih`,
    `TOTAL KESELURUHAN  : ${formatIDR(grandTotal)}`,
    `Estimasi Total Daya: ${formatWatt(totalWattage)}`,
    `================================================================`,
    `* Harga dan ketersediaan stok dapat berubah sewaktu-waktu.`,
    `* Hubungi KSS Komputer untuk konsultasi & pemesanan.`,
  ];

  return [...header, ...body, ...footer].join('\n');
}

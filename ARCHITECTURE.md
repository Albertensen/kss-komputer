# SYSTEM ARCHITECTURE & BUSINESS SPECIFICATIONS — KSS KOMPUTER

Dokumen ini mendefinisikan model bisnis, arsitektur teknis, kontrak tipe TypeScript, logika validasi kompatibilitas, dan mekanisme *pricing* untuk **KSS Komputer**.

---

## 1. MODEL BISNIS KSS KOMPUTER (SYSTEM INTEGRATOR & JASA)

KSS Komputer **BUKAN** toko eceran part komputer transparan ala marketplace grosir. KSS Komputer beroperasi sebagai **System Integrator & Pusat Jasa Komputer**:
1. **Penjualan Utama**:
   - **PC Rakitan Jadi (Siap Pakai)**: Konfigurasi seimbang (*balanced build*), sudah dirakit rapi (*clean cable management*), melalui proses *stress test* 24 jam, dan dilengkapi garansi toko + garansi resmi distributor.
   - **Layanan Jasa Komputer**: Jasa perakitan custom, maintenance/deep cleaning, upgrade hardware, dan konsultasi rakitan.
2. **Kanal Transaksi**:
   - **Tokopedia Resmi**: `https://tk.tokopedia.com/ZSpeToWkH/`
   - **WhatsApp Admin**: Konsultasi langsung, pesanan custom invoice, dan koordinasi pengiriman instan (Gosend/Grab) atau kargo kayu luar kota.

---

## 2. STRUKTUR PRICING: HIDDEN PART PRICE & DELTA PRICING

### A. Kebijakan Privasi Harga Part (Hidden Part Price)
- **DILARANG** menampilkan harga satuan komponen (CPU, Motherboard, RAM, VGA, SSD, PSU, Case, Cooler) di antarmuka publik.
- Publik hanya berhak melihat:
  1. **Total Harga PC Rakitan Jadi** (sudah termasuk komponen, markup rahasia toko, dan jasa rakit).
  2. **Selisih Harga (Delta Price)** saat mengganti/meng-upgrade suatu komponen.

### B. Struktur Data Komponen Internal
Setiap komponen hardware (`HardwarePart`) menyimpan:
- `costPrice`: Harga modal riil dari distributor (hanya bisa diakses di `/admin/pricing`).
- `sellPrice`: Harga jual komponen setelah ditambah margin keuntungan toko.
- `wattage`: Estimasi TDP komponen untuk kalkulator daya.

### C. Logika Perhitungan Total Paket PC
$$\text{Total Harga Paket} = \sum (\text{sellPrice part}) + \text{assemblyFee}$$
Jika terdapat penyesuaian markup global oleh admin:
$$\text{Total Harga Paket} = \left(\sum \text{costPrice part} \times (1 + \frac{\text{markupPercent}}{100})\right) + \text{assemblyFee}$$

### D. Mekanisme Delta Pricing (Quick Upgrader & Configurator)
Ketika pembeli membuka halaman kustomisasi paket atau konfigurator:
$$\text{Delta Price} = \text{sellPrice}(\text{Komponen Baru}) - \text{sellPrice}(\text{Komponen Bawaan})$$
- Jika $\text{Delta Price} == 0$: Label tampil sebagai `[Termasuk dalam Paket]`
- Jika $\text{Delta Price} > 0$: Label tampil sebagai `[+ Rp 650.000]` (Upgrade)
- Jika $\text{Delta Price} < 0$: Label tampil sebagai `[- Rp 250.000]` (Downgrade)

---

## 3. ENGINE KOMPATIBILITAS TEKNIS (`src/lib/compatibility.ts`)

Engine validasi memeriksa 8 aturan teknis mutlak secara fungsional:
1. **Socket CPU vs Motherboard**: AM4, AM5, LGA1700, LGA1851 wajib identik.
2. **Generasi RAM vs Motherboard**: RAM DDR4 hanya cocok di Motherboard DDR4; RAM DDR5 hanya cocok di Motherboard DDR5.
3. **Form Factor Motherboard vs Casing**: Casing harus mendukung ukuran fisik Motherboard (misal: Casing mATX tidak bisa memuat Motherboard ATX).
4. **Panjang Fisik GPU vs Casing**: `gpuLengthMm` tidak boleh melebihi `maxGpuLengthMm` casing.
5. **Tinggi CPU Cooler vs Casing**: `coolerHeightMm` tidak boleh melebihi `maxCoolerHeightMm` casing.
6. **Peringatan BIOS Update**: Ditampilkan jika prosesor generasi terbaru dipasang pada chipset motherboard generasi awal (misal: Ryzen 9000 di chipset B650 non-update).
7. **Deteksi iGPU**: Memberikan peringatan jika CPU tidak memiliki iGPU dan build belum memiliki kartu grafis diskrit (VGA).
8. **Kalkulasi Daya & Rekomendasi PSU**:
   - Menghitung akumulasi TDP seluruh komponen.
   - Standar rekomendasi PSU: $\text{Rekomendasi Watt} = \text{Total TDP} \times 1.35$ (headroom 35% untuk efisiensi & spike transient).

---

## 4. STRUKTUR DIREKTORI TARGET

~~~text
src/
├── app/
│   ├── layout.tsx                     # Layout global dengan Navbar, Footer, & CartDrawer
│   ├── page.tsx                       # High-Conversion Homepage (Paket Terlaris, Kategori Kebutuhan, Keunggulan Jasa)
│   ├── paket-rakitan/
│   │   ├── page.tsx                   # Katalog Seluruh PC Rakitan Jadi (Filter Budget & Platform)
│   │   └── [slug]/
│   │       └── page.tsx               # Quick Spec Upgrader dengan Delta Pricing & 1-Click Checkout
│   ├── simulasi/
│   │   └── page.tsx                   # Custom PC Configurator (Slot Hardware, Auto-filter Kompatibel, Telemetry)
│   ├── jasa/
│   │   └── page.tsx                   # Katalog Layanan Jasa Komputer & Booking Jadwal via WhatsApp
│   └── admin/
│       └── pricing/
│           └── page.tsx               # Spreadsheet Modal & Markup Management untuk Owner KSS Komputer
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 # Header teknis padat, link Tokopedia resmi, drawer keranjang
│   │   ├── Footer.tsx                 # Profil KSS Komputer, garansi toko, distributor, jam operasional
│   │   └── CartDrawer.tsx             # Drawer ringkasan belanja & perakitan
│   ├── builder/
│   │   ├── ConfiguratorSlotRow.tsx    # Baris slot komponen dengan badge delta pricing
│   │   ├── PartSelectorDrawer.tsx     # Drawer pemilih part kompatibel dengan delta price
│   │   ├── TelemetryBar.tsx           # Bar sticky status kompatibilitas, watt meter, & total harga
│   │   └── QuotationPrintView.tsx     # Template cetak penawaran resmi PDF/Print View
│   └── prebuilt/
│       ├── PrebuiltCard.tsx           # Kartu paket PC dengan indikator FPS & spek inti
│       └── QuickUpgraderModal.tsx     # Modal cepat tukar spek di halaman detail paket
├── lib/
│   ├── types.ts                       # Kontrak TypeScript (HardwarePart, PrebuiltPC, ServicePackage, dll)
│   ├── format.ts                      # Helper format Rupiah, format Delta IDR, URL WA & Tokopedia
│   ├── compatibility.ts               # Engine murni validasi kompatibilitas & kalkulator bundle
│   └── mock-data.ts                   # 45+ HardwarePart (modal + jual), 6 PrebuiltPC, 4 ServicePackage
└── store/
    ├── useBuilderStore.ts             # State simulasi & custom configurator (dengan Delta Price calculation)
    ├── useAdminStore.ts               # State manajemen markup, biaya rakit, dan modal toko
    └── useCartStore.ts                # State keranjang transaksi belanja
~~~

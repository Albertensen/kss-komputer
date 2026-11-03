# Modern High-Density PC Hardware Store & PC Builder

Platform e-commerce komponen komputer dan simulasi rakitan PC (*PC Builder*) modern untuk pasar Indonesia. Dirancang dengan kepadatan informasi tinggi (*high information density*) ala **Enterkomputer** dan **PCPartPicker**, dipadukan dengan estetika teknis industrial yang bersih ala **Linear**—bebas dari elemen visual generik (*AI slop*).

---

## Urutan Baca untuk AI Coding Agent (WAJIB)

Jika Anda adalah AI Agent yang ditugaskan membangun atau memodifikasi repositori ini, baca dokumen berikut secara berurutan sebelum menulis kode apa pun:

1. **`AGENT_RULES.md`**: Aturan mutlak penulisan kode, batasan desain Tailwind CSS (*Anti-AI-Slop*), aturan tipografi angka, dan protokol eksekusi bertahap.
2. **`ARCHITECTURE.md`**: Struktur direktori, kontrak *interface* TypeScript (`types.ts`), logika mesin kompatibilitas komponen PC, dan spesifikasi *state management* Zustand.
3. **`ROADMAP.md`**: Daftar *to-do list* dan *checklist* bertahap (`[ ]`). Kerjakan tugas secara berurutan dan perbarui statusnya menjadi `[x]` setiap selesai satu sub-tugas.

---

## Tech Stack Utama

- **Framework**: Next.js (App Router) + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Industrial Sharp/Flat Theme, Dark & Light Mode)
- **Icons**: `lucide-react` (Ukuran kompak `w-4 h-4` atau `w-3.5 h-3.5`)
- **State Management**: `zustand` dengan `persist` middleware (`localStorage`)
- **Format Angka & Mata Uang**: Standar Rupiah Indonesia (`Rp 2.450.000` dengan `font-mono tabular-nums`)

---

## Fitur Utama Platform

1. **Dual-View Hardware Catalog**:
   - **Enterkomputer Pricelist View**: Tabel baris super padat tanpa gambar besar untuk *scrolling* ratusan SKU, melihat badge spesifikasi instan, dan membandingkan harga secepat kilat.
   - **Compact Grid View**: Kartu produk ringkas dengan 4 *badge* teknis utama, indikator status stok, dan garansi resmi.
2. **Interactive PC Builder (`/simulasi`)**:
   - Validasi kompatibilitas otomatis (*Socket CPU vs Mobo*, *DDR4 vs DDR5*, *Form Factor ATX/mATX/ITX*, *Panjang GPU vs Casing*, dan *Peringatan Update BIOS*).
   - Kalkulator estimasi daya (*Wattage Meter*) *real-time* beserta rekomendasi kapasitas PSU minimum.
   - Ekspor rakitan ke pesan **WhatsApp Admin**, **Salin Teks Forum/Discord**, **Shareable Link**, dan **Cetak Penawaran Harga (PDF/Print View)**.
3. **1-Click Prebuilt Templates (`/paket-rakitan`)**:
   - Template rakitan PC siap pakai berdasarkan *budget* & kebutuhan yang bisa langsung dimuat ke halaman Simulasi untuk dikustomisasi ulang.
4. **Hardware Comparison Engine (`/bandingkan`)**:
   - Perbandingan spesifikasi *side-by-side* hingga 4 produk dengan penyorotan otomatis pada spesifikasi yang lebih unggul dan harga termurah.
5. **Spreadsheet-Style Admin Pricelist (`/admin/pricelist`)**:
   - Editor harga dan status stok massal bergaya Excel untuk memperbarui ratusan komponen dalam hitungan detik.

---

## Cara Menjalankan Proyek (Development)

~~~bash
# 1. Install dependencies
npm install

# 2. Pastikan package pendukung terpasang
npm install zustand lucide-react clsx tailwind-merge

# 3. Jalankan development server
npm run dev
~~~

Buka `http://localhost:3000` di browser untuk melihat hasilnya.
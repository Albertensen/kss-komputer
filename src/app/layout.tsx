import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KSS Komputer — Spesialis PC Gaming, Workstation & Pricelist Hardware Jakarta',
  description:
    'Simulasi rakitan PC online real-time dengan cek kompatibilitas socket & daya otomatis, serta pricelist hardware terlengkap di Harco Mangga Dua.',
  keywords: [
    'rakit pc',
    'simulasi rakitan pc',
    'katalog harga komputer',
    'pricelist pc jakarta',
    'kss komputer',
    'rtx 4070 super',
    'ryzen 7 7800x3d',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AllerScan | Enterprise AI Food Allergy Scanner & Health Platform",
  description: "Instant food allergen detection, OCR label extraction, camera barcode scanner, Vision AI meal recognition, and personalized AI health advisor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}

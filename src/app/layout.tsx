import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const sans = Cairo({ subsets: ["latin"], weight: ["300", "400", "600", "700", "800"], display: "swap", variable: "--font-sans" });

const deskripsi = "Platform adopsi hewan terlantar dengan penilaian kelayakan calon pengadopsi.";

export const metadata: Metadata = {
  title: { default: "AdopsiKu | Adopsi hewan terlantar", template: "%s | AdopsiKu" },
  description: deskripsi,
  applicationName: "AdopsiKu",
  openGraph: { title: "AdopsiKu", description: deskripsi, type: "website", locale: "id_ID" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#219f9b" }, { media: "(prefers-color-scheme: dark)", color: "#0d1918" }],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="id" className={sans.variable}><body>{children}</body></html>);
}

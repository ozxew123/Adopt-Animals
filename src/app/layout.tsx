import type { Metadata, Viewport } from "next";
import { Epilogue, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

const deskripsi = "Platform adopsi hewan terlantar dengan penilaian kelayakan calon pengadopsi.";

export const metadata: Metadata = {
  title: { default: "AdopsiKu | Adopsi hewan terlantar", template: "%s | AdopsiKu" },
  description: deskripsi,
  applicationName: "AdopsiKu",
  openGraph: { title: "AdopsiKu", description: deskripsi, type: "website", locale: "id_ID" },
};

export const viewport: Viewport = {
  themeColor: "#fcfcfb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${epilogue.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

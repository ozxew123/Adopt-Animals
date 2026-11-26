"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ikon, type NamaIkon } from "./Ikon";

const MENU: { href: string; label: string; ikon: NamaIkon; juga?: string }[] = [
  { href: "/admin/dashboard", label: "Dashboard", ikon: "grid", juga: "/admin/pengajuan" },
  { href: "/admin/hewan", label: "Data Hewan", ikon: "paw" },
  { href: "/admin/kategori", label: "Kategori", ikon: "tag" },
  { href: "/admin/scoring", label: "Kriteria Scoring", ikon: "sliders" },
  { href: "/admin/riwayat", label: "Riwayat Adopsi", ikon: "history" },
];

// Menu sidebar admin dengan penanda halaman aktif (aria-current)
export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Menu admin">
      {MENU.map((m) => {
        const aktif = path === m.href || path.startsWith(m.href + "/") || (m.juga ? path.startsWith(m.juga) : false);
        return <Link key={m.href} href={m.href} aria-current={aktif ? "page" : undefined}><Ikon nama={m.ikon} />{m.label}</Link>;
      })}
    </nav>
  );
}

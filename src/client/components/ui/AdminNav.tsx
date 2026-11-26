import { Link, useLocation } from "react-router-dom";
import { Ikon, type NamaIkon } from "./Ikon";

const MENU: { href: string; label: string; ikon: NamaIkon; juga?: string[] }[] = [
  { href: "/admin/dashboard", label: "Dashboard", ikon: "grid", juga: ["/admin/pengajuan", "/admin/compare"] },
  { href: "/admin/hewan", label: "Data Hewan", ikon: "paw" },
  { href: "/admin/kategori", label: "Kategori", ikon: "tag" },
  { href: "/admin/scoring", label: "Kriteria Scoring", ikon: "sliders" },
  { href: "/admin/riwayat", label: "Riwayat Adopsi", ikon: "history" },
];

// Menu sidebar admin dengan penanda halaman aktif (aria-current)
export function AdminNav() {
  const { pathname: path } = useLocation();
  return (
    <nav className="adm-nav" aria-label="Menu admin">
      {MENU.map((m) => {
        const aktif =
          path === m.href ||
          path.startsWith(m.href + "/") ||
          (m.juga ? m.juga.some((prefix) => path.startsWith(prefix)) : false);
        return (
          <Link key={m.href} to={m.href} aria-current={aktif ? "page" : undefined}>
            <Ikon nama={m.ikon} />{m.label}
          </Link>
        );
      })}
    </nav>
  );
}

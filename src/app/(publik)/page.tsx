import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { Notice } from "@/components/ui/Notice";
import { KatalogInteraktif } from "@/components/ui/KatalogInteraktif";
import { hewanAktifPengguna } from "@/features/pengajuan/queries";

const PER_HALAMAN = 6;

// Beranda dan katalog hewan (FR-03, FR-04)
export default async function Beranda({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const jenis = Number(sp.jenis) || 0;
  const urut = sp.urut === "umur" ? "umur" : "baru";
  const tersedia = sp.tersedia === "1";
  const hal = Math.max(1, Number(sp.hal) || 1);

  const where = {
    ...(q ? { namaHewan: { contains: q, mode: "insensitive" as const } } : {}),
    ...(jenis ? { kategoriId: jenis } : {}),
    ...(tersedia ? { statusAdopsi: "TERSEDIA" as const } : {}),
  };
  const [total, hewan, kategori, sesi] = await Promise.all([
    prisma.hewan.count({ where }),
    prisma.hewan.findMany({ where, include: { kategori: true }, orderBy: urut === "umur" ? { umurBulan: "asc" } : { id: "desc" }, skip: (hal - 1) * PER_HALAMAN, take: PER_HALAMAN }),
    prisma.kategoriHewan.findMany({ orderBy: { namaKategori: "asc" } }),
    auth(),
  ]);
  const aktif = sesi?.user.role === "PENGADOPSI" ? await hewanAktifPengguna(Number(sesi.user.id)) : new Set<number>();
  const totalHal = Math.max(1, Math.ceil(total / PER_HALAMAN));

  return (
    <>
      <HeroBanner
        judul="Temukan sahabat baru untuk rumahmu."
        lead="Pilih hewan yang siap diadopsi, isi kuesioner singkat, dan pantau status pengajuanmu secara terbuka."
      >
        <a className="btn" href="#katalog">Lihat katalog hewan</a>
        <Link className="btn out" href={sesi ? "/dashboard" : "/register"}>{sesi ? "Dashboard saya" : "Buat akun"}</Link>
      </HeroBanner>
      <Notice ok={sp.ok} err={sp.err} />

      <section id="katalog" className="cat-sec" aria-labelledby="judul-katalog" style={{ scrollMarginTop: 16 }}>
        <div className="sec-head">
          <h2 id="judul-katalog">Katalog Hewan Adopsi</h2>
          <p className="sub">Hanya hewan berstatus Tersedia yang dapat diajukan untuk adopsi.</p>
        </div>
        <KatalogInteraktif
          kategori={kategori}
          initialHewan={hewan}
          total={total}
          totalHal={totalHal}
          hal={hal}
          q={q}
          jenis={jenis}
          urut={urut}
          tersedia={tersedia}
          aktifIds={Array.from(aktif)}
          sesi={!!sesi}
        />
      </section>
    </>
  );
}

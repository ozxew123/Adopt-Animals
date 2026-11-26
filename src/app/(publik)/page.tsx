import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Foto } from "@/components/ui/Foto";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { Ikon } from "@/components/ui/Ikon";
import { Notice } from "@/components/ui/Notice";
import { labelJK } from "@/lib/format";
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
  const link = (h: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (jenis) p.set("jenis", String(jenis));
    if (urut !== "baru") p.set("urut", urut);
    if (tersedia) p.set("tersedia", "1");
    p.set("hal", String(h));
    return `/?${p}`;
  };
  // Nomor halaman yang ditampilkan: pertama, terakhir, dan sekitar halaman aktif (null = "…")
  const nomor: (number | null)[] = [];
  for (let n = 1; n <= totalHal; n++) {
    if (n === 1 || n === totalHal || Math.abs(n - hal) <= 1) nomor.push(n);
    else if (nomor[nomor.length - 1] !== null) nomor.push(null);
  }

  return (
    <>
      <HeroBanner judul="Temukan Sahabat Berbulu untuk Dibawa Pulang" lead="Setiap hewan di AdopsiKu menunggu rumah yang aman. Pilih yang cocok, isi kuesioner singkat, dan admin shelter akan menindaklanjuti pengajuanmu.">
        <a className="btn cta" href="#katalog">Lihat katalog hewan</a>
        <Link className="btn cta" href={sesi ? "/dashboard" : "/register"}>{sesi ? "Dashboard saya" : "Buat akun"}</Link>
      </HeroBanner>
      <Notice ok={sp.ok} err={sp.err} />

      <section id="katalog" aria-labelledby="judul-katalog" style={{ scrollMarginTop: 16 }}>
        <h2 id="judul-katalog" style={{ fontSize: 28 }}>Katalog Hewan Adopsi</h2>
        <p className="sub">Hanya hewan berstatus Tersedia yang dapat diajukan untuk adopsi.</p>
        <div className="cat">
          <form className="filter sticky" action="/">
            {q && <input type="hidden" name="q" value={q} />}
            <fieldset className="fs">
              <legend>Kategori</legend>
              <div className="chips">
                <label className="chip"><input type="radio" name="jenis" value="" defaultChecked={!jenis} /><span>Semua</span></label>
                {kategori.map((k) => (<label key={k.id} className="chip"><input type="radio" name="jenis" value={k.id} defaultChecked={jenis === k.id} /><span>{k.namaKategori}</span></label>))}
              </div>
            </fieldset>
            <label htmlFor="urut" style={{ fontSize: 22, fontWeight: 800, marginTop: 20 }}>Urutkan</label>
            <select id="urut" name="urut" defaultValue={urut}><option value="baru">Hewan terbaru</option><option value="umur">Umur termuda</option></select>
            <div className="chips" style={{ marginTop: 14 }}>
              <label className="chip"><input type="checkbox" name="tersedia" value="1" defaultChecked={tersedia} /><span>Hanya yang Tersedia</span></label>
            </div>
            <button className="btn">Terapkan</button>
          </form>

          <div>
            <p className="note" style={{ marginTop: 0 }}>{total} hewan ditemukan{q ? ` untuk “${q}”` : ""}. Halaman <b>{hal}</b> dari total <b>{totalHal}</b> halaman.</p>
            {hewan.length === 0 ? (
              <div className="card empty">
                <div className="empty-ic"><Ikon nama="paw" className="ic lg" /></div>
                <h3>Belum ada hewan yang cocok</h3>
                <p className="note">Tidak ada hewan yang cocok. Ubah filter atau kata pencarian.</p>
                <Link className="btn sm out" href="/">Reset filter</Link>
              </div>
            ) : (
              <div className="grid">
                {hewan.map((h) => (
                  <article className="pet" key={h.id}>
                    <div className="pet-ph">
                      <Link href={`/hewan/${h.id}`} tabIndex={-1} aria-hidden="true"><Foto url={h.fotoHewan} kategori={h.kategori.namaKategori} nama={h.namaHewan} /></Link>
                      <span className="pet-badge"><Badge teks={h.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} /></span>
                    </div>
                    <div className="in">
                      <h3 className="pet-name"><Link href={`/hewan/${h.id}`}>{h.namaHewan}</Link></h3>
                      <ul className="meta">
                        <li><Ikon nama="paw" />{h.kategori.namaKategori}</li>
                        <li><Ikon nama="gender" />{labelJK(h.jenisKelamin)}</li>
                        <li><Ikon nama="cal" />{h.umurBulan} bulan</li>
                      </ul>
                      {h.statusAdopsi === "TERADOPSI" ? <span className="btn dis">Sudah Teradopsi</span>
                        : aktif.has(h.id) ? <span className="btn dis">Sudah Diajukan</span>
                        : <Link className="btn cta" href={sesi ? `/adopsi/ajukan/${h.id}` : "/login"}>Ajukan Adopsi</Link>}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {totalHal > 1 && (
              <nav className="pg" aria-label="Paginasi katalog">
                {hal > 1 ? <Link href={link(hal - 1)} rel="prev">Sebelumnya</Link> : <span className="pgi off" aria-disabled="true">Sebelumnya</span>}
                {nomor.map((n, i) => n === null ? <span key={`g${i}`} className="pgi gap" aria-hidden="true">…</span>
                  : n === hal ? <span key={n} className="pgi" aria-current="page">{n}</span>
                  : <Link key={n} href={link(n)} aria-label={`Halaman ${n}`}>{n}</Link>)}
                {hal < totalHal ? <Link href={link(hal + 1)} rel="next">Berikutnya</Link> : <span className="pgi off" aria-disabled="true">Berikutnya</span>}
              </nav>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

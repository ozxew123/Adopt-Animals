import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Ikon } from "@/components/ui/Ikon";
import { Notice } from "@/components/ui/Notice";
import { tanggal } from "@/lib/format";
import { putuskan } from "@/features/pengajuan/keputusan";
import { ambilBatas, ringkasanAdmin, semuaPengajuan } from "@/features/pengajuan/queries";
import { kategoriOtomatis, labelStatus, warnaRekomendasi } from "@/features/pengajuan/scoring";

export const metadata = { title: "Antrean Seleksi" };

const KELAS = { hijau: "rok", kuning: "rwn", merah: "rbad" } as const;

// FR-12, FR-13: antrean seluruh pengajuan, urut total_skor tertinggi, dengan label hijau/kuning/merah
export default async function AdminDashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [antrean, batas, ringkas] = await Promise.all([semuaPengajuan(), ambilBatas(), ringkasanAdmin()]);
  return (
    <>
      <h1>Antrean Seleksi</h1>
      <p className="sub">Diurutkan dari skor tertinggi. Hijau = direkomendasikan, kuning = perlu review, merah = tidak direkomendasikan.</p>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="stats">
        <div className="card statc"><span className="si"><Ikon nama="paw" /></span><div className="stat">{ringkas.tersedia}<small>Hewan tersedia</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="clock" /></span><div className="stat">{ringkas.masuk}<small>Pengajuan menunggu keputusan</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="check" /></span><div className="stat">{ringkas.teradopsi}<small>Hewan teradopsi</small></div></div>
      </div>
      <div className="tw"><table>
        <thead><tr><th>Pengadopsi</th><th>Hewan</th><th>Tanggal</th><th>Skor</th><th>Rekomendasi</th><th>Status</th><th>Keputusan</th></tr></thead>
        <tbody>
          {antrean.length === 0 && <tr><td colSpan={7}>Belum ada pengajuan.</td></tr>}
          {antrean.map((p) => {
            const k = kategoriOtomatis(p.totalSkor, batas);
            const selesai = p.tanggalKeputusan !== null;
            return (
              <tr key={p.id} className={KELAS[warnaRekomendasi(k)]}>
                <td><Link href={`/admin/pengajuan/${p.id}`}>{p.pengguna.namaLengkap}</Link></td>
                <td>{p.hewan.namaHewan}</td><td>{tanggal(p.tanggalPengajuan)}</td><td><b>{p.totalSkor}</b></td>
                <td><Badge teks={k} /></td><td><Badge teks={labelStatus[p.statusPengajuan]} /></td>
                <td>
                  {selesai ? <span className="note">Selesai</span>
                    : p.statusPengajuan === "DITOLAK" ? <Link className="btn sm out" href={`/admin/pengajuan/${p.id}`}>Tinjau</Link>
                    : (
                      <div className="inl">
                        <form action={putuskan}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="keputusan" value="DISETUJUI" />
                          <button className="btn sm">Setujui</button>
                        </form>
                        <form action={putuskan}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="keputusan" value="DITOLAK" />
                          <button className="btn sm red">Tolak</button>
                        </form>
                      </div>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <p className="note" style={{ marginTop: 12 }}>Jika disetujui, status hewan menjadi Teradopsi dan data masuk ke Riwayat Adopsi. Pengajuan lain untuk hewan yang sama ditolak otomatis.</p>
    </>
  );
}

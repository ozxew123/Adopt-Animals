import Link from "next/link";
import { wajibPengadopsi } from "@/lib/guard";
import { Badge } from "@/components/ui/Badge";
import { Ikon } from "@/components/ui/Ikon";
import { Notice } from "@/components/ui/Notice";
import { Rincian } from "@/components/ui/Rincian";
import { kode, tanggal } from "@/lib/format";
import { detailPengajuan, pengajuanSaya } from "@/features/pengajuan/queries";
import { labelStatus } from "@/features/pengajuan/scoring";

export const metadata = { title: "Dashboard" };

// Halaman akun pengadopsi: nomor pengajuan, total skor (Lembar Hasil Penilaian), dan status
export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await wajibPengadopsi();
  const sp = await searchParams;
  const daftar = await pengajuanSaya(Number(user.id));
  const lihat = Number(sp.lihat) || 0;
  const lembar = lihat && daftar.some((p) => p.id === lihat) ? await detailPengajuan(lihat) : null; // hanya milik sendiri
  const diproses = daftar.filter((p) => p.statusPengajuan === "MENUNGGU_REVIEW" || p.statusPengajuan === "LOLOS_KUALIFIKASI").length;
  const disetujui = daftar.filter((p) => p.statusPengajuan === "DISETUJUI").length;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">Halo, {user.name}. Skor dan status pengajuanmu diperbarui otomatis. Satu hewan tidak bisa diajukan dua kali selama pengajuan sebelumnya masih aktif.</p>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="stats">
        <div className="card statc"><span className="si"><Ikon nama="list" /></span><div className="stat">{daftar.length}<small>Total pengajuan</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="clock" /></span><div className="stat">{diproses}<small>Sedang diproses</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="check" /></span><div className="stat">{disetujui}<small>Disetujui</small></div></div>
      </div>
      <div className="tw"><table>
        <thead><tr><th>No. Pengajuan</th><th>Hewan</th><th>Tanggal</th><th>Total Skor</th><th>Status</th><th>Lembar Hasil</th></tr></thead>
        <tbody>
          {daftar.length === 0 && <tr><td colSpan={6}>Belum ada pengajuan. Pilih hewan di katalog untuk memulai.</td></tr>}
          {daftar.map((p) => (
            <tr key={p.id}>
              <td><b>{kode(p.id)}</b></td>
              <td>{p.hewan.namaHewan}</td>
              <td>{tanggal(p.tanggalPengajuan)}</td>
              <td><b>{p.totalSkor}</b></td>
              <td><Badge teks={labelStatus[p.statusPengajuan]} /></td>
              <td>
                <div className="inl" style={{ gap: 6 }}>
                  <Link className="btn sm out" href={`/dashboard?lihat=${p.id}`}>Lihat rincian</Link>
                  <Link className="btn sm out" href={`/pengajuan/${p.id}/cetak`} target="_blank" title="Cetak Lembar Resmi PDF">
                    <Ikon nama="printer" /> Cetak
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {lembar && (
        <section className="card lembar" style={{ marginTop: 20 }} aria-labelledby="jdl-lembar">
          <div className="lembar-h">
            <h3 id="jdl-lembar">Lembar Hasil Penilaian {kode(lembar.id)}: {lembar.hewan.namaHewan}</h3>
            <div className="inl" style={{ gap: 10 }}>
              <Badge teks={labelStatus[lembar.statusPengajuan]} />
              <Link className="btn sm" href={`/pengajuan/${lembar.id}/cetak`} target="_blank">
                <Ikon nama="printer" />
                Cetak Lembar Resmi (PDF)
              </Link>
            </div>
          </div>
          <div className="skor"><b>{lembar.totalSkor}</b><span>Total skor</span></div>
          <Rincian detail={lembar.detail} />
        </section>
      )}
      <Link className="btn sm" style={{ marginTop: 16 }} href="/">Ajukan adopsi hewan lain</Link>
    </>
  );
}

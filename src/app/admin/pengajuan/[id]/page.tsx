import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Ikon } from "@/components/ui/Ikon";
import { Rincian } from "@/components/ui/Rincian";
import { kode, labelJK, tanggal } from "@/lib/format";
import { putuskan } from "@/features/pengajuan/keputusan";
import { ambilBatas, detailPengajuan } from "@/features/pengajuan/queries";
import { kategoriOtomatis, labelStatus } from "@/features/pengajuan/scoring";

// FR-14: detail jawaban per kriteria dan keputusan akhir
export default async function DetailPengajuan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, batas] = await Promise.all([detailPengajuan(Number(id) || 0), ambilBatas()]);
  if (!p) notFound();
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <Link className="back" href="/admin/dashboard"><Ikon nama="arrow-left" />Kembali ke antrean</Link>
          <h1 style={{ marginTop: 8 }}>Detail Pengajuan {kode(p.id)}</h1>
          <p className="sub">Tanggal pengajuan {tanggal(p.tanggalPengajuan)}</p>
        </div>
        <Link
          href={`/pengajuan/${p.id}/cetak`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn sm out"
          style={{ textDecoration: "none", marginTop: 12 }}
        >
          <Ikon nama="printer" />
          <span>Cetak Lembar Penilaian</span>
        </Link>
      </div>
      <div className="split rev">
        <div className="stack">
          <div className="card"><h3>Profil pengadopsi</h3>
            <dl className="kv">
              <dt>Nama</dt><dd>{p.pengguna.namaLengkap}</dd>
              <dt>Email</dt><dd>{p.pengguna.email}</dd>
              <dt>No. telepon</dt><dd>{p.pengguna.noTelp ?? "-"}</dd>
              <dt>Alamat</dt><dd>{p.pengguna.alamat ?? "-"}</dd>
            </dl></div>
          <div className="card"><h3>Hewan yang diajukan</h3>{p.hewan.namaHewan}, {p.hewan.kategori.namaKategori}, {labelJK(p.hewan.jenisKelamin)}, {p.hewan.umurBulan} bulan</div>
        </div>
        <div className="card lembar">
          <div className="lembar-h"><h3>Rincian penilaian</h3><Badge teks={labelStatus[p.statusPengajuan]} /></div>
          <div className="skor"><b>{p.totalSkor}</b><span>Total skor</span><Badge teks={kategoriOtomatis(p.totalSkor, batas)} /></div>
          <Rincian detail={p.detail} />
          <div style={{ padding: "0 20px 20px" }}>
            {p.tanggalKeputusan ? <p className="note">Diputuskan pada {tanggal(p.tanggalKeputusan)}.</p> : (
              <div className="inl" style={{ marginTop: 12 }}>
                <form action={putuskan}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="keputusan" value="DISETUJUI" />
                  <button className="btn sm">Setujui Adopsi</button>
                </form>
                <form action={putuskan}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="keputusan" value="DITOLAK" />
                  <button className="btn sm red">Tolak Adopsi</button>
                </form>
              </div>
            )}
            <p className="note" style={{ marginBottom: 0 }}>Jika disetujui, hewan menjadi Teradopsi dan pengajuan masuk ke Riwayat Adopsi.</p>
          </div>
        </div>
      </div>
    </>
  );
}

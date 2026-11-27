import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi, ApiError } from "@/client/services";
import type { PengajuanDetail } from "@/client/services/PengajuanApiService";
import { Badge } from "@/client/components/ui/Badge";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";
import { Rincian } from "@/client/components/ui/Rincian";
import { Skeleton } from "@/client/components/ui/Skeleton";
import { kode, labelJK, tanggal } from "@/shared/format";
import { kategoriOtomatis, labelStatus, type Batas } from "@/shared/scoring";
import { NotFoundPage } from "./NotFoundPage";

export function AdminDetailPengajuanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [p, setP] = useState<PengajuanDetail | null>(null);
  const [batas, setBatas] = useState<Batas>({ batasLolos: 80, batasTolak: 50 });
  const [jumlahPelamar, setJumlahPelamar] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .getPengajuanDetail(id ?? 0)
      .then((res) => {
        if (!active) return;
        setP(res.pengajuan);
        setBatas(res.batas);
        setJumlahPelamar(res.jumlahPelamarHewan);
        document.title = `Detail Pengajuan ${kode(res.pengajuan.id)} | AdopsiKu`;
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function putuskan(keputusan: "DISETUJUI" | "DITOLAK") {
    if (!p) return;
    if (keputusan === "DISETUJUI") {
      const pesan =
        `Setujui adopsi ${p.hewan.namaHewan} oleh ${p.pengguna.namaLengkap}?\n\n` +
        `Status ${p.hewan.namaHewan} akan menjadi Teradopsi dan pengajuan lain yang belum diputuskan untuk hewan ini ditolak otomatis.`;
      if (!window.confirm(pesan)) return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await adminApi.putuskan(p.id, keputusan);
      navigate(`/admin/dashboard?ok=${encodeURIComponent(res.ok)}`);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Gagal memproses keputusan.");
      setBusy(false);
    }
  }

  if (loading) return <Skeleton tinggi={320} />;
  if (notFound || !p) return <NotFoundPage />;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <Link className="back" to="/admin/dashboard"><Ikon nama="arrow-left" />Kembali ke antrean</Link>
          <h1 style={{ marginTop: 8 }}>Detail Pengajuan {kode(p.id)}</h1>
          <p className="sub">Tanggal pengajuan {tanggal(p.tanggalPengajuan)}</p>
        </div>
        <div className="inl" style={{ marginTop: 12 }}>
          {jumlahPelamar > 1 && (
            <Link to={`/admin/compare/${p.hewanId}`} className="btn sm out">
              <Ikon nama="users" />
              <span>Bandingkan Pelamar ({jumlahPelamar})</span>
            </Link>
          )}
          <Link
            to={`/pengajuan/${p.id}/cetak`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn sm out"
            style={{ textDecoration: "none" }}
          >
            <Ikon nama="printer" />
            <span>Cetak Lembar Penilaian</span>
          </Link>
        </div>
      </div>
      <Notice err={err} />
      <div className="split rev">
        <div className="stack">
          <div className="card">
            <h3>Profil pengadopsi</h3>
            <dl className="kv">
              <dt>Nama</dt><dd>{p.pengguna.namaLengkap}</dd>
              <dt>Email</dt><dd>{p.pengguna.email}</dd>
              <dt>No. telepon</dt><dd>{p.pengguna.noTelp ?? "-"}</dd>
              <dt>Alamat</dt><dd>{p.pengguna.alamat ?? "-"}</dd>
            </dl>
          </div>
          <div className="card">
            <h3>Hewan yang diajukan</h3>
            {p.hewan.namaHewan}, {p.hewan.kategori.namaKategori}, {labelJK(p.hewan.jenisKelamin)}, {p.hewan.umurBulan} bulan
          </div>
        </div>
        <div className="card lembar">
          <div className="lembar-h"><h3>Rincian penilaian</h3><Badge teks={labelStatus[p.statusPengajuan]} /></div>
          <div className="skor"><b>{p.totalSkor}</b><span>Total skor</span><Badge teks={kategoriOtomatis(p.totalSkor, batas)} /></div>
          <Rincian detail={p.detail} />
          <div style={{ padding: "0 20px 20px" }}>
            {p.tanggalKeputusan ? (
              <p className="note">Diputuskan pada {tanggal(p.tanggalKeputusan)}.</p>
            ) : (
              <div className="inl" style={{ marginTop: 12 }}>
                <button type="button" className="btn sm" disabled={busy} onClick={() => putuskan("DISETUJUI")}>Setujui Adopsi</button>
                <button type="button" className="btn sm red" disabled={busy} onClick={() => putuskan("DITOLAK")}>Tolak Adopsi</button>
              </div>
            )}
            <p className="note" style={{ marginBottom: 0 }}>Jika disetujui, hewan menjadi Teradopsi dan pengajuan masuk ke Riwayat Adopsi.</p>
          </div>
        </div>
      </div>
    </>
  );
}

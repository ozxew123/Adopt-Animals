import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/client/lib/auth";
import { ApiError, pengajuanApi } from "@/client/services";
import type { PengajuanDetail } from "@/client/services/PengajuanApiService";
import { Badge } from "@/client/components/ui/Badge";
import { Ikon } from "@/client/components/ui/Ikon";
import { Skeleton } from "@/client/components/ui/Skeleton";
import { TombolCetak } from "@/client/components/ui/TombolCetak";
import { kode, labelJK, tanggal } from "@/shared/format";
import { kategoriOtomatis, labelStatus, type Batas } from "@/shared/scoring";
import { NotFoundPage } from "./NotFoundPage";

export function CetakPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [p, setP] = useState<PengajuanDetail | null>(null);
  const [batas, setBatas] = useState<Batas>({ batasLolos: 80, batasTolak: 50 });
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = "Lembar Hasil Penilaian | AdopsiKu";
    let active = true;
    setLoading(true);
    pengajuanApi
      .getDetail(id ?? 0)
      .then((res) => {
        if (!active) return;
        setP(res.pengajuan);
        setBatas(res.batas);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 403) setForbidden(true);
        else setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (forbidden) return <Navigate to="/dashboard" replace />;
  if (loading) return <div className="doc-wrapper"><Skeleton tinggi={400} /></div>;
  if (notFound || !p) return <NotFoundPage />;

  const rekomendasi = kategoriOtomatis(p.totalSkor, batas);
  const kembaliUrl = user?.role === "ADMIN" ? `/admin/pengajuan/${p.id}` : "/dashboard";

  return (
    <div className="doc-wrapper">
      <div className="doc-actions noprint">
        <Link className="btn sm out" to={kembaliUrl}>
          <Ikon nama="arrow-left" />
          {user?.role === "ADMIN" ? "Kembali ke Detail Pengajuan" : "Kembali ke Dashboard"}
        </Link>
        <div className="inl" style={{ gap: 10 }}>
          <TombolCetak />
        </div>
      </div>

      <article className="doc-sheet">
        <header className="doc-header">
          <div className="doc-brand">
            <span className="doc-logo">
              <Ikon nama="paw" />
            </span>
            <div>
              <h1 className="doc-org">SHELTER ADOPSIKU</h1>
              <p className="doc-suborg">Pusat Penyelamatan &amp; Adopsi Hewan Terlantar</p>
              <p className="doc-contact">Jl. Melati Raya No. 12, Jakarta · Telp: (021) 7890-1234 · info@adopsiku.test</p>
            </div>
          </div>
          <div className="doc-meta">
            <span className="doc-title-badge">DOKUMEN RESMI</span>
            <div className="doc-meta-item">
              <span>No. Registrasi:</span>
              <b>{kode(p.id)}</b>
            </div>
            <div className="doc-meta-item">
              <span>Tanggal Pengajuan:</span>
              <span>{tanggal(p.tanggalPengajuan)}</span>
            </div>
            <div className="doc-meta-item">
              <span>Tanggal Cetak:</span>
              <span>{tanggal(new Date())}</span>
            </div>
          </div>
        </header>

        <div className="doc-divider" />

        <div className="doc-heading-wrap">
          <h2 className="doc-heading">LEMBAR HASIL PENILAIAN KELAYAKAN CALON PENGADOPSI</h2>
          <p className="doc-desc">
            Berdasarkan Evaluasi Kuesioner Kelayakan Menggunakan Metode <i>Scoring System</i>
          </p>
        </div>

        <div className="doc-grid-2">
          <div className="doc-box">
            <h3 className="doc-box-title">I. Profil Calon Pengadopsi</h3>
            <dl className="doc-kv">
              <dt>Nama Lengkap</dt>
              <dd>: <b>{p.pengguna.namaLengkap}</b></dd>
              <dt>Alamat Email</dt>
              <dd>: {p.pengguna.email}</dd>
              <dt>Nomor Telepon</dt>
              <dd>: {p.pengguna.noTelp || "-"}</dd>
              <dt>Alamat Domisili</dt>
              <dd>: {p.pengguna.alamat || "-"}</dd>
            </dl>
          </div>

          <div className="doc-box">
            <h3 className="doc-box-title">II. Profil Hewan yang Diajukan</h3>
            <dl className="doc-kv">
              <dt>Nama Hewan</dt>
              <dd>: <b>{p.hewan.namaHewan}</b></dd>
              <dt>Kategori / Jenis</dt>
              <dd>: {p.hewan.kategori.namaKategori}</dd>
              <dt>Jenis Kelamin</dt>
              <dd>: {labelJK(p.hewan.jenisKelamin)}</dd>
              <dt>Perkiraan Usia</dt>
              <dd>: {p.hewan.umurBulan} Bulan</dd>
            </dl>
          </div>
        </div>

        <div className="doc-section">
          <h3 className="doc-box-title">III. Rincian Penilaian Kuesioner Kelayakan</h3>
          <table className="doc-table-score">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: "center" }}>No</th>
                <th>Kriteria Penilaian</th>
                <th>Jawaban Calon Pengadopsi</th>
                <th style={{ width: 100, textAlign: "center" }}>Nilai Poin</th>
              </tr>
            </thead>
            <tbody>
              {p.detail.map((d, index) => (
                <tr key={d.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td><b>{d.kriteria.namaKriteria}</b></td>
                  <td>{d.opsi.keteranganJawaban}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>+{d.poin}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right", fontWeight: 800 }}>
                  TOTAL SKOR KELAYAKAN
                </td>
                <td style={{ textAlign: "center", fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>
                  {p.totalSkor}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="doc-section">
          <h3 className="doc-box-title">IV. Kesimpulan &amp; Rekomendasi Seleksi</h3>
          <div className="doc-result-card">
            <div className="doc-result-item">
              <span className="doc-result-label">Ambang Batas Shelter</span>
              <span className="doc-result-val">
                Lolos &gt; {batas.batasLolos} | Review {batas.batasTolak}–{batas.batasLolos} | Tolak &lt; {batas.batasTolak}
              </span>
            </div>
            <div className="doc-result-item">
              <span className="doc-result-label">Rekomendasi Sistem</span>
              <span className="doc-result-val">
                <Badge teks={rekomendasi} />
              </span>
            </div>
            <div className="doc-result-item">
              <span className="doc-result-label">Keputusan Akhir Shelter</span>
              <span className="doc-result-val">
                <Badge teks={labelStatus[p.statusPengajuan]} />
              </span>
            </div>
            <div className="doc-result-item">
              <span className="doc-result-label">Status Verifikasi</span>
              <span className="doc-result-val">
                {p.tanggalKeputusan
                  ? `Telah diputuskan pada ${tanggal(p.tanggalKeputusan)}`
                  : "Menunggu peninjauan final oleh admin shelter"}
              </span>
            </div>
          </div>
        </div>

        <div className="doc-sign-wrapper">
          <div className="doc-sign-col">
            <p className="doc-sign-date">Calon Pengadopsi,</p>
            <div className="doc-sign-space" />
            <p className="doc-sign-name">( {p.pengguna.namaLengkap} )</p>
            <p className="doc-sign-role">Pemohon Adopsi</p>
          </div>
          <div className="doc-sign-col">
            <p className="doc-sign-date">Jakarta, {tanggal(p.tanggalKeputusan || new Date())}</p>
            <div className="doc-sign-space" />
            <p className="doc-sign-name">( Administrator AdopsiKu )</p>
            <p className="doc-sign-role">Petugas Verifikasi Shelter</p>
          </div>
        </div>

        <footer className="doc-footer-legal">
          <p>
            Dokumen ini merupakan Lembar Hasil Penilaian Kelayakan Adopsi resmi yang dihasilkan secara otomatis
            oleh Sistem Informasi AdopsiKu berdasarkan metode <i>Scoring System</i> (Tugas SBD Kelompok 5).
          </p>
        </footer>
      </article>
    </div>
  );
}

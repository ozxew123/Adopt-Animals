import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { wajibLogin } from "@/lib/guard";
import { detailPengajuan, ambilBatas } from "@/features/pengajuan/queries";
import { kode, tanggal, labelJK } from "@/lib/format";
import { kategoriOtomatis, labelStatus } from "@/features/pengajuan/scoring";
import { Ikon } from "@/components/ui/Ikon";
import { Badge } from "@/components/ui/Badge";
import { TombolCetak } from "@/components/ui/TombolCetak";

export const metadata = {
  title: "Lembar Hasil Penilaian",
};

export default async function CetakLembarPenilaian({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await wajibLogin();
  const [p, batas] = await Promise.all([
    detailPengajuan(Number(id) || 0),
    ambilBatas(),
  ]);

  if (!p) notFound();

  // Otorisasi: hanya pemilik pengajuan atau admin yang berhak mengakses
  if (user.role !== "ADMIN" && p.penggunaId !== Number(user.id)) {
    redirect("/dashboard");
  }

  const rekomendasi = kategoriOtomatis(p.totalSkor, batas);
  const kembaliUrl = user.role === "ADMIN" ? `/admin/pengajuan/${p.id}` : "/dashboard";

  return (
    <div className="doc-wrapper">
      {/* Action bar (hanya tampil di layar, otomatis tersembunyi saat dicetak) */}
      <div className="doc-actions noprint">
        <Link className="btn sm out" href={kembaliUrl}>
          <Ikon nama="arrow-left" />
          {user.role === "ADMIN" ? "Kembali ke Detail Pengajuan" : "Kembali ke Dashboard"}
        </Link>
        <div className="inl" style={{ gap: 10 }}>
          <TombolCetak />
        </div>
      </div>

      {/* Lembar Dokumen Fisik Resmi */}
      <article className="doc-sheet">
        {/* Kop Surat Dokumen */}
        <header className="doc-header">
          <div className="doc-brand">
            <span className="doc-logo">
              <Ikon nama="paw" />
            </span>
            <div>
              <h1 className="doc-org">SHELTER ADOPSIKU</h1>
              <p className="doc-suborg">Pusat Penyelamatan & Adopsi Hewan Terlantar</p>
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

        {/* Informasi Pemohon & Hewan */}
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

        {/* Tabel Penilaian Kelayakan */}
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
                  <td>
                    <b>{d.kriteria.namaKriteria}</b>
                  </td>
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

        {/* Kesimpulan & Rekomendasi */}
        <div className="doc-section">
          <h3 className="doc-box-title">IV. Kesimpulan & Rekomendasi Seleksi</h3>
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

        {/* Kolom Tanda Tangan Pengesahan */}
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

        {/* Catatan Kaki */}
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

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, ApiError } from "@/client/services";
import type { CompareResponse } from "@/client/services/AdminApiService";
import { Badge } from "@/client/components/ui/Badge";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";
import { Skeleton } from "@/client/components/ui/Skeleton";
import { kode, labelJK, tanggal } from "@/shared/format";
import { kategoriOtomatis, labelStatus } from "@/shared/scoring";
import { NotFoundPage } from "./NotFoundPage";

export function AdminComparePage() {
  const { hewanId } = useParams<{ hewanId: string }>();
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminApi.getCompare(hewanId ?? 0);
    setData(res);
    document.title = `Bandingkan Pengajuan: ${res.hewan.namaHewan} | AdopsiKu`;
  }, [hewanId]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    load()
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [load]);

  async function handlePutuskan(id: number, keputusan: "DISETUJUI" | "DITOLAK") {
    setOk(null);
    setErr(null);
    setBusyId(id);
    try {
      const res = await adminApi.putuskan(id, keputusan);
      setOk(res.ok);
      await load();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Gagal memproses keputusan.");
    } finally {
      setBusyId(null);
    }
  }

  function setujui(p: CompareResponse["pengajuan"][number]) {
    const lain = (data?.pengajuan ?? []).filter((x) => x.tanggalKeputusan === null && x.id !== p.id).length;
    const nama = data?.hewan.namaHewan ?? "hewan ini";
    const pesan =
      `Setujui adopsi ${nama} oleh ${p.pengguna.namaLengkap}?\n\n` +
      `Status ${nama} akan menjadi Teradopsi` +
      (lain > 0 ? ` dan ${lain} pengajuan lain yang belum diputuskan ditolak otomatis.` : ".");
    if (window.confirm(pesan)) void handlePutuskan(p.id, "DISETUJUI");
  }

  if (loading) return <Skeleton tinggi={360} />;
  if (notFound || !data) return <NotFoundPage />;

  const { hewan, kriteria, pengajuan, batas } = data;
  const maxSkor = pengajuan.length > 0 ? Math.max(...pengajuan.map((p) => p.totalSkor)) : 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <Link className="back" to="/admin/dashboard"><Ikon nama="arrow-left" />Kembali ke antrean</Link>
          <h1 style={{ marginTop: 8 }}>Bandingkan Pelamar: {hewan.namaHewan}</h1>
          <p className="sub">
            {hewan.kategori.namaKategori}, {labelJK(hewan.jenisKelamin)}, {hewan.umurBulan} bulan · {pengajuan.length} pengajuan
          </p>
        </div>
        <div style={{ marginTop: 12 }}>
          <Badge teks={hewan.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} />
        </div>
      </div>

      <Notice ok={ok} err={err} />

      {pengajuan.length === 0 ? (
        <div className="card empty">
          <h3>Belum ada pengajuan untuk {hewan.namaHewan}</h3>
          <p className="note">Pelamar akan tampil berdampingan di halaman ini setelah ada pengajuan masuk.</p>
          <Link className="btn sm out" to="/admin/dashboard">Kembali ke antrean</Link>
        </div>
      ) : (
        <div className="tw">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-label">Aspek / Kriteria</th>
                {pengajuan.map((p, idx) => {
                  const isTop = p.totalSkor === maxSkor && pengajuan.length > 1;
                  return (
                    <th key={p.id} className={isTop ? "compare-top" : undefined}>
                      <div className="compare-col-head">
                        <div>
                          <span className="compare-rank">#{idx + 1} · {kode(p.id)}</span>
                          <Link to={`/admin/pengajuan/${p.id}`} className="compare-name">
                            {p.pengguna.namaLengkap}
                          </Link>
                        </div>
                        {isTop && <span className="tag ok">Skor Tertinggi</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="compare-label">Total Skor</th>
                {pengajuan.map((p) => (
                  <td key={p.id}>
                    <div className="inl">
                      <b style={{ fontSize: 20 }} className="num">{p.totalSkor}</b>
                      <Badge teks={kategoriOtomatis(p.totalSkor, batas)} />
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="compare-label">Status Pengajuan</th>
                {pengajuan.map((p) => (
                  <td key={p.id}>
                    <Badge teks={labelStatus[p.statusPengajuan]} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="compare-label">Tanggal Pengajuan</th>
                {pengajuan.map((p) => (
                  <td key={p.id}>{tanggal(p.tanggalPengajuan)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="compare-label">Kontak &amp; Domisili</th>
                {pengajuan.map((p) => (
                  <td key={p.id}>
                    <div>{p.pengguna.email}</div>
                    <div className="note" style={{ margin: "2px 0 0" }}>{p.pengguna.noTelp || "-"}</div>
                    <div className="note" style={{ margin: "2px 0 0" }}>{p.pengguna.alamat || "-"}</div>
                  </td>
                ))}
              </tr>
              {kriteria.map((k) => (
                <tr key={k.id}>
                  <th scope="row" className="compare-label">{k.namaKriteria}</th>
                  {pengajuan.map((p) => {
                    const ans = p.detail.find((d) => d.kriteriaId === k.id);
                    return (
                      <td key={p.id}>
                        {ans ? (
                          <div className="compare-ans">
                            <span>{ans.opsi.keteranganJawaban}</span>
                            <span className="poinb">+{ans.poin} poin</span>
                          </div>
                        ) : (
                          <span className="note">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row" className="compare-label">Keputusan</th>
                {pengajuan.map((p) => (
                  <td key={p.id}>
                    {p.tanggalKeputusan ? (
                      <span className="note">Diputuskan {tanggal(p.tanggalKeputusan)}</span>
                    ) : (
                      <div className="inl">
                        <button
                          type="button"
                          className="btn sm"
                          disabled={busyId === p.id}
                          onClick={() => setujui(p)}
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          className="btn sm red"
                          disabled={busyId === p.id}
                          onClick={() => handlePutuskan(p.id, "DITOLAK")}
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p className="note" style={{ marginTop: 12 }}>
        Jika salah satu pengajuan disetujui, status {hewan.namaHewan} otomatis menjadi Teradopsi dan pengajuan lain yang belum diputuskan ditolak otomatis.
      </p>
    </>
  );
}

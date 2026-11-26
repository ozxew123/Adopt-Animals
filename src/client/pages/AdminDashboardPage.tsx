import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminApi, ApiError } from "@/client/services";
import type { AdminDashboardResponse } from "@/client/services/AdminApiService";
import { Badge } from "@/client/components/ui/Badge";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";
import { Skeleton } from "@/client/components/ui/Skeleton";
import { tanggal } from "@/shared/format";
import { kategoriOtomatis, labelStatus, warnaRekomendasi } from "@/shared/scoring";

const KELAS = { hijau: "rok", kuning: "rwn", merah: "rbad" } as const;

export function AdminDashboardPage() {
  const [sp] = useSearchParams();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [ok, setOk] = useState<string | null>(sp.get("ok"));
  const [err, setErr] = useState<string | null>(sp.get("err"));

  const load = useCallback(async () => {
    const res = await adminApi.getDashboard();
    setData(res);
  }, []);

  useEffect(() => {
    document.title = "Antrean Seleksi | AdopsiKu";
    load().finally(() => setLoading(false));
  }, [load]);

  const pelamarGanda = useMemo(() => {
    if (!data) return { byHewan: new Map<number, number>(), list: [] as { hewanId: number; namaHewan: string; jumlah: number }[] };
    const counts = new Map<number, { namaHewan: string; jumlah: number }>();
    for (const p of data.antrean) {
      const curr = counts.get(p.hewanId);
      if (curr) curr.jumlah += 1;
      else counts.set(p.hewanId, { namaHewan: p.hewan.namaHewan, jumlah: 1 });
    }
    const byHewan = new Map<number, number>();
    const list: { hewanId: number; namaHewan: string; jumlah: number }[] = [];
    for (const [hewanId, info] of counts.entries()) {
      byHewan.set(hewanId, info.jumlah);
      if (info.jumlah > 1) list.push({ hewanId, ...info });
    }
    return { byHewan, list };
  }, [data]);

  async function putuskan(id: number, keputusan: "DISETUJUI" | "DITOLAK") {
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

  return (
    <>
      <h1>Antrean Seleksi</h1>
      <p className="sub">Diurutkan dari skor tertinggi. Hijau = direkomendasikan, kuning = perlu review, merah = tidak direkomendasikan.</p>
      <Notice ok={ok} err={err} />
      <div className="stats">
        <div className="card statc"><span className="si"><Ikon nama="paw" /></span><div className="stat">{data?.ringkas.tersedia ?? 0}<small>Hewan tersedia</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="clock" /></span><div className="stat">{data?.ringkas.masuk ?? 0}<small>Pengajuan menunggu keputusan</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="check" /></span><div className="stat">{data?.ringkas.teradopsi ?? 0}<small>Hewan teradopsi</small></div></div>
      </div>

      {pelamarGanda.list.length > 0 && (
        <div className="card compare-bar" aria-label="Bandingkan pengajuan hewan yang sama">
          <div className="inl" style={{ justifyContent: "space-between", width: "100%" }}>
            <div>
              <b>Hewan dengan lebih dari 1 pelamar:</b>{" "}
              <span className="note" style={{ margin: 0 }}>Bandingkan jawaban dan skor kandidat secara berdampingan.</span>
            </div>
            <div className="inl">
              {pelamarGanda.list.map((item) => (
                <Link key={item.hewanId} className="btn sm out" to={`/admin/compare/${item.hewanId}`}>
                  Bandingkan {item.namaHewan} ({item.jumlah})
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading || !data ? (
        <Skeleton tinggi={240} />
      ) : (
        <div className="tw">
          <table>
            <thead>
              <tr><th>Pengadopsi</th><th>Hewan</th><th>Tanggal</th><th>Skor</th><th>Rekomendasi</th><th>Status</th><th>Keputusan</th></tr>
            </thead>
            <tbody>
              {data.antrean.length === 0 && <tr><td colSpan={7}>Belum ada pengajuan.</td></tr>}
              {data.antrean.map((p) => {
                const k = kategoriOtomatis(p.totalSkor, data.batas);
                const selesai = p.tanggalKeputusan !== null;
                const jumlahPelamar = pelamarGanda.byHewan.get(p.hewanId) ?? 1;
                return (
                  <tr key={p.id} className={KELAS[warnaRekomendasi(k)]}>
                    <td><Link to={`/admin/pengajuan/${p.id}`}>{p.pengguna.namaLengkap}</Link></td>
                    <td>
                      <div className="inl">
                        <span>{p.hewan.namaHewan}</span>
                        {jumlahPelamar > 1 && (
                          <Link className="compare-link" to={`/admin/compare/${p.hewanId}`}>
                            Bandingkan ({jumlahPelamar})
                          </Link>
                        )}
                      </div>
                    </td>
                    <td>{tanggal(p.tanggalPengajuan)}</td>
                    <td><b>{p.totalSkor}</b></td>
                    <td><Badge teks={k} /></td>
                    <td><Badge teks={labelStatus[p.statusPengajuan]} /></td>
                    <td>
                      {selesai ? (
                        <span className="note">Selesai</span>
                      ) : p.statusPengajuan === "DITOLAK" ? (
                        <Link className="btn sm out" to={`/admin/pengajuan/${p.id}`}>Tinjau</Link>
                      ) : (
                        <div className="inl">
                          <button type="button" className="btn sm" disabled={busyId === p.id} onClick={() => putuskan(p.id, "DISETUJUI")}>Setujui</button>
                          <button type="button" className="btn sm red" disabled={busyId === p.id} onClick={() => putuskan(p.id, "DITOLAK")}>Tolak</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="note" style={{ marginTop: 12 }}>
        Jika disetujui, status hewan menjadi Teradopsi dan data masuk ke Riwayat Adopsi. Pengajuan lain untuk hewan yang sama ditolak otomatis.
      </p>
    </>
  );
}

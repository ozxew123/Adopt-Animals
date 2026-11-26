import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/client/lib/auth";
import { pengajuanApi } from "@/client/services";
import type { PengajuanDetail, PengajuanRow } from "@/client/services/PengajuanApiService";
import { Badge } from "@/client/components/ui/Badge";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";
import { Rincian } from "@/client/components/ui/Rincian";
import { Skeleton } from "@/client/components/ui/Skeleton";
import { kode, tanggal } from "@/shared/format";
import { labelStatus } from "@/shared/scoring";

export function DashboardPage() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [daftar, setDaftar] = useState<PengajuanRow[]>([]);
  const [lembar, setLembar] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const lihat = Number(sp.get("lihat")) || 0;
  const ok = sp.get("ok");
  const err = sp.get("err");

  useEffect(() => {
    document.title = "Dashboard | AdopsiKu";
    let active = true;
    setLoading(true);
    pengajuanApi
      .listMine()
      .then((res) => {
        if (active) setDaftar(res.daftar);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!lihat || !daftar.some((p) => p.id === lihat)) {
      setLembar(null);
      return;
    }
    let active = true;
    pengajuanApi
      .getDetail(lihat)
      .then((res) => {
        if (active) setLembar(res.pengajuan);
      })
      .catch(() => {
        if (active) setLembar(null);
      });
    return () => {
      active = false;
    };
  }, [lihat, daftar]);

  const diproses = daftar.filter((p) => p.statusPengajuan === "MENUNGGU_REVIEW" || p.statusPengajuan === "LOLOS_KUALIFIKASI").length;
  const disetujui = daftar.filter((p) => p.statusPengajuan === "DISETUJUI").length;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">Halo, {user?.name}. Skor dan status pengajuanmu diperbarui otomatis. Satu hewan tidak bisa diajukan dua kali selama pengajuan sebelumnya masih aktif.</p>
      <Notice ok={ok} err={err} />
      <div className="stats">
        <div className="card statc"><span className="si"><Ikon nama="list" /></span><div className="stat">{daftar.length}<small>Total pengajuan</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="clock" /></span><div className="stat">{diproses}<small>Sedang diproses</small></div></div>
        <div className="card statc"><span className="si"><Ikon nama="check" /></span><div className="stat">{disetujui}<small>Disetujui</small></div></div>
      </div>
      {loading ? (
        <Skeleton tinggi={200} />
      ) : (
        <div className="tw">
          <table>
            <thead>
              <tr><th>No. Pengajuan</th><th>Hewan</th><th>Tanggal</th><th>Total Skor</th><th>Status</th><th>Lembar Hasil</th></tr>
            </thead>
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
                      <Link className="btn sm out" to={`/dashboard?lihat=${p.id}`}>Lihat rincian</Link>
                      <Link className="btn sm out" to={`/pengajuan/${p.id}/cetak`} target="_blank" title="Cetak Lembar Resmi PDF">
                        <Ikon nama="printer" /> Cetak
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {lembar && (
        <section className="card lembar" style={{ marginTop: 20 }} aria-labelledby="jdl-lembar">
          <div className="lembar-h">
            <h3 id="jdl-lembar">Lembar Hasil Penilaian {kode(lembar.id)}: {lembar.hewan.namaHewan}</h3>
            <div className="inl" style={{ gap: 10 }}>
              <Badge teks={labelStatus[lembar.statusPengajuan]} />
              <Link className="btn sm" to={`/pengajuan/${lembar.id}/cetak`} target="_blank">
                <Ikon nama="printer" />
                Cetak Lembar Resmi (PDF)
              </Link>
            </div>
          </div>
          <div className="skor"><b>{lembar.totalSkor}</b><span>Total skor</span></div>
          <Rincian detail={lembar.detail} />
        </section>
      )}
      <Link className="btn sm" style={{ marginTop: 16 }} to="/">Ajukan adopsi hewan lain</Link>
    </>
  );
}

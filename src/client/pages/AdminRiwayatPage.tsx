import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "@/client/services";
import type { RiwayatRow } from "@/client/services/AdminApiService";
import { Ikon } from "@/client/components/ui/Ikon";
import { Skeleton } from "@/client/components/ui/Skeleton";
import { TombolCetak } from "@/client/components/ui/TombolCetak";
import type { KategoriItem } from "@/client/components/ui/KatalogInteraktif";
import { tanggal } from "@/shared/format";

export function AdminRiwayatPage() {
  const [sp, setSp] = useSearchParams();
  const dariParam = sp.get("dari") ?? "";
  const sampaiParam = sp.get("sampai") ?? "";
  const kategoriParam = sp.get("kategori") ?? "";

  const [dari, setDari] = useState(dariParam);
  const [sampai, setSampai] = useState(sampaiParam);
  const [kategoriVal, setKategoriVal] = useState(kategoriParam);
  const [rows, setRows] = useState<RiwayatRow[]>([]);
  const [kategori, setKategori] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDari(dariParam);
    setSampai(sampaiParam);
    setKategoriVal(kategoriParam);
  }, [dariParam, sampaiParam, kategoriParam]);

  useEffect(() => {
    document.title = "Riwayat Adopsi | AdopsiKu";
    let active = true;
    setLoading(true);
    adminApi
      .getRiwayat({ dari: dariParam, sampai: sampaiParam, kategori: kategoriParam })
      .then((res) => {
        if (!active) return;
        setRows(res.rows);
        setKategori(res.kategori);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dariParam, sampaiParam, kategoriParam]);

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (dari) next.set("dari", dari);
    if (sampai) next.set("sampai", sampai);
    if (kategoriVal) next.set("kategori", kategoriVal);
    setSp(next);
  }

  const qs = sp.toString();

  return (
    <>
      <h1>Laporan Riwayat Adopsi</h1>
      <p className="sub">Data hewan yang teradopsi beserta profil lengkap pengadopsinya.</p>
      <form onSubmit={handleFilter} className="filters">
        <div className="f">
          <label htmlFor="dari">Dari tanggal adopsi</label>
          <input id="dari" name="dari" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
        </div>
        <div className="f">
          <label htmlFor="sampai">Sampai tanggal adopsi</label>
          <input id="sampai" name="sampai" type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </div>
        <div className="f">
          <label htmlFor="kategori">Kategori</label>
          <select id="kategori" name="kategori" value={kategoriVal} onChange={(e) => setKategoriVal(e.target.value)}>
            <option value="">Semua</option>
            {kategori.map((k) => <option key={k.id} value={k.id}>{k.namaKategori}</option>)}
          </select>
        </div>
        <button className="btn sm" style={{ minHeight: 46 }}>Terapkan</button>
      </form>
      <div className="toolbar noprint">
        <a className="btn sm out" href={`/api/riwayat/ekspor?${qs}`}><Ikon nama="download" />Ekspor Excel (CSV)</a>
        <TombolCetak />
        <span className="note" style={{ margin: "0 0 0 auto" }}>{rows.length} data</span>
      </div>
      {loading ? (
        <Skeleton tinggi={200} />
      ) : (
        <div className="tw">
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr><th>Tgl. Adopsi</th><th>Tgl. Pengajuan</th><th>Hewan</th><th>Kategori</th><th>Pengadopsi</th><th>Email</th><th>Telepon</th><th>Alamat</th><th>Skor</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={9}>Tidak ada data pada filter ini.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{tanggal(r.tanggalKeputusan)}</td>
                  <td>{tanggal(r.tanggalPengajuan)}</td>
                  <td><b>{r.hewan.namaHewan}</b></td>
                  <td>{r.hewan.kategori.namaKategori}</td>
                  <td>{r.pengguna.namaLengkap}</td>
                  <td>{r.pengguna.email}</td>
                  <td>{r.pengguna.noTelp ?? "-"}</td>
                  <td>{r.pengguna.alamat ?? "-"}</td>
                  <td><b>{r.totalSkor}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

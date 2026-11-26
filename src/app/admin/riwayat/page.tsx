import { prisma } from "@/lib/prisma";
import { Ikon } from "@/components/ui/Ikon";
import { TombolCetak } from "@/components/ui/TombolCetak";
import { tanggal } from "@/lib/format";
import { ambilRiwayat } from "@/features/riwayat/queries";

export const metadata = { title: "Riwayat Adopsi" };

// FR-17: laporan riwayat adopsi lengkap, bisa dicetak dan diekspor
export default async function Riwayat({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const kategoriId = Number(sp.kategori) || undefined;
  const [rows, kategori] = await Promise.all([ambilRiwayat({ dari: sp.dari, sampai: sp.sampai, kategoriId }), prisma.kategoriHewan.findMany({ orderBy: { namaKategori: "asc" } })]);
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();
  return (
    <>
      <h1>Laporan Riwayat Adopsi</h1>
      <p className="sub">Data hewan yang teradopsi beserta profil lengkap pengadopsinya.</p>
      <form className="filters">
        <div className="f"><label htmlFor="dari">Dari tanggal adopsi</label><input id="dari" name="dari" type="date" defaultValue={sp.dari} /></div>
        <div className="f"><label htmlFor="sampai">Sampai tanggal adopsi</label><input id="sampai" name="sampai" type="date" defaultValue={sp.sampai} /></div>
        <div className="f"><label htmlFor="kategori">Kategori</label>
          <select id="kategori" name="kategori" defaultValue={sp.kategori ?? ""}><option value="">Semua</option>{kategori.map((k) => <option key={k.id} value={k.id}>{k.namaKategori}</option>)}</select></div>
        <button className="btn sm" style={{ minHeight: 46 }}>Terapkan</button>
      </form>
      <div className="toolbar noprint">
        <a className="btn sm out" href={`/api/riwayat/ekspor?${qs}`}><Ikon nama="download" />Ekspor Excel (CSV)</a>
        <TombolCetak />
        <span className="note" style={{ margin: "0 0 0 auto" }}>{rows.length} data</span>
      </div>
      <div className="tw"><table style={{ minWidth: 900 }}>
        <thead><tr><th>Tgl. Adopsi</th><th>Tgl. Pengajuan</th><th>Hewan</th><th>Kategori</th><th>Pengadopsi</th><th>Email</th><th>Telepon</th><th>Alamat</th><th>Skor</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={9}>Tidak ada data pada filter ini.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}><td>{tanggal(r.tanggalKeputusan as Date)}</td><td>{tanggal(r.tanggalPengajuan)}</td><td><b>{r.hewan.namaHewan}</b></td><td>{r.hewan.kategori.namaKategori}</td>
              <td>{r.pengguna.namaLengkap}</td><td>{r.pengguna.email}</td><td>{r.pengguna.noTelp ?? "-"}</td><td>{r.pengguna.alamat ?? "-"}</td><td><b>{r.totalSkor}</b></td></tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}

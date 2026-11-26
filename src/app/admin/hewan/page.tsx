import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Foto } from "@/components/ui/Foto";
import { Notice } from "@/components/ui/Notice";
import { labelJK } from "@/lib/format";
import { hapusHewan, simpanHewan } from "@/features/hewan/actions";

export const metadata = { title: "Data Hewan" };

export default async function DataHewan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [hewan, kategori] = await Promise.all([
    prisma.hewan.findMany({ include: { kategori: true }, orderBy: { id: "asc" } }),
    prisma.kategoriHewan.findMany({ orderBy: { namaKategori: "asc" } }),
  ]);
  const e = hewan.find((h) => h.id === Number(sp.ubah));
  return (
    <>
      <h1>Data Hewan</h1>
      <p className="sub">Tambah, ubah, atau hapus data hewan. Kategori dikelola di menu Kategori.</p>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="split">
        <div className="tw"><table>
          <thead><tr><th>Foto</th><th>Nama</th><th>Kategori</th><th>JK</th><th>Umur</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{hewan.map((h) => (
            <tr key={h.id}>
              <td style={{ width: 76 }}><div style={{ width: 56, height: 44, overflow: "hidden", borderRadius: 2 }}><Foto url={h.fotoHewan} kategori={h.kategori.namaKategori} nama={h.namaHewan} tinggi={44} /></div></td>
              <td><b>{h.namaHewan}</b></td><td>{h.kategori.namaKategori}</td><td>{labelJK(h.jenisKelamin)}</td><td>{h.umurBulan} bln</td>
              <td><Badge teks={h.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} /></td>
              <td><div className="inl"><Link className="btn sm out" href={`/admin/hewan?ubah=${h.id}`}>Ubah</Link>
                <form action={hapusHewan}><input type="hidden" name="id" value={h.id} /><button className="btn sm red">Hapus</button></form></div></td>
            </tr>
          ))}</tbody>
        </table></div>
        <form action={simpanHewan} className="card sticky" key={e?.id ?? "baru"}>
          <h3>{e ? `Ubah ${e.namaHewan}` : "Tambah hewan"}</h3>
          <input type="hidden" name="id" value={e?.id ?? ""} />
          <label htmlFor="nama">Nama hewan</label><input id="nama" name="nama" defaultValue={e?.namaHewan} required />
          <div className="frow">
            <div><label htmlFor="kategoriId">Kategori</label>
              <select id="kategoriId" name="kategoriId" defaultValue={e?.kategoriId}>{kategori.map((k) => <option key={k.id} value={k.id}>{k.namaKategori}</option>)}</select></div>
            <div><label htmlFor="jk">Jenis kelamin</label>
              <select id="jk" name="jk" defaultValue={e?.jenisKelamin}><option value="JANTAN">Jantan</option><option value="BETINA">Betina</option></select></div>
          </div>
          <div className="frow">
            <div><label htmlFor="umur">Umur (bulan)</label><input id="umur" name="umur" type="number" min={1} defaultValue={e?.umurBulan} required /></div>
            <div><label htmlFor="status">Status adopsi</label>
              <select id="status" name="status" defaultValue={e?.statusAdopsi}><option value="TERSEDIA">Tersedia</option><option value="TERADOPSI">Teradopsi</option></select></div>
          </div>
          <label htmlFor="deskripsi">Deskripsi (opsional)</label><input id="deskripsi" name="deskripsi" defaultValue={e?.deskripsi ?? ""} />
          <label htmlFor="foto">Foto (JPG/PNG/WebP, maks 2 MB)</label><input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" />
          <button className="btn">Simpan</button>
          {e && <Link className="btn out" href="/admin/hewan">Batal</Link>}
        </form>
      </div>
    </>
  );
}

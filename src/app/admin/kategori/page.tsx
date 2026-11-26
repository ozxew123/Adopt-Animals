import { prisma } from "@/lib/prisma";
import { Notice } from "@/components/ui/Notice";
import { hapusKategori, tambahKategori, ubahKategori } from "@/features/kategori/actions";

export const metadata = { title: "Kategori Hewan" };

export default async function Kategori({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const daftar = await prisma.kategoriHewan.findMany({ include: { _count: { select: { hewan: true } } }, orderBy: { namaKategori: "asc" } });
  return (
    <>
      <h1>Kategori Hewan</h1>
      <p className="sub">Kategori yang masih dipakai data hewan tidak bisa dihapus.</p>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="split">
        <div className="tw"><table>
          <thead><tr><th>Kategori</th><th>Jumlah hewan</th><th>Aksi</th></tr></thead>
          <tbody>{daftar.map((k) => (
            <tr key={k.id}>
              <td><form action={ubahKategori} className="inl"><input type="hidden" name="id" value={k.id} /><input name="nama" defaultValue={k.namaKategori} aria-label="Nama kategori" /><button className="btn sm out">Simpan</button></form></td>
              <td>{k._count.hewan}</td>
              <td><form action={hapusKategori}><input type="hidden" name="id" value={k.id} /><button className="btn sm red">Hapus</button></form></td>
            </tr>
          ))}</tbody>
        </table></div>
        <form action={tambahKategori} className="card">
          <h3>Kategori baru</h3>
          <label htmlFor="nama">Nama kategori</label><input id="nama" name="nama" required />
          <button className="btn">Tambah kategori</button>
        </form>
      </div>
    </>
  );
}

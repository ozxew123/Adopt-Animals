import { prisma } from "@/lib/prisma";
import { Notice } from "@/components/ui/Notice";
import { ambilBatas } from "@/features/pengajuan/queries";
import { hapusKriteria, hapusOpsi, simpanBatas, tambahKriteria, tambahOpsi, ubahKriteria, ubahOpsi } from "@/features/penilaian/actions";

export const metadata = { title: "Kriteria Scoring" };

// FR-16: CRUD kriteria, opsi jawaban, dan bobot nilai_poin
export default async function Scoring({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [kriteria, batas] = await Promise.all([
    prisma.kriteriaScoring.findMany({ include: { opsi: { orderBy: { id: "asc" } } }, orderBy: { urutan: "asc" } }),
    ambilBatas(),
  ]);
  const maks = kriteria.reduce((t, k) => t + Math.max(0, ...k.opsi.map((o) => o.nilaiPoin)), 0);
  return (
    <>
      <h1>Kriteria Scoring</h1>
      <p className="sub">Kuesioner di sisi pengadopsi dibentuk dari data ini, bukan ditulis permanen di kode. Skor maksimal: {maks}.</p>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="split">
        <div className="stack">
          {kriteria.map((k) => (
            <div className="card" key={k.id}>
              <form action={ubahKriteria} className="inl" style={{ marginBottom: 12 }}>
                <input type="hidden" name="id" value={k.id} />
                <input name="nama" defaultValue={k.namaKriteria} aria-label="Nama kriteria" style={{ fontWeight: 800 }} />
                <button className="btn sm out">Simpan</button>
              </form>
              {k.opsi.map((o) => (
                <div className="inl" style={{ marginBottom: 8 }} key={o.id}>
                  <form action={ubahOpsi} className="inl grow">
                    <input type="hidden" name="id" value={o.id} />
                    <input name="label" defaultValue={o.keteranganJawaban} aria-label="Jawaban" />
                    <input className="poin" name="poin" type="number" min={0} max={100} defaultValue={o.nilaiPoin} aria-label="Poin" />
                    <button className="btn sm out">Simpan</button>
                  </form>
                  <form action={hapusOpsi}><input type="hidden" name="id" value={o.id} /><button className="btn sm red">Hapus</button></form>
                </div>
              ))}
              <form action={tambahOpsi} className="inl" style={{ marginTop: 12 }}>
                <input type="hidden" name="kriteriaId" value={k.id} />
                <input name="label" placeholder="Jawaban baru" aria-label="Jawaban baru" required />
                <input className="poin" name="poin" type="number" min={0} max={100} placeholder="Poin" aria-label="Poin" required />
                <button className="btn sm">Tambah</button>
              </form>
              <form action={hapusKriteria} className="danger"><input type="hidden" name="id" value={k.id} /><button className="btn sm red">Hapus kriteria</button></form>
            </div>
          ))}
          <form action={tambahKriteria} className="card inl">
            <input name="nama" placeholder="Nama kriteria baru" aria-label="Nama kriteria baru" required />
            <button className="btn sm">Tambah kriteria</button>
          </form>
        </div>
        <form action={simpanBatas} className="card sticky">
          <h3>Ambang batas kategori</h3>
          <label htmlFor="lolos">Lolos Syarat jika skor lebih dari</label><input id="lolos" name="lolos" type="number" defaultValue={batas.batasLolos} required />
          <label htmlFor="tolak">Tidak Memenuhi Syarat jika skor kurang dari</label><input id="tolak" name="tolak" type="number" defaultValue={batas.batasTolak} required />
          <p className="note">Skor di antara kedua batas (termasuk tepat di batas) berstatus Dipertimbangkan dan diputuskan admin. Mengubah poin hanya memengaruhi pengajuan baru. Mengubah ambang memperbarui status pengajuan yang belum diputuskan.</p>
          <button className="btn">Simpan</button>
        </form>
      </div>
    </>
  );
}

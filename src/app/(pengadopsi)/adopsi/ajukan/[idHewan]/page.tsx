import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Ikon } from "@/components/ui/Ikon";
import { Notice } from "@/components/ui/Notice";
import { kirimPengajuan } from "@/features/pengajuan/actions";

// FR-05, FR-06: kuesioner dibentuk dari tabel kriteria_scoring dan opsi_kriteria
export default async function Ajukan({ params, searchParams }: { params: Promise<{ idHewan: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { idHewan } = await params;
  const sp = await searchParams;
  const hewan = await prisma.hewan.findUnique({ where: { id: Number(idHewan) || 0 } });
  if (!hewan || hewan.statusAdopsi !== "TERSEDIA") return (<div className="card empty"><h1>Hewan tidak tersedia</h1><Link className="btn sm out" href="/">Kembali ke katalog</Link></div>);
  const kriteria = await prisma.kriteriaScoring.findMany({ include: { opsi: { orderBy: { id: "asc" } } }, orderBy: { urutan: "asc" } });

  return (
    <>
      <Link className="back" href={`/hewan/${hewan.id}`}><Ikon nama="arrow-left" />Kembali ke detail hewan</Link>
      <h1>Ajukan adopsi: {hewan.namaHewan}</h1>
      <p className="sub">Pilih satu jawaban untuk setiap kriteria. Skor dihitung otomatis setelah dikirim.</p>
      <Notice err={sp.err} />
      <div className="split">
        <form action={kirimPengajuan}>
          <input type="hidden" name="hewanId" value={hewan.id} />
          <nav className="dots" aria-label="Lompat ke pertanyaan">
            {kriteria.map((k, i) => <a key={k.id} href={`#kriteria-${k.id}`} aria-label={`Pertanyaan ${i + 1}`}>{i + 1}</a>)}
          </nav>
          {kriteria.map((k, i) => (
            <fieldset key={k.id} id={`kriteria-${k.id}`} className="card q">
              <legend>
                <span className="qno">Pertanyaan {i + 1} dari {kriteria.length}</span>
                <span className="qt">{k.namaKriteria}</span>
              </legend>
              <div className="opts">
                {k.opsi.map((o) => (
                  <label key={o.id} className="opt">
                    <input type="radio" name={`k_${k.id}`} value={o.id} required />
                    <span className="ob">{o.keteranganJawaban}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="stickyact"><button className="btn lg cta">Kirim Pengajuan</button></div>
        </form>
        <aside className="card sticky">
          <h3>Setelah dikirim</h3>
          <p className="note">Pengajuan tersimpan dengan nomor unik, skor dihitung otomatis, lalu statusnya tampil di halaman Dashboard.</p>
          <ol className="steps"><li><b>Menunggu Review</b> atau <b>Lolos Kualifikasi</b> atau <b>Ditolak</b> (otomatis dari skor)</li><li>Keputusan akhir admin: <b>Disetujui</b> atau <b>Ditolak</b></li></ol>
        </aside>
      </div>
    </>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiError, pengajuanApi } from "@/client/services";
import type { HewanSingkat, KriteriaItem } from "@/client/services/PengajuanApiService";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";
import { Skeleton } from "@/client/components/ui/Skeleton";

export function AjukanPage() {
  const { idHewan } = useParams<{ idHewan: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const [hewan, setHewan] = useState<HewanSingkat | null>(null);
  const [kriteria, setKriteria] = useState<KriteriaItem[]>([]);
  const [jawaban, setJawaban] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(sp.get("err"));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Ajukan Adopsi | AdopsiKu";
    let active = true;
    setLoading(true);
    pengajuanApi
      .getKuesioner(idHewan ?? 0)
      .then((res) => {
        if (!active) return;
        setHewan(res.hewan);
        setKriteria(res.kriteria);
        document.title = `Ajukan adopsi: ${res.hewan.namaHewan} | AdopsiKu`;
      })
      .catch(() => {
        if (active) setHewan(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [idHewan]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hewan) return;
    setErr(null);
    setSubmitting(true);
    try {
      const res = await pengajuanApi.submit(hewan.id, jawaban);
      navigate(`/dashboard?ok=${encodeURIComponent(res.ok)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.data?.backToForm) {
          setErr(error.message);
        } else {
          navigate(`/dashboard?err=${encodeURIComponent(error.message)}`);
        }
      } else {
        setErr("Gagal mengirim pengajuan.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Skeleton tinggi={280} />;

  if (!hewan || hewan.statusAdopsi !== "TERSEDIA") {
    return (
      <div className="card empty">
        <h1>Hewan tidak tersedia</h1>
        <Link className="btn sm out" to="/">Kembali ke katalog</Link>
      </div>
    );
  }

  return (
    <>
      <Link className="back" to={`/hewan/${hewan.id}`}><Ikon nama="arrow-left" />Kembali ke detail hewan</Link>
      <h1>Ajukan adopsi: {hewan.namaHewan}</h1>
      <p className="sub">Pilih satu jawaban untuk setiap kriteria. Skor dihitung otomatis setelah dikirim.</p>
      <Notice err={err} />
      <div className="split">
        <form onSubmit={handleSubmit}>
          <nav className="dots" aria-label="Lompat ke pertanyaan">
            {kriteria.map((k, i) => (
              <a key={k.id} href={`#kriteria-${k.id}`} aria-label={`Pertanyaan ${i + 1}`}>{i + 1}</a>
            ))}
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
                    <input
                      type="radio"
                      name={`k_${k.id}`}
                      value={o.id}
                      checked={jawaban[k.id] === o.id}
                      onChange={() => setJawaban((prev) => ({ ...prev, [k.id]: o.id }))}
                      required
                    />
                    <span className="ob">{o.keteranganJawaban}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="stickyact">
            <button className="btn lg cta" disabled={submitting}>
              {submitting ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
        <aside className="card sticky">
          <h3>Setelah dikirim</h3>
          <p className="note">Pengajuan tersimpan dengan nomor unik, skor dihitung otomatis, lalu statusnya tampil di halaman Dashboard.</p>
          <ol className="steps">
            <li><b>Menunggu Review</b> atau <b>Lolos Kualifikasi</b> atau <b>Ditolak</b> (otomatis dari skor)</li>
            <li>Keputusan akhir admin: <b>Disetujui</b> atau <b>Ditolak</b></li>
          </ol>
        </aside>
      </div>
    </>
  );
}

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApi, ApiError } from "@/client/services";
import type { ScoringResponse } from "@/client/services/AdminApiService";
import { Notice } from "@/client/components/ui/Notice";
import { Skeleton } from "@/client/components/ui/Skeleton";

export function AdminScoringPage() {
  const [data, setData] = useState<ScoringResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [namaKriteriaBaru, setNamaKriteriaBaru] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await adminApi.getScoring();
    setData(res);
  }, []);

  useEffect(() => {
    document.title = "Kriteria Scoring | AdopsiKu";
    load().finally(() => setLoading(false));
  }, [load]);

  async function runAction(fn: () => Promise<{ ok: string }>) {
    setOk(null);
    setErr(null);
    setBusy(true);
    try {
      const res = await fn();
      setOk(res.ok);
      await load();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTambahKriteria(e: FormEvent) {
    e.preventDefault();
    await runAction(async () => {
      const res = await adminApi.createKriteria(namaKriteriaBaru);
      setNamaKriteriaBaru("");
      return res;
    });
  }

  async function handleUbahKriteria(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const nama = String(new FormData(e.currentTarget).get("nama") ?? "");
    await runAction(() => adminApi.updateKriteria(id, nama));
  }

  async function handleTambahOpsi(e: FormEvent<HTMLFormElement>, kriteriaId: number) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const label = String(fd.get("label") ?? "");
    const poin = Number(fd.get("poin"));
    await runAction(async () => {
      const res = await adminApi.createOpsi(kriteriaId, label, poin);
      form.reset();
      return res;
    });
  }

  async function handleUbahOpsi(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "");
    const poin = Number(fd.get("poin"));
    await runAction(() => adminApi.updateOpsi(id, label, poin));
  }

  if (loading || !data) return <Skeleton tinggi={320} />;

  return (
    <>
      <h1>Kriteria Scoring</h1>
      <p className="sub">Kuesioner di sisi pengadopsi dibentuk dari data ini, bukan ditulis permanen di kode. Skor maksimal: {data.maks}.</p>
      <Notice ok={ok} err={err} />
      <div className="split">
        <div className="stack">
          {data.kriteria.map((k) => (
            <div className="card" key={k.id}>
              <form onSubmit={(e) => handleUbahKriteria(e, k.id)} className="inl" style={{ marginBottom: 12 }} key={`k-${k.id}-${k.namaKriteria}`}>
                <input name="nama" defaultValue={k.namaKriteria} aria-label="Nama kriteria" style={{ fontWeight: 800 }} />
                <button className="btn sm out" disabled={busy}>Simpan</button>
              </form>
              {k.opsi.map((o) => (
                <div className="inl" style={{ marginBottom: 8 }} key={o.id}>
                  <form onSubmit={(e) => handleUbahOpsi(e, o.id)} className="inl grow" key={`o-${o.id}-${o.keteranganJawaban}-${o.nilaiPoin}`}>
                    <input name="label" defaultValue={o.keteranganJawaban} aria-label="Jawaban" />
                    <input className="poin" name="poin" type="number" min={0} max={100} defaultValue={o.nilaiPoin} aria-label="Poin" />
                    <button className="btn sm out" disabled={busy}>Simpan</button>
                  </form>
                  <button
                    type="button"
                    className="btn sm red"
                    disabled={busy}
                    onClick={() => runAction(() => adminApi.deleteOpsi(o.id))}
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <form onSubmit={(e) => handleTambahOpsi(e, k.id)} className="inl" style={{ marginTop: 12 }}>
                <input name="label" placeholder="Jawaban baru" aria-label="Jawaban baru" required />
                <input className="poin" name="poin" type="number" min={0} max={100} placeholder="Poin" aria-label="Poin" required />
                <button className="btn sm" disabled={busy}>Tambah</button>
              </form>
              <div className="danger">
                <button
                  type="button"
                  className="btn sm red"
                  disabled={busy}
                  onClick={() => runAction(() => adminApi.deleteKriteria(k.id))}
                >
                  Hapus kriteria
                </button>
              </div>
            </div>
          ))}
          <form onSubmit={handleTambahKriteria} className="card inl">
            <input name="nama" placeholder="Nama kriteria baru" aria-label="Nama kriteria baru" value={namaKriteriaBaru} onChange={(e) => setNamaKriteriaBaru(e.target.value)} required />
            <button className="btn sm" disabled={busy}>Tambah kriteria</button>
          </form>
        </div>
        <aside className="card sticky" aria-label="Ketentuan ambang batas kategori">
          <h3>Ambang batas kategori</h3>
          <dl className="kv" style={{ marginTop: 12 }}>
            <dt>Lolos Syarat</dt><dd>Skor &gt; {data.batas.batasLolos}</dd>
            <dt>Dipertimbangkan</dt><dd>Skor {data.batas.batasTolak}–{data.batas.batasLolos}</dd>
            <dt>Tidak Memenuhi</dt><dd>Skor &lt; {data.batas.batasTolak}</dd>
          </dl>
          <p className="note" style={{ marginBottom: 0 }}>Skor di antara kedua batas berstatus Dipertimbangkan dan diputuskan oleh admin. Mengubah poin hanya memengaruhi pengajuan baru.</p>
        </aside>
      </div>
    </>
  );
}

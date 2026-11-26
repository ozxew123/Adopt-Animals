import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApi, ApiError } from "@/client/services";
import type { KategoriRow } from "@/client/services/AdminApiService";
import { Notice } from "@/client/components/ui/Notice";
import { Skeleton } from "@/client/components/ui/Skeleton";

export function AdminKategoriPage() {
  const [daftar, setDaftar] = useState<KategoriRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [namaBaru, setNamaBaru] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await adminApi.listKategori();
    setDaftar(res.kategori);
  }, []);

  useEffect(() => {
    document.title = "Kategori Hewan | AdopsiKu";
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

  async function handleTambah(e: FormEvent) {
    e.preventDefault();
    await runAction(async () => {
      const res = await adminApi.createKategori(namaBaru);
      setNamaBaru("");
      return res;
    });
  }

  async function handleUbah(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const nama = String(new FormData(e.currentTarget).get("nama") ?? "");
    await runAction(() => adminApi.updateKategori(id, nama));
  }

  return (
    <>
      <h1>Kategori Hewan</h1>
      <p className="sub">Kategori yang masih dipakai data hewan tidak bisa dihapus.</p>
      <Notice ok={ok} err={err} />
      <div className="split">
        {loading ? (
          <Skeleton tinggi={180} />
        ) : (
          <div className="tw">
            <table>
              <thead><tr><th>Kategori</th><th>Jumlah hewan</th><th>Aksi</th></tr></thead>
              <tbody>
                {daftar.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <form onSubmit={(e) => handleUbah(e, k.id)} className="inl" key={`${k.id}-${k.namaKategori}`}>
                        <input name="nama" defaultValue={k.namaKategori} aria-label="Nama kategori" />
                        <button className="btn sm out" disabled={busy}>Simpan</button>
                      </form>
                    </td>
                    <td>{k._count.hewan}</td>
                    <td>
                      <button
                        type="button"
                        className="btn sm red"
                        disabled={busy}
                        onClick={() => runAction(() => adminApi.deleteKategori(k.id))}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form onSubmit={handleTambah} className="card">
          <h3>Kategori baru</h3>
          <label htmlFor="nama">Nama kategori</label>
          <input id="nama" name="nama" value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} required />
          <button className="btn" disabled={busy}>Tambah kategori</button>
        </form>
      </div>
    </>
  );
}

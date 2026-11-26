import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminApi, ApiError } from "@/client/services";
import { Badge } from "@/client/components/ui/Badge";
import { Foto } from "@/client/components/ui/Foto";
import { Notice } from "@/client/components/ui/Notice";
import { Skeleton } from "@/client/components/ui/Skeleton";
import type { HewanItem, KategoriItem } from "@/client/components/ui/KatalogInteraktif";
import { labelJK } from "@/shared/format";

export function AdminHewanPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const ubahId = Number(sp.get("ubah")) || 0;

  const [hewan, setHewan] = useState<HewanItem[]>([]);
  const [kategori, setKategori] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(sp.get("ok"));
  const [err, setErr] = useState<string | null>(sp.get("err"));
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    const res = await adminApi.listHewan();
    setHewan(res.hewan);
    setKategori(res.kategori);
  }, []);

  useEffect(() => {
    document.title = "Data Hewan | AdopsiKu";
    load().finally(() => setLoading(false));
  }, [load]);

  const e = hewan.find((h) => h.id === ubahId);

  async function handleSimpan(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setOk(null);
    setErr(null);
    setBusy(true);
    const fd = new FormData(ev.currentTarget);
    const id = Number(fd.get("id")) || 0;
    try {
      const res = await adminApi.saveHewan(id, fd);
      setOk(res.ok);
      formRef.current?.reset();
      await load();
      if (id) navigate("/admin/hewan", { replace: true });
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Gagal menyimpan data hewan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleHapus(id: number) {
    setOk(null);
    setErr(null);
    setBusy(true);
    try {
      const res = await adminApi.deleteHewan(id);
      setOk(res.ok);
      await load();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Gagal menghapus hewan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Data Hewan</h1>
      <p className="sub">Tambah, ubah, atau hapus data hewan. Kategori dikelola di menu Kategori.</p>
      <Notice ok={ok} err={err} />
      <div className="split">
        {loading ? (
          <Skeleton tinggi={240} />
        ) : (
          <div className="tw">
            <table>
              <thead>
                <tr><th>Foto</th><th>Nama</th><th>Kategori</th><th>JK</th><th>Umur</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {hewan.map((h) => (
                  <tr key={h.id}>
                    <td style={{ width: 76 }}>
                      <div style={{ width: 56, height: 44, overflow: "hidden", borderRadius: 2 }}>
                        <Foto url={h.fotoHewan} kategori={h.kategori.namaKategori} nama={h.namaHewan} tinggi={44} />
                      </div>
                    </td>
                    <td><b>{h.namaHewan}</b></td>
                    <td>{h.kategori.namaKategori}</td>
                    <td>{labelJK(h.jenisKelamin)}</td>
                    <td>{h.umurBulan} bln</td>
                    <td><Badge teks={h.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} /></td>
                    <td>
                      <div className="inl">
                        <Link className="btn sm out" to={`/admin/hewan?ubah=${h.id}`}>Ubah</Link>
                        <button type="button" className="btn sm red" disabled={busy} onClick={() => handleHapus(h.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form ref={formRef} onSubmit={handleSimpan} className="card sticky" key={e?.id ?? "baru"}>
          <h3>{e ? `Ubah ${e.namaHewan}` : "Tambah hewan"}</h3>
          <input type="hidden" name="id" value={e?.id ?? ""} />
          <label htmlFor="nama">Nama hewan</label>
          <input id="nama" name="nama" defaultValue={e?.namaHewan ?? ""} required />
          <div className="frow">
            <div>
              <label htmlFor="kategoriId">Kategori</label>
              <select id="kategoriId" name="kategoriId" defaultValue={e?.kategoriId ?? kategori[0]?.id ?? ""}>
                {kategori.map((k) => <option key={k.id} value={k.id}>{k.namaKategori}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="jk">Jenis kelamin</label>
              <select id="jk" name="jk" defaultValue={e?.jenisKelamin ?? "JANTAN"}>
                <option value="JANTAN">Jantan</option>
                <option value="BETINA">Betina</option>
              </select>
            </div>
          </div>
          <div className="frow">
            <div>
              <label htmlFor="umur">Umur (bulan)</label>
              <input id="umur" name="umur" type="number" min={1} defaultValue={e?.umurBulan ?? ""} required />
            </div>
            <div>
              <label htmlFor="status">Status adopsi</label>
              <select id="status" name="status" defaultValue={e?.statusAdopsi ?? "TERSEDIA"}>
                <option value="TERSEDIA">Tersedia</option>
                <option value="TERADOPSI">Teradopsi</option>
              </select>
            </div>
          </div>
          <label htmlFor="deskripsi">Deskripsi (opsional)</label>
          <input id="deskripsi" name="deskripsi" defaultValue={e?.deskripsi ?? ""} />
          <label htmlFor="foto">Foto (JPG/PNG/WebP, maks 2 MB)</label>
          <input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" />
          <button className="btn" disabled={busy}>Simpan</button>
          {e && <Link className="btn out" to="/admin/hewan">Batal</Link>}
        </form>
      </div>
    </>
  );
}

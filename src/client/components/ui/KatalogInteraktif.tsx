import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./Badge";
import { Foto } from "./Foto";
import { Ikon } from "./Ikon";
import { labelJK } from "@/shared/format";

export interface HewanItem {
  id: number;
  namaHewan: string;
  kategoriId: number;
  jenisKelamin: "JANTAN" | "BETINA";
  umurBulan: number;
  deskripsi: string | null;
  fotoHewan: string | null;
  statusAdopsi: "TERSEDIA" | "TERADOPSI";
  kategori: {
    id: number;
    namaKategori: string;
  };
}

export interface KategoriItem {
  id: number;
  namaKategori: string;
}

interface KatalogInteraktifProps {
  kategori: KategoriItem[];
  initialHewan: HewanItem[];
  total: number;
  totalHal: number;
  hal: number;
  q: string;
  jenis: number;
  urut: "baru" | "umur";
  tersedia: boolean;
  aktifIds: number[];
  sesi: boolean;
  loading?: boolean;
}

export function KatalogInteraktif({
  kategori,
  initialHewan,
  totalHal,
  hal,
  q,
  jenis,
  urut,
  tersedia,
  aktifIds,
  sesi,
  loading = false,
}: KatalogInteraktifProps) {
  const navigate = useNavigate();

  const [localTersedia, setLocalTersedia] = useState<boolean>(tersedia);
  const [localJenis, setLocalJenis] = useState<number>(jenis);
  const [localUrut, setLocalUrut] = useState<"baru" | "umur">(urut);

  useEffect(() => {
    setLocalTersedia(tersedia);
  }, [tersedia]);

  useEffect(() => {
    setLocalJenis(jenis);
  }, [jenis]);

  useEffect(() => {
    setLocalUrut(urut);
  }, [urut]);

  const aktifSet = useMemo(() => new Set(aktifIds), [aktifIds]);

  const navigateWithFilters = (newTersedia: boolean, newJenis: number, newUrut: "baru" | "umur") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (newJenis) params.set("jenis", String(newJenis));
    if (newUrut !== "baru") params.set("urut", newUrut);
    if (newTersedia) params.set("tersedia", "1");

    const p = params.toString();
    navigate(p ? `/?${p}#katalog` : "/#katalog", { replace: true });
  };

  const handleTersediaChange = (checked: boolean) => {
    setLocalTersedia(checked);
    navigateWithFilters(checked, localJenis, localUrut);
  };

  const handleJenisChange = (newJenis: number) => {
    setLocalJenis(newJenis);
    navigateWithFilters(localTersedia, newJenis, localUrut);
  };

  const handleUrutChange = (newUrut: "baru" | "umur") => {
    setLocalUrut(newUrut);
    navigateWithFilters(localTersedia, localJenis, newUrut);
  };

  const filteredHewan = useMemo(() => {
    let list = [...initialHewan];
    if (localTersedia) {
      list = list.filter((h) => h.statusAdopsi === "TERSEDIA");
    }
    if (localJenis) {
      list = list.filter((h) => h.kategoriId === localJenis);
    }
    if (localUrut === "umur") {
      list.sort((a, b) => a.umurBulan - b.umurBulan);
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [initialHewan, localTersedia, localJenis, localUrut]);

  const link = (h: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (localJenis) p.set("jenis", String(localJenis));
    if (localUrut !== "baru") p.set("urut", localUrut);
    if (localTersedia) p.set("tersedia", "1");
    p.set("hal", String(h));
    return `/?${p}#katalog`;
  };

  const nomor: (number | null)[] = [];
  for (let n = 1; n <= totalHal; n++) {
    if (n === 1 || n === totalHal || Math.abs(n - hal) <= 1) nomor.push(n);
    else if (nomor[nomor.length - 1] !== null) nomor.push(null);
  }

  return (
    <div className="cat">
      <aside className="filter sticky">
        <fieldset className="fs">
          <legend>Kategori</legend>
          <div className="chips">
            <label className="chip">
              <input
                type="radio"
                name="jenis"
                value=""
                checked={!localJenis}
                onChange={() => handleJenisChange(0)}
              />
              <span>Semua</span>
            </label>
            {kategori.map((k) => (
              <label key={k.id} className="chip">
                <input
                  type="radio"
                  name="jenis"
                  value={k.id}
                  checked={localJenis === k.id}
                  onChange={() => handleJenisChange(k.id)}
                />
                <span>{k.namaKategori}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="fs" style={{ marginTop: 20 }}>
          <legend>Urutkan</legend>
          <select
            id="urut"
            name="urut"
            aria-label="Urutkan hewan"
            value={localUrut}
            onChange={(e) => handleUrutChange(e.target.value as "baru" | "umur")}
          >
            <option value="baru">Hewan terbaru</option>
            <option value="umur">Umur termuda</option>
          </select>
        </fieldset>

        <div className="chips" style={{ marginTop: 14 }}>
          <label className="chip">
            <input
              type="checkbox"
              name="tersedia"
              value="1"
              checked={localTersedia}
              onChange={(e) => handleTersediaChange(e.target.checked)}
            />
            <span>Hanya yang Tersedia</span>
          </label>
        </div>
      </aside>

      <div>
        <p className="note" style={{ marginTop: 0 }}>
          <span className="num">{filteredHewan.length}</span> hewan ditampilkan{q ? ` untuk “${q}”` : ""}. Halaman <b className="num">{hal}</b> dari <b className="num">{totalHal}</b>.
        </p>

        {filteredHewan.length === 0 && !loading ? (
          <div className="card empty">
            <div className="empty-ic">
              <Ikon nama="paw" className="ic lg" />
            </div>
            <h3>Belum ada hewan yang cocok</h3>
            <p className="note">Tidak ada hewan yang cocok. Ubah filter atau kata pencarian.</p>
            <button
              type="button"
              className="btn sm out"
              onClick={() => {
                setLocalTersedia(false);
                setLocalJenis(0);
                setLocalUrut("baru");
                navigateWithFilters(false, 0, "baru");
              }}
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid" style={{ opacity: loading ? 0.72 : 1, transition: "opacity 120ms ease" }}>
            {filteredHewan.map((h) => (
              <article className="pet" key={h.id}>
                <Link to={`/hewan/${h.id}`} className="pet-ph" tabIndex={-1} aria-hidden="true">
                  <Foto url={h.fotoHewan} kategori={h.kategori.namaKategori} nama={h.namaHewan} />
                </Link>
                <div className="in">
                  <div className="pet-top">
                    <h3 className="pet-name">
                      <Link to={`/hewan/${h.id}`}>{h.namaHewan}</Link>
                    </h3>
                    <Badge teks={h.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} />
                  </div>
                  <ul className="meta">
                    <li>{h.kategori.namaKategori}</li>
                    <li>{labelJK(h.jenisKelamin)}</li>
                    <li className="num">{h.umurBulan} bln</li>
                  </ul>
                  {h.statusAdopsi === "TERADOPSI" ? (
                    <span className="btn dis">Sudah Teradopsi</span>
                  ) : aktifSet.has(h.id) ? (
                    <span className="btn dis">Sudah Diajukan</span>
                  ) : (
                    <Link className="btn" to={sesi ? `/adopsi/ajukan/${h.id}` : "/login"}>
                      Ajukan Adopsi
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {totalHal > 1 && (
          <nav className="pg" aria-label="Paginasi katalog">
            {hal > 1 ? (
              <Link to={link(hal - 1)} rel="prev">
                Sebelumnya
              </Link>
            ) : (
              <span className="pgi off" aria-disabled="true">
                Sebelumnya
              </span>
            )}
            {nomor.map((n, i) =>
              n === null ? (
                <span key={`g${i}`} className="pgi gap" aria-hidden="true">
                  …
                </span>
              ) : n === hal ? (
                <span key={n} className="pgi" aria-current="page">
                  {n}
                </span>
              ) : (
                <Link key={n} to={link(n)} aria-label={`Halaman ${n}`}>
                  {n}
                </Link>
              )
            )}
            {hal < totalHal ? (
              <Link to={link(hal + 1)} rel="next">
                Berikutnya
              </Link>
            ) : (
              <span className="pgi off" aria-disabled="true">
                Berikutnya
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

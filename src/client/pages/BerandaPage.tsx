import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/client/lib/auth";
import { katalogApi } from "@/client/services";
import type { KatalogResponse } from "@/client/services/KatalogApiService";
import { HeroBanner } from "@/client/components/ui/HeroBanner";
import { Notice } from "@/client/components/ui/Notice";
import { KatalogInteraktif } from "@/client/components/ui/KatalogInteraktif";

export function BerandaPage() {
  const [sp] = useSearchParams();
  const { user } = useAuth();

  const q = sp.get("q")?.trim() ?? "";
  const jenis = Number(sp.get("jenis")) || 0;
  const urut = sp.get("urut") === "umur" ? "umur" : "baru";
  const tersedia = sp.get("tersedia") === "1";
  const hal = Math.max(1, Number(sp.get("hal")) || 1);
  const ok = sp.get("ok");
  const err = sp.get("err");

  const [data, setData] = useState<KatalogResponse>({
    hewan: [],
    kategori: [],
    total: 0,
    totalHal: 1,
    hal: 1,
    aktifIds: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "AdopsiKu | Adopsi hewan terlantar";
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    katalogApi
      .list({ q, jenis, urut, tersedia, hal })
      .then((res) => {
        if (active) setData(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q, jenis, urut, tersedia, hal, user?.id]);

  return (
    <>
      <HeroBanner
        judul="Temukan sahabat baru untuk rumahmu."
        lead="Pilih hewan yang siap diadopsi, isi kuesioner singkat, dan pantau status pengajuanmu secara terbuka."
      >
        <a className="btn" href="#katalog">Lihat katalog hewan</a>
        <Link className="btn out" to={user ? "/dashboard" : "/register"}>
          {user ? "Dashboard saya" : "Buat akun"}
        </Link>
      </HeroBanner>
      <Notice ok={ok} err={err} />

      <section id="katalog" className="cat-sec" aria-labelledby="judul-katalog" style={{ scrollMarginTop: 16 }}>
        <div className="sec-head">
          <h2 id="judul-katalog">Katalog Hewan Adopsi</h2>
          <p className="sub">Hanya hewan berstatus Tersedia yang dapat diajukan untuk adopsi.</p>
        </div>
        <KatalogInteraktif
          kategori={data.kategori}
          initialHewan={data.hewan}
          total={data.total}
          totalHal={data.totalHal}
          hal={data.hal}
          q={q}
          jenis={jenis}
          urut={urut}
          tersedia={tersedia}
          aktifIds={data.aktifIds}
          sesi={!!user}
          loading={loading}
        />
      </section>
    </>
  );
}

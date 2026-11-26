import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/client/lib/auth";
import { katalogApi } from "@/client/services";
import { Badge } from "@/client/components/ui/Badge";
import { Foto } from "@/client/components/ui/Foto";
import { Ikon } from "@/client/components/ui/Ikon";
import { Skeleton } from "@/client/components/ui/Skeleton";
import type { HewanItem } from "@/client/components/ui/KatalogInteraktif";
import { labelJK } from "@/shared/format";
import { NotFoundPage } from "./NotFoundPage";

export function DetailHewanPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [hewan, setHewan] = useState<HewanItem | null>(null);
  const [diajukan, setDiajukan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    katalogApi
      .detail(id ?? 0)
      .then((res) => {
        if (!active) return;
        setHewan(res.hewan);
        setDiajukan(res.diajukan);
        document.title = `${res.hewan.namaHewan} | AdopsiKu`;
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, user?.id]);

  if (loading) return <Skeleton tinggi={320} />;
  if (notFound || !hewan) return <NotFoundPage />;

  return (
    <>
      <Link className="back" to="/"><Ikon nama="arrow-left" />Kembali ke katalog</Link>
      <div className="detailhewan">
        <div className="card foto-besar"><Foto url={hewan.fotoHewan} kategori={hewan.kategori.namaKategori} nama={hewan.namaHewan} /></div>
        <div className="card">
          <div className="row">
            <h1 style={{ margin: 0 }}>{hewan.namaHewan}</h1>
            <Badge teks={hewan.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} />
          </div>
          <p className="sub">{hewan.kategori.namaKategori}, {labelJK(hewan.jenisKelamin)}, {hewan.umurBulan} bulan</p>
          <dl className="info">
            <div className="tile"><dt><Ikon nama="paw" />Jenis</dt><dd>{hewan.kategori.namaKategori}</dd></div>
            <div className="tile"><dt><Ikon nama="gender" />Kelamin</dt><dd>{labelJK(hewan.jenisKelamin)}</dd></div>
            <div className="tile"><dt><Ikon nama="cal" />Umur</dt><dd>{hewan.umurBulan} bulan</dd></div>
          </dl>
          <p>{hewan.deskripsi ?? "Belum ada deskripsi untuk hewan ini."}</p>
          {hewan.statusAdopsi === "TERADOPSI" ? <span className="btn lg dis">Sudah Teradopsi</span>
            : user?.role === "ADMIN" ? <p className="note">Masuk sebagai pengadopsi untuk mengajukan adopsi.</p>
            : diajukan ? <span className="btn lg dis">Sudah Diajukan</span>
            : <Link className="btn lg cta" to={user ? `/adopsi/ajukan/${hewan.id}` : "/login"}>Ajukan Adopsi</Link>}
        </div>
      </div>
    </>
  );
}

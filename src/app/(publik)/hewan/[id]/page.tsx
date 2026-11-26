import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Foto } from "@/components/ui/Foto";
import { Ikon } from "@/components/ui/Ikon";
import { labelJK } from "@/lib/format";
import { hewanAktifPengguna } from "@/features/pengajuan/queries";

// Detail hewan: tombol Ajukan Adopsi aktif hanya jika status Tersedia
export default async function DetailHewan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = await prisma.hewan.findUnique({ where: { id: Number(id) || 0 }, include: { kategori: true } });
  if (!h) notFound();
  const sesi = await auth();
  const diajukan = sesi?.user.role === "PENGADOPSI" && (await hewanAktifPengguna(Number(sesi.user.id))).has(h.id);

  return (
    <>
      <Link className="back" href="/"><Ikon nama="arrow-left" />Kembali ke katalog</Link>
      <div className="detailhewan">
        <div className="card foto-besar"><Foto url={h.fotoHewan} kategori={h.kategori.namaKategori} nama={h.namaHewan} /></div>
        <div className="card">
          <div className="row"><h1 style={{ margin: 0 }}>{h.namaHewan}</h1><Badge teks={h.statusAdopsi === "TERSEDIA" ? "Tersedia" : "Teradopsi"} /></div>
          <p className="sub">{h.kategori.namaKategori}, {labelJK(h.jenisKelamin)}, {h.umurBulan} bulan</p>
          <dl className="info">
            <div className="tile"><dt><Ikon nama="paw" />Jenis</dt><dd>{h.kategori.namaKategori}</dd></div>
            <div className="tile"><dt><Ikon nama="gender" />Kelamin</dt><dd>{labelJK(h.jenisKelamin)}</dd></div>
            <div className="tile"><dt><Ikon nama="cal" />Umur</dt><dd>{h.umurBulan} bulan</dd></div>
          </dl>
          <p>{h.deskripsi ?? "Belum ada deskripsi untuk hewan ini."}</p>
          {h.statusAdopsi === "TERADOPSI" ? <span className="btn lg dis">Sudah Teradopsi</span>
            : sesi?.user.role === "ADMIN" ? <p className="note">Masuk sebagai pengadopsi untuk mengajukan adopsi.</p>
            : diajukan ? <span className="btn lg dis">Sudah Diajukan</span>
            : <Link className="btn lg cta" href={sesi ? `/adopsi/ajukan/${h.id}` : "/login"}>Ajukan Adopsi</Link>}
        </div>
      </div>
    </>
  );
}

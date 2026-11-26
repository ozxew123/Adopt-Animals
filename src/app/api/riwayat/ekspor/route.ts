import { auth } from "@/auth";
import { ambilRiwayat } from "@/features/riwayat/queries";
import { tanggal } from "@/lib/format";

// FR-17: ekspor laporan (CSV, terbuka langsung di Excel)
export async function GET(req: Request) {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const q = new URL(req.url).searchParams;
  const rows = await ambilRiwayat({ dari: q.get("dari") || undefined, sampai: q.get("sampai") || undefined, kategoriId: Number(q.get("kategori")) || undefined });
  const c = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [
    "Tanggal Adopsi,Tanggal Pengajuan,Hewan,Kategori,Pengadopsi,Email,Telepon,Alamat,Total Skor",
    ...rows.map((r) => [
      tanggal(r.tanggalKeputusan as Date), tanggal(r.tanggalPengajuan), r.hewan.namaHewan, r.hewan.kategori.namaKategori,
      r.pengguna.namaLengkap, r.pengguna.email, r.pengguna.noTelp ?? "", r.pengguna.alamat ?? "", r.totalSkor,
    ].map(c).join(",")),
  ].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="riwayat-adopsi.csv"' } });
}

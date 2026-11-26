import { prisma } from "@/lib/prisma";

export interface FilterRiwayat { dari?: string; sampai?: string; kategoriId?: number }

// Filter tanggal memakai tanggal adopsi (saat admin menyetujui)
export function ambilRiwayat(f: FilterRiwayat) {
  return prisma.pengajuanAdopsi.findMany({
    where: {
      statusPengajuan: "DISETUJUI",
      tanggalKeputusan: {
        ...(f.dari ? { gte: new Date(`${f.dari}T00:00:00+07:00`) } : {}),
        ...(f.sampai ? { lte: new Date(`${f.sampai}T23:59:59.999+07:00`) } : {}),
      },
      ...(f.kategoriId ? { hewan: { kategoriId: f.kategoriId } } : {}),
    },
    include: { pengguna: true, hewan: { include: { kategori: true } } },
    orderBy: { tanggalKeputusan: "desc" },
  });
}

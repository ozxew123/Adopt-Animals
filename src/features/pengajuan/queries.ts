import { prisma } from "@/lib/prisma";
import type { Batas } from "./scoring";

export async function ambilBatas(): Promise<Batas> {
  const p = await prisma.pengaturanScoring.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return { batasLolos: p.batasLolos, batasTolak: p.batasTolak };
}

export const pengajuanSaya = (penggunaId: number) =>
  prisma.pengajuanAdopsi.findMany({ where: { penggunaId }, include: { hewan: true }, orderBy: { id: "desc" } });

// FR-12: seluruh pengajuan, default diurutkan dari total_skor tertinggi
export const semuaPengajuan = () =>
  prisma.pengajuanAdopsi.findMany({
    include: { pengguna: true, hewan: { include: { kategori: true } } },
    orderBy: [{ totalSkor: "desc" }, { id: "asc" }],
  });

export async function ringkasanAdmin() {
  const [tersedia, masuk, teradopsi] = await Promise.all([
    prisma.hewan.count({ where: { statusAdopsi: "TERSEDIA" } }),
    prisma.pengajuanAdopsi.count({ where: { tanggalKeputusan: null } }),
    prisma.hewan.count({ where: { statusAdopsi: "TERADOPSI" } }),
  ]);
  return { tersedia, masuk, teradopsi };
}

export const detailPengajuan = (id: number) =>
  prisma.pengajuanAdopsi.findUnique({
    where: { id },
    include: { pengguna: true, hewan: { include: { kategori: true } }, detail: { include: { kriteria: true, opsi: true }, orderBy: { kriteriaId: "asc" } } },
  });

// Hewan yang pengajuannya masih aktif (belum diputuskan dan bukan penolakan otomatis)
export async function hewanAktifPengguna(penggunaId: number): Promise<Set<number>> {
  const rows = await prisma.pengajuanAdopsi.findMany({
    where: { penggunaId, tanggalKeputusan: null, statusPengajuan: { not: "DITOLAK" } },
    select: { hewanId: true },
  });
  return new Set(rows.map((r) => r.hewanId));
}

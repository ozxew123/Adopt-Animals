import type { PrismaClient } from "@prisma/client";
import { ScoringEngine } from "../../shared/scoring";
import { Formatter } from "../../shared/format";
import { BadRequestError, ForbiddenError, NotFoundError } from "../core/HttpError";
import { PENGGUNA_PUBLIK_SELECT, type SessionUser } from "./AuthService";

export class PengajuanService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scoring: ScoringEngine
  ) {}

  public async getActiveAnimalIds(penggunaId: number): Promise<Set<number>> {
    const rows = await this.prisma.pengajuanAdopsi.findMany({
      where: { penggunaId, tanggalKeputusan: null, statusPengajuan: { not: "DITOLAK" } },
      select: { hewanId: true },
    });
    return new Set(rows.map((r) => r.hewanId));
  }

  public async getKuesioner(idHewan: number) {
    const [hewan, kriteria] = await Promise.all([
      this.prisma.hewan.findUnique({ where: { id: idHewan } }),
      this.prisma.kriteriaScoring.findMany({
        include: { opsi: { orderBy: { id: "asc" } } },
        orderBy: { urutan: "asc" },
      }),
    ]);

    if (!hewan || hewan.statusAdopsi !== "TERSEDIA") {
      throw new NotFoundError("Hewan tidak tersedia.");
    }
    return { hewan, kriteria };
  }

  public async submit(
    penggunaId: number,
    hewanId: number,
    jawaban: Record<string, number>
  ): Promise<{ id: number; ok: string }> {
    const kriteria = await this.prisma.kriteriaScoring.findMany({
      include: { opsi: true },
      orderBy: { urutan: "asc" },
    });

    if (kriteria.length === 0) {
      throw new BadRequestError("Kriteria penilaian belum diatur admin.");
    }

    const pilihan: { kriteriaId: number; opsiId: number; poin: number }[] = [];
    for (const k of kriteria) {
      const opsiId = Number(jawaban[String(k.id)] ?? jawaban[`k_${k.id}`]);
      const opsi = k.opsi.find((o) => o.id === opsiId);
      if (!opsi) {
        throw new BadRequestError("Pilih satu jawaban untuk setiap kriteria.", { backToForm: true });
      }
      pilihan.push({ kriteriaId: k.id, opsiId: opsi.id, poin: opsi.nilaiPoin });
    }

    return this.prisma.$transaction(async (tx) => {
      const hewan = await tx.hewan.findUnique({ where: { id: hewanId } });
      if (!hewan || hewan.statusAdopsi !== "TERSEDIA") {
        throw new BadRequestError("Hewan tidak tersedia untuk diadopsi.");
      }

      const aktif = await tx.pengajuanAdopsi.findFirst({
        where: { penggunaId, hewanId, tanggalKeputusan: null, statusPengajuan: { not: "DITOLAK" } },
      });
      if (aktif) {
        throw new BadRequestError("Pengajuan untuk hewan ini masih aktif.");
      }

      const total = this.scoring.hitungSkor(pilihan.map((p) => p.poin));
      const baru = await tx.pengajuanAdopsi.create({
        data: {
          penggunaId,
          hewanId,
          totalSkor: total,
          statusPengajuan: this.scoring.statusAwal(total),
          detail: { create: pilihan },
        },
      });

      return {
        id: baru.id,
        ok: `Pengajuan ${Formatter.kode(baru.id)} terkirim dengan skor ${total}.`,
      };
    });
  }

  public listMine(penggunaId: number) {
    return this.prisma.pengajuanAdopsi.findMany({
      where: { penggunaId },
      include: { hewan: true },
      orderBy: { id: "desc" },
    });
  }

  public findDetailById(id: number) {
    return this.prisma.pengajuanAdopsi.findUnique({
      where: { id },
      include: {
        pengguna: { select: PENGGUNA_PUBLIK_SELECT },
        hewan: { include: { kategori: true } },
        detail: { include: { kriteria: true, opsi: true }, orderBy: { kriteriaId: "asc" } },
      },
    });
  }

  public async getDetailForUser(id: number, user: SessionUser) {
    const pengajuan = await this.findDetailById(id);
    if (!pengajuan) throw new NotFoundError("Pengajuan tidak ditemukan.");
    if (user.role !== "ADMIN" && pengajuan.penggunaId !== Number(user.id)) {
      throw new ForbiddenError("Tidak diizinkan mengakses pengajuan ini.");
    }
    return { pengajuan, batas: this.scoring.batas };
  }
}

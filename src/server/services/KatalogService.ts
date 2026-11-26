import type { PrismaClient } from "@prisma/client";
import type { SessionUser } from "./AuthService";
import type { PengajuanService } from "./PengajuanService";
import { NotFoundError } from "../core/HttpError";

export interface KatalogQuery {
  q: string;
  jenis: number;
  urut: "baru" | "umur";
  tersedia: boolean;
  hal: number;
}

export class KatalogService {
  private static readonly PER_HALAMAN = 6;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly pengajuanService: PengajuanService
  ) {}

  public async list(query: KatalogQuery, user: SessionUser | null) {
    const hal = Math.max(1, query.hal || 1);
    const where = {
      ...(query.q
        ? {
            OR: [
              { namaHewan: { contains: query.q, mode: "insensitive" as const } },
              { kategori: { namaKategori: { contains: query.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
      ...(query.jenis ? { kategoriId: query.jenis } : {}),
      ...(query.tersedia ? { statusAdopsi: "TERSEDIA" as const } : {}),
    };

    const [total, hewan, kategori] = await Promise.all([
      this.prisma.hewan.count({ where }),
      this.prisma.hewan.findMany({
        where,
        include: { kategori: true },
        orderBy: query.urut === "umur" ? { umurBulan: "asc" } : { id: "desc" },
        skip: (hal - 1) * KatalogService.PER_HALAMAN,
        take: KatalogService.PER_HALAMAN,
      }),
      this.prisma.kategoriHewan.findMany({ orderBy: { namaKategori: "asc" } }),
    ]);

    const aktif =
      user?.role === "PENGADOPSI"
        ? await this.pengajuanService.getActiveAnimalIds(Number(user.id))
        : new Set<number>();

    const totalHal = Math.max(1, Math.ceil(total / KatalogService.PER_HALAMAN));

    return {
      hewan,
      kategori,
      total,
      totalHal,
      hal,
      aktifIds: Array.from(aktif),
    };
  }

  public async getDetail(id: number, user: SessionUser | null) {
    const hewan = await this.prisma.hewan.findUnique({
      where: { id },
      include: { kategori: true },
    });
    if (!hewan) throw new NotFoundError("Hewan tidak ditemukan.");

    const diajukan =
      user?.role === "PENGADOPSI" &&
      (await this.pengajuanService.getActiveAnimalIds(Number(user.id))).has(hewan.id);

    return { hewan, diajukan };
  }
}

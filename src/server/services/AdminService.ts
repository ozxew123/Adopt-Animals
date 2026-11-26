import type { PrismaClient } from "@prisma/client";
import { ScoringEngine } from "../../shared/scoring";
import { Formatter } from "../../shared/format";
import { BadRequestError, NotFoundError } from "../core/HttpError";
import { PENGGUNA_PUBLIK_SELECT } from "./AuthService";
import type { PengajuanService } from "./PengajuanService";
import type { LocalUploadStorage } from "./StorageService";

export interface FilterRiwayat {
  dari?: string;
  sampai?: string;
  kategoriId?: number;
}

export interface SaveHewanInput {
  nama: string;
  umur: number;
  kategoriId: number;
  jk: string;
  status: string;
  deskripsi: string;
  foto: unknown;
}

export class AdminService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scoring: ScoringEngine,
    private readonly storage: LocalUploadStorage,
    private readonly pengajuanService: PengajuanService
  ) {}

  private isPoinValid(poin: number): boolean {
    return Number.isInteger(poin) && poin >= 0 && poin <= 100;
  }

  public async getDashboard() {
    const [antrean, tersedia, masuk, teradopsi] = await Promise.all([
      this.prisma.pengajuanAdopsi.findMany({
        include: {
          pengguna: { select: PENGGUNA_PUBLIK_SELECT },
          hewan: { include: { kategori: true } },
        },
        orderBy: [{ totalSkor: "desc" }, { id: "asc" }],
      }),
      this.prisma.hewan.count({ where: { statusAdopsi: "TERSEDIA" } }),
      this.prisma.pengajuanAdopsi.count({ where: { tanggalKeputusan: null } }),
      this.prisma.hewan.count({ where: { statusAdopsi: "TERADOPSI" } }),
    ]);

    return {
      antrean,
      batas: this.scoring.batas,
      ringkas: { tersedia, masuk, teradopsi },
    };
  }

  public async getPengajuanDetail(id: number) {
    const pengajuan = await this.pengajuanService.findDetailById(id);
    if (!pengajuan) throw new NotFoundError("Pengajuan tidak ditemukan.");
    const jumlahPelamarHewan = await this.prisma.pengajuanAdopsi.count({
      where: { hewanId: pengajuan.hewanId },
    });
    return { pengajuan, batas: this.scoring.batas, jumlahPelamarHewan };
  }

  public async getCompareByHewan(hewanId: number) {
    const hewan = await this.prisma.hewan.findUnique({
      where: { id: hewanId },
      include: { kategori: true },
    });
    if (!hewan) throw new NotFoundError("Hewan tidak ditemukan.");

    const [pengajuan, masterKriteria] = await Promise.all([
      this.prisma.pengajuanAdopsi.findMany({
        where: { hewanId },
        include: {
          pengguna: { select: PENGGUNA_PUBLIK_SELECT },
          detail: {
            include: { kriteria: true, opsi: true },
            orderBy: { kriteriaId: "asc" },
          },
        },
        orderBy: [{ totalSkor: "desc" }, { id: "asc" }],
      }),
      this.prisma.kriteriaScoring.findMany({ orderBy: { urutan: "asc" } }),
    ]);

    const kriteriaMap = new Map<number, string>();
    for (const k of masterKriteria) {
      kriteriaMap.set(k.id, k.namaKriteria);
    }
    for (const p of pengajuan) {
      for (const d of p.detail) {
        if (!kriteriaMap.has(d.kriteriaId)) {
          kriteriaMap.set(d.kriteriaId, d.kriteria.namaKriteria);
        }
      }
    }

    const kriteria = Array.from(kriteriaMap, ([id, namaKriteria]) => ({ id, namaKriteria }));
    return { hewan, kriteria, pengajuan, batas: this.scoring.batas };
  }

  // FR-14, FR-15: Keputusan admin dengan transaksi & row lock FOR UPDATE
  public async putuskan(id: number, keputusan: unknown): Promise<{ ok: string }> {
    if (keputusan !== "DISETUJUI" && keputusan !== "DITOLAK") {
      throw new BadRequestError("Keputusan tidak terbaca. Coba lagi.");
    }
    const setuju = keputusan === "DISETUJUI";

    return this.prisma.$transaction(async (tx) => {
      const awal = await tx.pengajuanAdopsi.findUnique({ where: { id }, select: { hewanId: true } });
      if (!awal) throw new NotFoundError("Pengajuan tidak ditemukan.");

      await tx.$queryRaw`SELECT id_hewan FROM hewan WHERE id_hewan = ${awal.hewanId} FOR UPDATE`;

      const pengajuan = await tx.pengajuanAdopsi.findUnique({
        where: { id },
        include: { hewan: true },
      });
      if (!pengajuan || pengajuan.tanggalKeputusan) {
        throw new BadRequestError("Pengajuan sudah diputuskan.");
      }
      if (setuju && pengajuan.hewan.statusAdopsi !== "TERSEDIA") {
        throw new BadRequestError(`${pengajuan.hewan.namaHewan} sudah teradopsi.`);
      }

      const sekarang = new Date();
      await tx.pengajuanAdopsi.update({
        where: { id },
        data: { statusPengajuan: setuju ? "DISETUJUI" : "DITOLAK", tanggalKeputusan: sekarang },
      });

      if (setuju) {
        await tx.hewan.update({
          where: { id: pengajuan.hewanId },
          data: { statusAdopsi: "TERADOPSI" },
        });
        await tx.pengajuanAdopsi.updateMany({
          where: { hewanId: pengajuan.hewanId, tanggalKeputusan: null, id: { not: id } },
          data: { statusPengajuan: "DITOLAK", tanggalKeputusan: sekarang },
        });
      }

      return {
        ok: setuju
          ? `${Formatter.kode(id)} disetujui. Status ${pengajuan.hewan.namaHewan} menjadi Teradopsi.`
          : `${Formatter.kode(id)} ditolak.`,
      };
    });
  }

  public async listHewan() {
    const [hewan, kategori] = await Promise.all([
      this.prisma.hewan.findMany({ include: { kategori: true }, orderBy: { id: "asc" } }),
      this.prisma.kategoriHewan.findMany({ orderBy: { namaKategori: "asc" } }),
    ]);
    return { hewan, kategori };
  }

  public async saveHewan(id: number, input: SaveHewanInput): Promise<{ ok: string }> {
    const nama = input.nama.trim();
    if (!nama || !Number.isInteger(input.umur) || input.umur < 1 || !input.kategoriId) {
      throw new BadRequestError("Isi nama, kategori, dan umur (bulan) dengan benar.");
    }

    const lama = id ? await this.prisma.hewan.findUnique({ where: { id } }) : null;
    if (id && !lama) throw new NotFoundError("Hewan tidak ditemukan.");

    let fotoHewan = lama?.fotoHewan ?? null;
    if (input.foto instanceof File && input.foto.size > 0) {
      const uploadedUrl = await this.storage.save(input.foto);
      await this.storage.remove(fotoHewan);
      fotoHewan = uploadedUrl;
    }

    const data = {
      namaHewan: nama,
      kategoriId: input.kategoriId,
      umurBulan: input.umur,
      fotoHewan,
      deskripsi: input.deskripsi.trim() || null,
      jenisKelamin: input.jk === "BETINA" ? ("BETINA" as const) : ("JANTAN" as const),
      statusAdopsi: input.status === "TERADOPSI" ? ("TERADOPSI" as const) : ("TERSEDIA" as const),
    };

    if (id) await this.prisma.hewan.update({ where: { id }, data });
    else await this.prisma.hewan.create({ data });

    return { ok: id ? "Data hewan diperbarui." : "Hewan ditambahkan." };
  }

  public async deleteHewan(id: number): Promise<{ ok: string }> {
    if ((await this.prisma.pengajuanAdopsi.count({ where: { hewanId: id } })) > 0) {
      throw new BadRequestError("Hewan tidak bisa dihapus karena sudah memiliki pengajuan.");
    }
    const hewan = await this.prisma.hewan.delete({ where: { id } }).catch(() => null);
    if (!hewan) throw new NotFoundError("Hewan tidak ditemukan.");
    await this.storage.remove(hewan.fotoHewan);
    return { ok: "Data hewan dihapus." };
  }

  public async listKategori() {
    const kategori = await this.prisma.kategoriHewan.findMany({
      include: { _count: { select: { hewan: true } } },
      orderBy: { namaKategori: "asc" },
    });
    return { kategori };
  }

  public async createKategori(namaRaw: string): Promise<{ ok: string }> {
    const nama = namaRaw.trim();
    if (!nama) throw new BadRequestError("Isi nama kategori.");
    if (await this.prisma.kategoriHewan.findUnique({ where: { namaKategori: nama } })) {
      throw new BadRequestError("Kategori sudah ada.");
    }
    await this.prisma.kategoriHewan.create({ data: { namaKategori: nama } });
    return { ok: "Kategori ditambahkan." };
  }

  public async updateKategori(id: number, namaRaw: string): Promise<{ ok: string }> {
    const nama = namaRaw.trim();
    if (!nama) throw new BadRequestError("Isi nama kategori.");
    const sama = await this.prisma.kategoriHewan.findUnique({ where: { namaKategori: nama } });
    if (sama && sama.id !== id) throw new BadRequestError("Nama kategori sudah dipakai.");
    await this.prisma.kategoriHewan.update({ where: { id }, data: { namaKategori: nama } });
    return { ok: "Kategori diperbarui." };
  }

  public async deleteKategori(id: number): Promise<{ ok: string }> {
    if ((await this.prisma.hewan.count({ where: { kategoriId: id } })) > 0) {
      throw new BadRequestError("Kategori masih dipakai oleh data hewan.");
    }
    await this.prisma.kategoriHewan.delete({ where: { id } });
    return { ok: "Kategori dihapus." };
  }

  public async getScoring() {
    const kriteria = await this.prisma.kriteriaScoring.findMany({
      include: { opsi: { orderBy: { id: "asc" } } },
      orderBy: { urutan: "asc" },
    });
    const maks = kriteria.reduce((t, k) => t + Math.max(0, ...k.opsi.map((o) => o.nilaiPoin)), 0);
    return { kriteria, batas: this.scoring.batas, maks };
  }

  public async createKriteria(namaRaw: string): Promise<{ ok: string }> {
    const nama = namaRaw.trim();
    if (!nama) throw new BadRequestError("Isi nama kriteria.");
    await this.prisma.kriteriaScoring.create({
      data: { namaKriteria: nama, urutan: await this.prisma.kriteriaScoring.count() },
    });
    return { ok: "Kriteria ditambahkan. Tambahkan opsi jawabannya agar muncul di kuesioner." };
  }

  public async updateKriteria(id: number, namaRaw: string): Promise<{ ok: string }> {
    const nama = namaRaw.trim();
    if (!nama) throw new BadRequestError("Isi nama kriteria.");
    await this.prisma.kriteriaScoring.update({ where: { id }, data: { namaKriteria: nama } });
    return { ok: "Nama kriteria diperbarui." };
  }

  public async deleteKriteria(id: number): Promise<{ ok: string }> {
    if ((await this.prisma.detailPenilaian.count({ where: { kriteriaId: id } })) > 0) {
      throw new BadRequestError("Kriteria sudah dipakai pada pengajuan, jadi tidak bisa dihapus.");
    }
    await this.prisma.kriteriaScoring.delete({ where: { id } });
    return { ok: "Kriteria dihapus." };
  }

  public async createOpsi(kriteriaId: number, labelRaw: string, poin: number): Promise<{ ok: string }> {
    const label = labelRaw.trim();
    if (!label || !this.isPoinValid(poin) || !kriteriaId) {
      throw new BadRequestError("Isi jawaban dan poin (0 sampai 100).");
    }
    await this.prisma.opsiKriteria.create({
      data: { kriteriaId, keteranganJawaban: label, nilaiPoin: poin },
    });
    return { ok: "Opsi jawaban ditambahkan." };
  }

  public async updateOpsi(id: number, labelRaw: string, poin: number): Promise<{ ok: string }> {
    const label = labelRaw.trim();
    if (!label || !this.isPoinValid(poin)) {
      throw new BadRequestError("Isi jawaban dan poin (0 sampai 100).");
    }
    await this.prisma.opsiKriteria.update({
      where: { id },
      data: { keteranganJawaban: label, nilaiPoin: poin },
    });
    return { ok: "Opsi diperbarui. Skor pengajuan lama tidak berubah, hanya pengajuan baru." };
  }

  public async deleteOpsi(id: number): Promise<{ ok: string }> {
    if ((await this.prisma.detailPenilaian.count({ where: { opsiId: id } })) > 0) {
      throw new BadRequestError("Opsi sudah dipakai pada pengajuan, jadi tidak bisa dihapus.");
    }
    await this.prisma.opsiKriteria.delete({ where: { id } });
    return { ok: "Opsi dihapus." };
  }

  public queryRiwayat(filter: FilterRiwayat) {
    return this.prisma.pengajuanAdopsi.findMany({
      where: {
        statusPengajuan: "DISETUJUI",
        tanggalKeputusan: {
          ...(filter.dari ? { gte: new Date(`${filter.dari}T00:00:00+07:00`) } : {}),
          ...(filter.sampai ? { lte: new Date(`${filter.sampai}T23:59:59.999+07:00`) } : {}),
        },
        ...(filter.kategoriId ? { hewan: { kategoriId: filter.kategoriId } } : {}),
      },
      include: {
        pengguna: { select: PENGGUNA_PUBLIK_SELECT },
        hewan: { include: { kategori: true } },
      },
      orderBy: { tanggalKeputusan: "desc" },
    });
  }

  public async getRiwayat(filter: FilterRiwayat) {
    const [rows, kategori] = await Promise.all([
      this.queryRiwayat(filter),
      this.prisma.kategoriHewan.findMany({ orderBy: { namaKategori: "asc" } }),
    ]);
    return { rows, kategori };
  }

  public async exportRiwayatCsv(filter: FilterRiwayat): Promise<string> {
    const rows = await this.queryRiwayat(filter);
    const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

    return (
      "\uFEFF" +
      [
        "Tanggal Adopsi,Tanggal Pengajuan,Hewan,Kategori,Pengadopsi,Email,Telepon,Alamat,Total Skor",
        ...rows.map((r) =>
          [
            Formatter.tanggal(r.tanggalKeputusan as Date),
            Formatter.tanggal(r.tanggalPengajuan),
            r.hewan.namaHewan,
            r.hewan.kategori.namaKategori,
            r.pengguna.namaLengkap,
            r.pengguna.email,
            r.pengguna.noTelp ?? "",
            r.pengguna.alamat ?? "",
            r.totalSkor,
          ]
            .map(cell)
            .join(",")
        ),
      ].join("\r\n")
    );
  }
}

"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibPengadopsi } from "@/lib/guard";
import { kode, pesan } from "@/lib/format";
import { hitungSkor, statusAwal } from "./scoring";
import { ambilBatas } from "./queries";

// FR-05 s.d. FR-11: validasi, simpan pengajuan + detail jawaban, hitung skor, tetapkan status awal
export async function kirimPengajuan(fd: FormData) {
  const user = await wajibPengadopsi();
  const penggunaId = Number(user.id);
  const hewanId = Number(fd.get("hewanId"));
  const balik = `/adopsi/ajukan/${hewanId}`;

  const [kriteria, batas] = await Promise.all([
    prisma.kriteriaScoring.findMany({ include: { opsi: true }, orderBy: { urutan: "asc" } }),
    ambilBatas(),
  ]);
  if (kriteria.length === 0) redirect(`${balik}?${pesan("err", "Kriteria penilaian belum diatur admin.")}`);

  // FR-07: tepat satu opsi untuk setiap kriteria
  const pilihan: { kriteriaId: number; opsiId: number; poin: number }[] = [];
  for (const k of kriteria) {
    const opsi = k.opsi.find((o) => o.id === Number(fd.get(`k_${k.id}`)));
    if (!opsi) redirect(`${balik}?${pesan("err", "Pilih satu jawaban untuk setiap kriteria.")}`);
    pilihan.push({ kriteriaId: k.id, opsiId: opsi.id, poin: opsi.nilaiPoin });
  }

  // Satu transaksi database: cek ulang ketersediaan, cek pengajuan ganda, lalu simpan
  const hasil = await prisma.$transaction(async (tx): Promise<{ ok?: string; err?: string }> => {
    const hewan = await tx.hewan.findUnique({ where: { id: hewanId } });
    if (!hewan || hewan.statusAdopsi !== "TERSEDIA") return { err: "Hewan tidak tersedia untuk diadopsi." };
    const aktif = await tx.pengajuanAdopsi.findFirst({
      where: { penggunaId, hewanId, tanggalKeputusan: null, statusPengajuan: { not: "DITOLAK" } },
    });
    if (aktif) return { err: "Pengajuan untuk hewan ini masih aktif." };

    const total = hitungSkor(pilihan.map((p) => p.poin));
    const baru = await tx.pengajuanAdopsi.create({
      data: { penggunaId, hewanId, totalSkor: total, statusPengajuan: statusAwal(total, batas), detail: { create: pilihan } },
    });
    return { ok: `Pengajuan ${kode(baru.id)} terkirim dengan skor ${total}.` };
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  if (hasil.err) redirect(`/dashboard?${pesan("err", hasil.err)}`);
  redirect(`/dashboard?${pesan("ok", hasil.ok as string)}`);
}

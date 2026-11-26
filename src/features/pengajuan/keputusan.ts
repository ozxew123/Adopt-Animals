"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/guard";
import { kode, pesan } from "@/lib/format";

type Keputusan = "DISETUJUI" | "DITOLAK";

// FR-14 dan FR-15, dalam satu transaksi. Baris hewan dikunci (FOR UPDATE) agar dua keputusan
// bersamaan untuk hewan yang sama tidak bisa sama-sama lolos (mencegah adopsi ganda).
export async function putuskan(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id"));
  const keputusan = fd.get("keputusan");
  const setuju = keputusan === "DISETUJUI";
  // const setuju = fd.get("keputusan") === "DISETUJUI";
  if (keputusan !== "DISETUJUI" && keputusan !== "DITOLAK") {
  redirect(`/admin/dashboard?${pesan("err", "Keputusan tidak terbaca. Coba lagi.")}`);
  }

  // console.log("=== DEBUG KEPUTUSAN ===");
  // console.log("ID:", id);
  // console.log("Keputusan:", keputusan);
  // console.log("Setuju:", setuju);
  // console.log("=======================");

  const hasil = await prisma.$transaction(async (tx): Promise<{ ok?: string; err?: string }> => {
    const awal = await tx.pengajuanAdopsi.findUnique({ where: { id }, select: { hewanId: true } });
    if (!awal) return { err: "Pengajuan tidak ditemukan." };
    await tx.$queryRaw`SELECT id_hewan FROM hewan WHERE id_hewan = ${awal.hewanId} FOR UPDATE`;

    const p = await tx.pengajuanAdopsi.findUnique({ where: { id }, include: { hewan: true } });
    if (!p || p.tanggalKeputusan) return { err: "Pengajuan sudah diputuskan." };
    if (setuju && p.hewan.statusAdopsi !== "TERSEDIA") return { err: `${p.hewan.namaHewan} sudah teradopsi.` };

    const sekarang = new Date();
    await tx.pengajuanAdopsi.update({ where: { id }, data: { statusPengajuan: setuju ? "DISETUJUI" : "DITOLAK", tanggalKeputusan: sekarang } });
    if (setuju) {
      await tx.hewan.update({ where: { id: p.hewanId }, data: { statusAdopsi: "TERADOPSI" } });
      // Pengajuan lain yang belum diputuskan untuk hewan yang sama ditolak otomatis
      await tx.pengajuanAdopsi.updateMany({
        where: { hewanId: p.hewanId, tanggalKeputusan: null, id: { not: id } },
        data: { statusPengajuan: "DITOLAK", tanggalKeputusan: sekarang },
      });
    }
    return { ok: setuju ? `${kode(id)} disetujui. Status ${p.hewan.namaHewan} menjadi Teradopsi.` : `${kode(id)} ditolak.` };
  });

  for (const p of ["/admin/dashboard", "/admin/riwayat", "/", "/dashboard"]) revalidatePath(p);
  redirect(`/admin/dashboard?${hasil.err ? pesan("err", hasil.err) : pesan("ok", hasil.ok as string)}`);
}

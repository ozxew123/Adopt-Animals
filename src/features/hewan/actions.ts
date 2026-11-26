"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/guard";
import { pesan } from "@/lib/format";
import { hapusFoto, simpanFoto } from "@/lib/upload";

export async function simpanHewan(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id")) || 0;
  const nama = String(fd.get("nama") ?? "").trim();
  const umur = Number(fd.get("umur"));
  const kategoriId = Number(fd.get("kategoriId"));
  const balik = (k: "ok" | "err", t: string) => redirect(`/admin/hewan?${pesan(k, t)}${k === "err" && id ? `&ubah=${id}` : ""}`);
  if (!nama || !Number.isInteger(umur) || umur < 1 || !kategoriId) balik("err", "Isi nama, kategori, dan umur (bulan) dengan benar.");

  const lama = id ? await prisma.hewan.findUnique({ where: { id } }) : null;
  let fotoHewan = lama?.fotoHewan ?? null;
  const file = fd.get("foto");
  if (file instanceof File && file.size > 0) {
    const f = await simpanFoto(file);
    if (f.err) balik("err", f.err);
    await hapusFoto(fotoHewan);
    fotoHewan = f.url ?? null;
  }

  const data = {
    namaHewan: nama, kategoriId, umurBulan: umur, fotoHewan,
    deskripsi: String(fd.get("deskripsi") ?? "").trim() || null,
    jenisKelamin: fd.get("jk") === "BETINA" ? ("BETINA" as const) : ("JANTAN" as const),
    statusAdopsi: fd.get("status") === "TERADOPSI" ? ("TERADOPSI" as const) : ("TERSEDIA" as const),
  };
  if (id) await prisma.hewan.update({ where: { id }, data });
  else await prisma.hewan.create({ data });
  revalidatePath("/");
  balik("ok", id ? "Data hewan diperbarui." : "Hewan ditambahkan.");
}

export async function hapusHewan(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id"));
  if ((await prisma.pengajuanAdopsi.count({ where: { hewanId: id } })) > 0)
    redirect(`/admin/hewan?${pesan("err", "Hewan tidak bisa dihapus karena sudah memiliki pengajuan.")}`);
  const h = await prisma.hewan.delete({ where: { id } });
  await hapusFoto(h.fotoHewan);
  revalidatePath("/");
  redirect(`/admin/hewan?${pesan("ok", "Data hewan dihapus.")}`);
}

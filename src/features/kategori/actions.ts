"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/guard";
import { pesan } from "@/lib/format";

const balik = (k: "ok" | "err", t: string): never => redirect(`/admin/kategori?${pesan(k, t)}`);

export async function tambahKategori(fd: FormData) {
  await wajibAdmin();
  const nama = String(fd.get("nama") ?? "").trim();
  if (!nama) balik("err", "Isi nama kategori.");
  if (await prisma.kategoriHewan.findUnique({ where: { namaKategori: nama } })) balik("err", "Kategori sudah ada.");
  await prisma.kategoriHewan.create({ data: { namaKategori: nama } });
  revalidatePath("/");
  balik("ok", "Kategori ditambahkan.");
}

export async function ubahKategori(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id"));
  const nama = String(fd.get("nama") ?? "").trim();
  if (!nama) balik("err", "Isi nama kategori.");
  const sama = await prisma.kategoriHewan.findUnique({ where: { namaKategori: nama } });
  if (sama && sama.id !== id) balik("err", "Nama kategori sudah dipakai.");
  await prisma.kategoriHewan.update({ where: { id }, data: { namaKategori: nama } });
  revalidatePath("/");
  balik("ok", "Kategori diperbarui.");
}

export async function hapusKategori(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id"));
  if ((await prisma.hewan.count({ where: { kategoriId: id } })) > 0) balik("err", "Kategori masih dipakai oleh data hewan.");
  await prisma.kategoriHewan.delete({ where: { id } });
  revalidatePath("/");
  balik("ok", "Kategori dihapus.");
}

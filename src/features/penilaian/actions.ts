"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/guard";
import { pesan } from "@/lib/format";

const balik = (k: "ok" | "err", t: string): never => redirect(`/admin/scoring?${pesan(k, t)}`);
const poinValid = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;

// Mengubah ambang batas sekaligus menyinkronkan status pengajuan yang belum diputuskan
export async function simpanBatas(fd: FormData) {
  await wajibAdmin();
  const lolos = Number(fd.get("lolos")), tolak = Number(fd.get("tolak"));
  if (!poinValid(lolos) || !poinValid(tolak) || tolak > lolos) balik("err", "Batas Ditolak tidak boleh lebih besar dari batas Lolos (angka 0 sampai 100).");
  const belum = { tanggalKeputusan: null };
  await prisma.$transaction([
    prisma.pengaturanScoring.upsert({ where: { id: 1 }, update: { batasLolos: lolos, batasTolak: tolak }, create: { id: 1, batasLolos: lolos, batasTolak: tolak } }),
    prisma.pengajuanAdopsi.updateMany({ where: { ...belum, totalSkor: { gt: lolos } }, data: { statusPengajuan: "LOLOS_KUALIFIKASI" } }),
    prisma.pengajuanAdopsi.updateMany({ where: { ...belum, totalSkor: { lt: tolak } }, data: { statusPengajuan: "DITOLAK" } }),
    prisma.pengajuanAdopsi.updateMany({ where: { ...belum, totalSkor: { gte: tolak, lte: lolos } }, data: { statusPengajuan: "MENUNGGU_REVIEW" } }),
  ]);
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  balik("ok", "Ambang batas disimpan. Status pengajuan yang belum diputuskan ikut diperbarui.");
}

export async function tambahKriteria(fd: FormData) {
  await wajibAdmin();
  const nama = String(fd.get("nama") ?? "").trim();
  if (!nama) balik("err", "Isi nama kriteria.");
  await prisma.kriteriaScoring.create({ data: { namaKriteria: nama, urutan: await prisma.kriteriaScoring.count() } });
  balik("ok", "Kriteria ditambahkan. Tambahkan opsi jawabannya agar muncul di kuesioner.");
}

export async function ubahKriteria(fd: FormData) {
  await wajibAdmin();
  const nama = String(fd.get("nama") ?? "").trim();
  if (!nama) balik("err", "Isi nama kriteria.");
  await prisma.kriteriaScoring.update({ where: { id: Number(fd.get("id")) }, data: { namaKriteria: nama } });
  balik("ok", "Nama kriteria diperbarui.");
}

export async function hapusKriteria(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id"));
  if ((await prisma.detailPenilaian.count({ where: { kriteriaId: id } })) > 0) balik("err", "Kriteria sudah dipakai pada pengajuan, jadi tidak bisa dihapus.");
  await prisma.kriteriaScoring.delete({ where: { id } });
  balik("ok", "Kriteria dihapus.");
}

export async function tambahOpsi(fd: FormData) {
  await wajibAdmin();
  const label = String(fd.get("label") ?? "").trim();
  const poin = Number(fd.get("poin"));
  if (!label || !poinValid(poin)) balik("err", "Isi jawaban dan poin (0 sampai 100).");
  await prisma.opsiKriteria.create({ data: { kriteriaId: Number(fd.get("kriteriaId")), keteranganJawaban: label, nilaiPoin: poin } });
  balik("ok", "Opsi jawaban ditambahkan.");
}

export async function ubahOpsi(fd: FormData) {
  await wajibAdmin();
  const label = String(fd.get("label") ?? "").trim();
  const poin = Number(fd.get("poin"));
  if (!label || !poinValid(poin)) balik("err", "Isi jawaban dan poin (0 sampai 100).");
  await prisma.opsiKriteria.update({ where: { id: Number(fd.get("id")) }, data: { keteranganJawaban: label, nilaiPoin: poin } });
  balik("ok", "Opsi diperbarui. Skor pengajuan lama tidak berubah, hanya pengajuan baru.");
}

export async function hapusOpsi(fd: FormData) {
  await wajibAdmin();
  const id = Number(fd.get("id"));
  if ((await prisma.detailPenilaian.count({ where: { opsiId: id } })) > 0) balik("err", "Opsi sudah dipakai pada pengajuan, jadi tidak bisa dihapus.");
  await prisma.opsiKriteria.delete({ where: { id } });
  balik("ok", "Opsi dihapus.");
}

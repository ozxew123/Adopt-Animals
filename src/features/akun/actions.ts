"use server";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pesan } from "@/lib/format";

async function masukDanArahkan(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) redirect(`/login?${pesan("err", "Email atau password salah.")}`);
    throw e;
  }
  const u = await prisma.pengguna.findUnique({ where: { email } });
  redirect(u?.role === "ADMIN" ? "/admin/dashboard" : "/");
}

// FR-02
export async function masuk(fd: FormData) {
  await masukDanArahkan(String(fd.get("email") ?? "").toLowerCase().trim(), String(fd.get("password") ?? ""));
}

// FR-01: role default = pengadopsi (tidak bisa dipilih dari form)
export async function daftar(fd: FormData) {
  const nama = String(fd.get("nama") ?? "").trim();
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const password = String(fd.get("password") ?? "");
  const gagal = (t: string) => redirect(`/register?${pesan("err", t)}`);

  if (!nama || !email) gagal("Nama lengkap dan email wajib diisi.");
  if (!/^\S+@\S+\.\S+$/.test(email)) gagal("Format email tidak valid.");
  if (password.length < 8) gagal("Password minimal 8 karakter.");
  if (await prisma.pengguna.findUnique({ where: { email } })) gagal("Email sudah terdaftar. Silakan masuk.");

  await prisma.pengguna.create({
    data: {
      namaLengkap: nama, email, password: await bcrypt.hash(password, 10), role: "PENGADOPSI",
      noTelp: String(fd.get("telp") ?? "").trim() || null, alamat: String(fd.get("alamat") ?? "").trim() || null,
    },
  });
  await masukDanArahkan(email, password);
}

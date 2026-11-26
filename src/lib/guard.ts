import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function wajibLogin() {
  const s = await auth();
  if (!s?.user) redirect("/login");
  return s.user;
}
export async function wajibPengadopsi() {
  const u = await wajibLogin();
  if (u.role !== "PENGADOPSI") redirect("/");
  return u;
}
export async function wajibAdmin() {
  const u = await wajibLogin();
  if (u.role !== "ADMIN") redirect("/login");
  return u;
}

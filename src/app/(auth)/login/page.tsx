import Link from "next/link";
import { masuk } from "@/features/akun/actions";
import { Ikon } from "@/components/ui/Ikon";
import { Notice } from "@/components/ui/Notice";

export const metadata = { title: "Masuk" };

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="auth">
      <div className="auth-head">
        <span className="brand-ic"><Ikon nama="paw" /></span>
        <h1>Masuk</h1>
        <p className="sub">Akun diperlukan untuk mengajukan adopsi. Pengadopsi dan admin masuk dari halaman yang sama.</p>
      </div>
      <Notice err={sp.err} />
      <form action={masuk} className="card">
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required />
        <button className="btn lg">Masuk</button>
        <p className="note" style={{ marginTop: 14, marginBottom: 0, textAlign: "center" }}>Belum punya akun? <Link href="/register">Daftar di sini</Link>.</p>
      </form>
    </div>
  );
}

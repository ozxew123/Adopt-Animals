import Link from "next/link";
import { daftar } from "@/features/akun/actions";
import { Ikon } from "@/components/ui/Ikon";
import { Notice } from "@/components/ui/Notice";

export const metadata = { title: "Buat akun" };

export default async function Register({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="auth">
      <div className="auth-head">
        <span className="brand-ic"><Ikon nama="paw" /></span>
        <h1>Buat akun</h1>
        <p className="sub">Data ini dilihat admin shelter saat meninjau pengajuanmu.</p>
      </div>
      <Notice err={sp.err} />
      <form action={daftar} className="card">
        <label htmlFor="nama">Nama lengkap</label><input id="nama" name="nama" autoComplete="name" required />
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password (minimal 8 karakter)</label><input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
        <label htmlFor="telp">No. telepon</label><input id="telp" name="telp" inputMode="tel" autoComplete="tel" />
        <label htmlFor="alamat">Alamat</label><input id="alamat" name="alamat" autoComplete="street-address" />
        <button className="btn lg">Buat Akun</button>
        <p className="note" style={{ marginTop: 14, marginBottom: 0, textAlign: "center" }}>Sudah punya akun? <Link href="/login">Masuk</Link>.</p>
      </form>
    </div>
  );
}

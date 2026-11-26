import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <div className="nf-art" aria-hidden="true">🐾</div>
      <h1>Halaman tidak ditemukan</h1>
      <p className="sub">Sepertinya halaman ini sudah pindah atau tidak pernah ada. Yuk kembali melihat hewan yang menunggu rumah.</p>
      <Link className="btn" href="/">Kembali ke katalog</Link>
    </main>
  );
}

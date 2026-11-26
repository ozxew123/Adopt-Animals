import { useEffect } from "react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Halaman tidak ditemukan | AdopsiKu";
  }, []);

  return (
    <main className="nf">
      <div className="nf-art" aria-hidden="true">🐾</div>
      <h1>Halaman tidak ditemukan</h1>
      <p className="sub">Sepertinya halaman ini sudah pindah atau tidak pernah ada. Yuk kembali melihat hewan yang menunggu rumah.</p>
      <Link className="btn" to="/">Kembali ke katalog</Link>
    </main>
  );
}

import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Ikon } from "./Ikon";

// Header dan footer publik (Ink editorial masthead & colophon)
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const u = (await auth())?.user;
  async function keluar() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <>
      <a className="skip" href="#isi">Lewati ke konten</a>
      <div className="utility">
        <div className="utility-in">
          <span className="tagline">Adopsi hewan terlantar, terbuka dan terpantau</span>
          <div className="utility-r">
            {u ? (
              <>
                {u.role === "ADMIN" && <Link href="/admin/dashboard" className="adm-link">Portal Admin</Link>}
                <span className="user-greeting">Halo, <b>{u.name?.split(" ")[0] || "Teman"}</b></span>
                <form action={keluar}>
                  <button type="submit" className="linkbtn">Keluar</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Masuk</Link>
                <Link href="/register">Daftar</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="top">
        <div className="header-in">
          <Link className="brand" href="/" aria-label="AdopsiKu, beranda">
            <span className="brand-ic"><Ikon nama="paw" /></span>
            <span className="bn">AdopsiKu</span>
          </Link>

          <form action="/" className="cari" role="search">
            <span className="cari-ic"><Ikon nama="search" /></span>
            <input name="q" placeholder="Cari nama atau jenis hewan..." aria-label="Cari hewan adopsi" />
            <button type="submit" className="btn cari-btn">Cari</button>
          </form>

          <nav className="menu" aria-label="Navigasi utama">
            <Link href="/">Beranda</Link>
            <Link href="/#katalog">Katalog</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main id="isi" className="wrap">{children}</main>

      <footer>
        <div className="foot-in">
          <div className="foot-main">
            <div className="foot-brand">
              <span className="brand-ic sm"><Ikon nama="paw" /></span>
              <b>AdopsiKu</b>
            </div>
            <p className="foot-desc">Platform adopsi hewan terlantar dengan penilaian kelayakan terbuka. Membantu setiap hewan menemukan rumah yang aman dan penuh perhatian.</p>
          </div>
          <div className="foot-meta">
            <span>© 2026 AdopsiKu</span>
            <span className="foot-credit">
              Photographs: <a href="https://commons.wikimedia.org/wiki/File:Cat_November_2010-1a.jpg" target="_blank" rel="noopener noreferrer">Alvesgaspar</a> (CC BY-SA 3.0, Wikimedia Commons)
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

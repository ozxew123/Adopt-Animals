import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Ikon } from "./Ikon";

// Header dan footer publik (dipakai layout (publik) dan (pengadopsi))
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const u = (await auth())?.user;
  async function keluar() { "use server"; await signOut({ redirectTo: "/login" }); }
  return (
    <>
      <a className="skip" href="#isi">Lewati ke konten</a>
      <div className="utility">
        <div className="utility-in">
          <span className="tagline">Adopsi hewan terlantar, gratis dan terpantau</span>
          <div className="utility-r">
            {u ? (
              <>
                {u.role === "ADMIN" && <Link href="/admin/dashboard">Admin</Link>}
                <form action={keluar}><button className="linkbtn">Keluar</button></form>
              </>
            ) : (<><Link href="/login">Masuk</Link><span className="dot" aria-hidden="true" /><Link href="/register">Daftar</Link></>)}
          </div>
        </div>
      </div>
      <header className="top">
        <div className="mainrow">
          <Link className="brand" href="/" aria-label="AdopsiKu, beranda">
            <span className="brand-ic"><Ikon nama="paw" /></span>
            <span><span className="bn"><span className="b1">ADOPSI</span><span className="b2">KU</span></span><small>Platform adopsi hewan terlantar</small></span>
          </Link>
          <nav className="menu" aria-label="Navigasi utama">
            <Link href="/">Home</Link>
            <Link href="/#katalog">Katalog</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>
        <div className="searchrow">
          <form action="/" className="cari" role="search">
            <input name="q" placeholder="Cari hewan adopsi" aria-label="Cari hewan adopsi" />
            <button className="btn">Cari</button>
          </form>
          <Link className="btn cta hide-sm" href="/#katalog">Lihat hewan</Link>
        </div>
      </header>
      <main id="isi" className="wrap">{children}</main>
      <footer><div className="foot-in"><b>AdopsiKu</b> · Platform adopsi hewan terlantar dengan penilaian kelayakan calon pengadopsi.</div></footer>
    </>
  );
}

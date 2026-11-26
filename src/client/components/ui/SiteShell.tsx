import { useEffect, useState, type FormEvent } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/client/lib/auth";
import { Ikon } from "./Ikon";

// Header dan footer publik (Ink editorial masthead & colophon)
export function SiteShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const qParam = sp.get("q") ?? "";
  const [cari, setCari] = useState(qParam);

  useEffect(() => {
    setCari(qParam);
  }, [qParam]);

  async function handleKeluar(e: FormEvent) {
    e.preventDefault();
    await logout();
    navigate("/login");
  }

  function handleCari(e: FormEvent) {
    e.preventDefault();
    const q = cari.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}#katalog` : "/#katalog");
  }

  return (
    <>
      <a className="skip" href="#isi">Lewati ke konten</a>
      <div className="utility">
        <div className="utility-in">
          <span className="tagline">Adopsi hewan terlantar, terbuka dan terpantau</span>
          <div className="utility-r">
            {user ? (
              <>
                {user.role === "ADMIN" && <Link to="/admin/dashboard" className="adm-link">Portal Admin</Link>}
                <span className="user-greeting">Halo, <b>{user.name?.split(" ")[0] || "Teman"}</b></span>
                <form onSubmit={handleKeluar}>
                  <button type="submit" className="linkbtn">Keluar</button>
                </form>
              </>
            ) : (
              <>
                <Link to="/login">Masuk</Link>
                <Link to="/register">Daftar</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="top">
        <div className="header-in">
          <Link className="brand" to="/" aria-label="AdopsiKu, beranda">
            <span className="brand-ic"><Ikon nama="paw" /></span>
            <span className="bn">AdopsiKu</span>
          </Link>

          <form onSubmit={handleCari} className="cari" role="search">
            <span className="cari-ic"><Ikon nama="search" /></span>
            <input
              name="q"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama atau jenis hewan..."
              aria-label="Cari hewan adopsi"
            />
            <button type="submit" className="btn cari-btn">Cari</button>
          </form>

          <nav className="menu" aria-label="Navigasi utama">
            <Link to="/">Beranda</Link>
            <Link to="/#katalog">Katalog</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main id="isi" className="wrap">
        <Outlet />
      </main>

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

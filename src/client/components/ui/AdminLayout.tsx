import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/client/lib/auth";
import { AdminNav } from "./AdminNav";
import { Ikon } from "./Ikon";

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function keluar() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="adm">
      <aside>
        <h2>AdopsiKu Admin</h2>
        <AdminNav />
        <div className="adm-foot">
          <Link to="/"><Ikon nama="globe" />Lihat situs</Link>
          <button type="button" className="linkbtn" onClick={keluar}>
            <Ikon nama="logout" />Keluar
          </button>
        </div>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

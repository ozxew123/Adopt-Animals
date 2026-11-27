import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/client/services";
import type { AuthUser, Role } from "@/client/services/AuthApiService";

export type { AuthUser, Role };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

export function RequireLogin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="wrap"><p className="note">Memuat sesi...</p></div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

// Tombol untuk berpindah akun: keluar dari sesi saat ini, lalu menuju halaman login.
// Tidak butuh endpoint/tabel baru karena memakai logout() yang sudah ada.
export function GantiAkunButton({ className = "btn sm out", children }: { className?: string; children?: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await logout();
    navigate("/login");
  }

  return (
    <button type="button" className={className} disabled={busy} onClick={handleClick}>
      {busy ? "Memproses..." : children ?? "Keluar & masuk sebagai pengadopsi"}
    </button>
  );
}

export function RequirePengadopsi({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="wrap"><p className="note">Memuat sesi...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "PENGADOPSI") {
    // Admin tidak lagi dilempar diam-diam ke beranda; dijelaskan dan diberi jalan keluar.
    return (
      <div className="card empty">
        <h2>Halaman ini khusus pengadopsi</h2>
        <p className="note">
          Kamu sedang masuk sebagai admin, jadi tidak bisa mengajukan adopsi atau membuka dashboard pengadopsi.
          Untuk mengajukan adopsi, keluar lalu masuk dengan akun pengadopsi.
        </p>
        <div className="inl" style={{ justifyContent: "center" }}>
          <GantiAkunButton className="btn sm" />
          <Link className="btn sm out" to="/admin/dashboard">Kembali ke Portal Admin</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="wrap"><p className="note">Memuat sesi...</p></div>;
  if (!user || user.role !== "ADMIN") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

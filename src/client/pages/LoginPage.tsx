import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, authApi } from "@/client/services";
import { useAuth } from "@/client/lib/auth";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";

export function LoginPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(sp.get("err"));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Masuk | AdopsiKu";
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      navigate(res.user.role === "ADMIN" ? "/admin/dashboard" : "/");
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Gagal masuk.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-head">
        <span className="brand-ic"><Ikon nama="paw" /></span>
        <h1>Masuk</h1>
        <p className="sub">Akun diperlukan untuk mengajukan adopsi. Pengadopsi dan admin masuk dari halaman yang sama.</p>
      </div>
      <Notice err={err} />
      <form onSubmit={handleSubmit} className="card">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn lg" disabled={submitting}>{submitting ? "Memproses..." : "Masuk"}</button>
        <p className="note" style={{ marginTop: 14, marginBottom: 0, textAlign: "center" }}>
          Belum punya akun? <Link to="/register">Daftar di sini</Link>.
        </p>
      </form>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, authApi } from "@/client/services";
import { useAuth } from "@/client/lib/auth";
import { Ikon } from "@/client/components/ui/Ikon";
import { Notice } from "@/client/components/ui/Notice";

export function RegisterPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [err, setErr] = useState<string | null>(sp.get("err"));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Buat akun | AdopsiKu";
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await authApi.register({ nama, email, password, telp, alamat });
      setUser(res.user);
      navigate("/");
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Gagal mendaftar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-head">
        <span className="brand-ic"><Ikon nama="paw" /></span>
        <h1>Buat akun</h1>
        <p className="sub">Data ini dilihat admin shelter saat meninjau pengajuanmu.</p>
      </div>
      <Notice err={err} />
      <form onSubmit={handleSubmit} className="card">
        <label htmlFor="nama">Nama lengkap</label>
        <input id="nama" name="nama" autoComplete="name" value={nama} onChange={(e) => setNama(e.target.value)} required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password (minimal 8 karakter)</label>
        <input id="password" name="password" type="password" minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label htmlFor="telp">No. telepon</label>
        <input id="telp" name="telp" inputMode="tel" autoComplete="tel" value={telp} onChange={(e) => setTelp(e.target.value)} />
        <label htmlFor="alamat">Alamat</label>
        <input id="alamat" name="alamat" autoComplete="street-address" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
        <button className="btn lg" disabled={submitting}>{submitting ? "Memproses..." : "Buat Akun"}</button>
        <p className="note" style={{ marginTop: 14, marginBottom: 0, textAlign: "center" }}>
          Sudah punya akun? <Link to="/login">Masuk</Link>.
        </p>
      </form>
    </div>
  );
}

import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, RequireAdmin, RequireLogin, RequirePengadopsi } from "./lib/auth";
import { SiteShell } from "./components/ui/SiteShell";
import { AdminLayout } from "./components/ui/AdminLayout";
import { BerandaPage } from "./pages/BerandaPage";
import { DetailHewanPage } from "./pages/DetailHewanPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AjukanPage } from "./pages/AjukanPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CetakPage } from "./pages/CetakPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminDetailPengajuanPage } from "./pages/AdminDetailPengajuanPage";
import { AdminComparePage } from "./pages/AdminComparePage";
import { AdminHewanPage } from "./pages/AdminHewanPage";
import { AdminKategoriPage } from "./pages/AdminKategoriPage";
import { AdminScoringPage } from "./pages/AdminScoringPage";
import { AdminRiwayatPage } from "./pages/AdminRiwayatPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function ScrollHandler() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollHandler />
        <Routes>
          <Route element={<SiteShell />}>
            <Route path="/" element={<BerandaPage />} />
            <Route path="/hewan/:id" element={<DetailHewanPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/adopsi/ajukan/:idHewan"
              element={
                <RequirePengadopsi>
                  <AjukanPage />
                </RequirePengadopsi>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequirePengadopsi>
                  <DashboardPage />
                </RequirePengadopsi>
              }
            />
          </Route>

          <Route
            path="/pengajuan/:id/cetak"
            element={
              <RequireLogin>
                <CetakPage />
              </RequireLogin>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="pengajuan/:id" element={<AdminDetailPengajuanPage />} />
            <Route path="compare/:hewanId" element={<AdminComparePage />} />
            <Route path="hewan" element={<AdminHewanPage />} />
            <Route path="kategori" element={<AdminKategoriPage />} />
            <Route path="scoring" element={<AdminScoringPage />} />
            <Route path="riwayat" element={<AdminRiwayatPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

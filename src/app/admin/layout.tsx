import Link from "next/link";
import { signOut } from "@/auth";
import { wajibAdmin } from "@/lib/guard";
import { AdminNav } from "@/components/ui/AdminNav";
import { Ikon } from "@/components/ui/Ikon";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await wajibAdmin(); // RBAC: seluruh /admin/* hanya untuk role ADMIN
  async function keluar() { "use server"; await signOut({ redirectTo: "/login" }); }
  return (
    <div className="adm">
      <aside>
        <h2>AdopsiKu Admin</h2>
        <AdminNav />
        <div className="adm-foot">
          <Link href="/"><Ikon nama="globe" />Lihat situs</Link>
          <form action={keluar}><button className="linkbtn"><Ikon nama="logout" />Keluar</button></form>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
